# app/routers/requests.py
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.request import Request
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas import RequestCreate, RequestOut

router = APIRouter(prefix="/requests", tags=["requests"])

ALLOWED_STATUSES = (
    "pending",
    "awaiting_payment",
    "paid",
    "assigned",
    "calling",
    "completed",
)


@router.get("/", response_model=list[RequestOut])
def list_requests(
    status: str | None = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Request)
        .where(Request.user_id == current_user.id)
        .order_by(Request.created_at.desc())
    )

    if status:
        stmt = stmt.where(Request.status == status)

    rows = db.execute(stmt).scalars().all()
    return rows


@router.post("/", response_model=RequestOut, status_code=201)
def create_request(
    payload: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = Request(
        user_id=current_user.id,
        category=payload.category,
        description=payload.details,
        preferred_window=payload.preferred_window,
        status="pending",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.get("/{request_id}", response_model=RequestOut)
def get_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = db.get(Request, request_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Request not found")

    if rec.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")

    return rec


@router.patch("/{request_id}/status", response_model=RequestOut)
def update_status(
    request_id: UUID,
    status: str = Query(..., description="pending|awaiting_payment|paid|assigned|calling|completed"),
    db: Session = Depends(get_db),
):
    if status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")

    rec = db.get(Request, request_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Request not found")

    rec.status = status
    db.commit()
    db.refresh(rec)
    return rec