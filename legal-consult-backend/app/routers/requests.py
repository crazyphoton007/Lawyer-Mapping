# app/routers/requests.py
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db import get_db
from app.models.request import Request
from app.schemas import RequestCreate, RequestOut

router = APIRouter(prefix="/requests", tags=["requests"])

@router.get("/", response_model=list[RequestOut])
def list_requests(
    status: str | None = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
):
    stmt = select(Request).order_by(Request.created_at.desc())
    if status:
        stmt = stmt.filter(Request.status == status)
    rows = db.execute(stmt).scalars().all()
    return rows

@router.post("/", response_model=RequestOut, status_code=201)
def create_request(payload: RequestCreate, db: Session = Depends(get_db)):
    rec = Request(
        user_id=payload.user_id,
        description=payload.description,
        preferred_window=payload.preferred_window,
        status="pending",
        assigned_lawyer=payload.assigned_lawyer,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

@router.get("/{request_id}", response_model=RequestOut)
def get_request(request_id: UUID, db: Session = Depends(get_db)):
    rec = db.get(Request, request_id)
    if not rec:
        raise HTTPException(404, "Request not found")
    return rec

@router.patch("/{request_id}/status", response_model=RequestOut)
def update_status(
    request_id: UUID,
    status: str = Query(..., description="pending|assigned|calling|completed"),
    db: Session = Depends(get_db),
):
    if status not in ("pending", "assigned", "calling", "completed"):
        raise HTTPException(400, "Invalid status")
    rec = db.get(Request, request_id)
    if not rec:
        raise HTTPException(404, "Request not found")
    rec.status = status
    db.commit()
    db.refresh(rec)
    return rec
