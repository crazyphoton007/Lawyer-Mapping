# app/routers/requests.py
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.lawyer import Lawyer
from app.models.request import Request
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas import (
    RequestCreate,
    RequestOut,
    ScheduleAppointmentIn,
    ShareLawyerDetailsIn,
)
from app.services.request_notifications import NewRequestAlert, send_new_request_email

router = APIRouter(prefix="/requests", tags=["requests"])

ALLOWED_STATUSES = (
    "pending",
    "assigned",
    "awaiting_payment",
    "paid",
    "appointment_scheduled",
    "calling",
    "in_progress",
    "completed",
    "closed",
    "cancelled",
)


class AssignLawyerIn(BaseModel):
    request_id: UUID
    lawyer_id: UUID


def _load_request_with_lawyer(db: Session, request_id: UUID) -> Request | None:
    stmt = (
        select(Request)
        .options(joinedload(Request.assigned_lawyer_obj).joinedload(Lawyer.user))
        .where(Request.id == request_id)
    )
    return db.execute(stmt).scalars().first()


@router.get("/", response_model=list[RequestOut])
def list_requests(
    status: str | None = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Request)
        .options(
            joinedload(Request.assigned_lawyer_obj).joinedload(Lawyer.user)
        )
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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer_name = current_user.name
    customer_phone = current_user.phone
    customer_email = current_user.email
    customer_area = current_user.area

    rec = Request(
        user_id=current_user.id,
        category=payload.category,
        description=payload.details,
        preferred_window=payload.preferred_window,
        preferred_city=payload.preferred_city.strip() if payload.preferred_city else None,
        status="pending",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    alert = NewRequestAlert(
        request_id=rec.id,
        category=rec.category,
        description=rec.description,
        status=rec.status,
        preferred_city=rec.preferred_city,
        preferred_window=rec.preferred_window,
        created_at=rec.created_at,
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_email=customer_email,
        customer_area=customer_area,
    )
    background_tasks.add_task(send_new_request_email, alert)
    return rec


@router.get("/{request_id}", response_model=RequestOut)
def get_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = _load_request_with_lawyer(db, request_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Request not found")

    if rec.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")

    return rec


@router.patch("/{request_id}/status", response_model=RequestOut)
def update_status(
    request_id: UUID,
    status: str = Query(
        ...,
        description=(
            "pending|assigned|awaiting_payment|paid|appointment_scheduled|"
            "calling|in_progress|completed|closed|cancelled"
        ),
    ),
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


@router.post("/assign-lawyer", response_model=RequestOut)
def assign_lawyer(
    payload: AssignLawyerIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = db.get(Request, payload.request_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Request not found")

    lawyer = db.get(Lawyer, payload.lawyer_id)
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found")

    if rec.status not in ("paid", "assigned"):
        raise HTTPException(
            status_code=400,
            detail="Lawyer can only be assigned after payment.",
        )

    rec.assigned_lawyer = lawyer.id
    rec.status = "assigned"

    db.commit()
    db.refresh(rec)
    return rec


@router.post("/{request_id}/schedule", response_model=RequestOut)
def schedule_appointment(
    request_id: UUID,
    payload: ScheduleAppointmentIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = db.get(Request, request_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Request not found")

    if rec.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")

    if not rec.assigned_lawyer:
        raise HTTPException(
            status_code=400,
            detail="A lawyer must be assigned before scheduling an appointment.",
        )

    if rec.status not in ("assigned", "appointment_scheduled", "paid"):
        raise HTTPException(
            status_code=400,
            detail="Appointment can only be scheduled after assignment/payment.",
        )

    rec.scheduled_for = payload.scheduled_for
    rec.appointment_mode = payload.appointment_mode
    rec.appointment_notes = payload.appointment_notes
    rec.status = "appointment_scheduled"

    db.commit()

    return _load_request_with_lawyer(db, request_id)


@router.post("/{request_id}/share-lawyer-details", response_model=RequestOut)
def share_lawyer_details(
    request_id: UUID,
    payload: ShareLawyerDetailsIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = db.get(Request, request_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Request not found")

    if getattr(current_user, "role", None) not in ("admin", "lawyer"):
        raise HTTPException(
            status_code=403,
            detail="Only team members can share lawyer details.",
        )

    if rec.status != "appointment_scheduled":
        raise HTTPException(
            status_code=400,
            detail="Lawyer details can be shared after the appointment is scheduled.",
        )

    rec.shared_lawyer_name = payload.lawyer_name.strip()
    rec.shared_lawyer_phone = payload.lawyer_phone.strip() if payload.lawyer_phone else None
    rec.shared_lawyer_email = payload.lawyer_email.strip() if payload.lawyer_email else None
    rec.shared_lawyer_note = payload.lawyer_note.strip() if payload.lawyer_note else None

    db.commit()
    return _load_request_with_lawyer(db, request_id)
