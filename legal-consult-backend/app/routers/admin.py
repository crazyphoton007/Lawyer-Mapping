from pathlib import Path
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.lawyer import Lawyer
from app.models.request import Request
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas import ScheduleAppointmentIn, ShareLawyerDetailsIn
from app.services.case_reference import derive_case_reference

router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_UI_PATH = Path(__file__).resolve().parents[1] / "static" / "admin.html"

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


class AdminStatusUpdateIn(BaseModel):
    status: str


class AdminAssignLawyerIn(BaseModel):
    lawyer_id: UUID


class AdminRefreshSessionIn(BaseModel):
    phone: str


def require_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user


def parse_admin_date(value: str | None, field_name: str) -> datetime | None:
    if not value:
        return None

    try:
        return datetime.fromisoformat(value)
    except ValueError:
        try:
            return datetime.strptime(value, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid {field_name}.")


def require_team_user(current_user: User = Depends(get_current_user)) -> User:
    if getattr(current_user, "role", None) not in ("admin", "lawyer"):
        raise HTTPException(status_code=403, detail="Team access required.")
    return current_user


def find_user_by_phone(db: Session, phone: str) -> User | None:
    clean_phone = phone.strip()
    if not clean_phone:
        raise HTTPException(status_code=400, detail="Phone is required.")

    exact = db.execute(select(User).where(User.phone == clean_phone)).scalars().first()
    if exact:
        return exact

    digits = "".join(ch for ch in clean_phone if ch.isdigit())
    if not digits:
        return None

    users = db.execute(select(User).where(User.phone.is_not(None))).scalars().all()
    matches = [
        user
        for user in users
        if "".join(ch for ch in (user.phone or "") if ch.isdigit()).endswith(digits)
    ]
    if len(matches) > 1:
        raise HTTPException(
            status_code=409,
            detail="Multiple users match this phone. Enter the full saved number.",
        )
    return matches[0] if matches else None


def load_request(db: Session, request_id: UUID) -> Request | None:
    stmt = (
        select(Request)
        .options(
            joinedload(Request.user),
            joinedload(Request.assigned_lawyer_obj).joinedload(Lawyer.user),
        )
        .where(Request.id == request_id)
    )
    return db.execute(stmt).scalars().first()


def serialize_request(req: Request) -> dict:
    user = getattr(req, "user", None)
    return {
        "id": str(req.id),
        "case_reference": derive_case_reference(req.id),
        "status": req.status,
        "category": req.category,
        "description": req.description,
        "preferred_window": req.preferred_window,
        "preferred_city": req.preferred_city,
        "created_at": req.created_at.isoformat() if req.created_at else None,
        "scheduled_for": req.scheduled_for.isoformat() if req.scheduled_for else None,
        "appointment_mode": req.appointment_mode,
        "appointment_notes": req.appointment_notes,
        "assigned_lawyer": str(req.assigned_lawyer) if req.assigned_lawyer else None,
        "assigned_lawyer_name": req.assigned_lawyer_name,
        "assigned_lawyer_phone": req.assigned_lawyer_phone,
        "assigned_lawyer_specialties": req.assigned_lawyer_specialties,
        "shared_lawyer_email": req.shared_lawyer_email,
        "shared_lawyer_note": req.shared_lawyer_note,
        "customer_name": getattr(user, "name", None),
        "customer_phone": getattr(user, "phone", None),
        "customer_area": getattr(user, "area", None),
    }


def serialize_lawyer(lawyer: Lawyer) -> dict:
    user = getattr(lawyer, "user", None)
    return {
        "id": str(lawyer.id),
        "name": getattr(user, "name", None) or "CaseFit Legal Expert",
        "phone": getattr(user, "phone", None),
        "email": getattr(user, "email", None),
        "specialties": list(lawyer.specialties or []),
        "rating": float(lawyer.rating) if lawyer.rating is not None else None,
    }


@router.get("")
def admin_ui():
    return FileResponse(ADMIN_UI_PATH)


@router.get("/requests")
def admin_list_requests(
    status: str | None = Query(None),
    search: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    sort: str = Query("newest"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=10, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_user),
):
    start_date = parse_admin_date(date_from, "date_from")
    end_date = parse_admin_date(date_to, "date_to")
    if end_date:
        end_date = end_date + timedelta(days=1)

    stmt = (
        select(Request)
        .options(
            joinedload(Request.user),
            joinedload(Request.assigned_lawyer_obj).joinedload(Lawyer.user),
        )
    )
    if start_date:
        stmt = stmt.where(Request.created_at >= start_date)
    if end_date:
        stmt = stmt.where(Request.created_at < end_date)

    rows = db.execute(stmt).scalars().all()

    def matches_search(req: Request) -> bool:
        if not search:
            return True

        query = search.strip().lower()
        digits = "".join(ch for ch in query if ch.isdigit())
        terms = [query]
        if digits and digits != query:
            terms.append(digits)

        case_reference = derive_case_reference(req.id).lower()
        user = getattr(req, "user", None)
        values = (
            case_reference,
            getattr(user, "phone", None),
            getattr(user, "name", None),
            req.category,
            req.description,
            req.preferred_city,
        )
        return any(
            term and any(value and term in str(value).lower() for value in values)
            for term in terms
        )

    rows = [req for req in rows if matches_search(req)]

    status_counts = {allowed_status: 0 for allowed_status in ALLOWED_STATUSES}
    for req in rows:
        if req.status in status_counts:
            status_counts[req.status] += 1
        else:
            status_counts[req.status] = status_counts.get(req.status, 0) + 1

    if status:
        rows = [req for req in rows if req.status == status]

    if sort == "oldest":
        rows.sort(key=lambda req: req.created_at or datetime.min)
    elif sort == "scheduled":
        rows.sort(key=lambda req: (req.scheduled_for is None, req.scheduled_for or datetime.max))
    else:
        rows.sort(key=lambda req: req.created_at or datetime.min, reverse=True)

    total = len(rows)
    start = (page - 1) * page_size
    paged_rows = rows[start : start + page_size]

    return {
        "viewer_role": getattr(current_user, "role", None),
        "requests": [serialize_request(req) for req in paged_rows],
        "summary": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
            "status_counts": status_counts,
            "all_count": sum(status_counts.values()),
        },
    }


@router.get("/lawyers")
def admin_list_lawyers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_user),
):
    stmt = select(Lawyer).options(joinedload(Lawyer.user)).order_by(Lawyer.id)
    lawyers = db.execute(stmt).scalars().all()
    return {"lawyers": [serialize_lawyer(lawyer) for lawyer in lawyers]}


@router.post("/users/refresh-session")
def admin_refresh_user_session(
    payload: AdminRefreshSessionIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_user),
):
    user = find_user_by_phone(db, payload.phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    previous_version = int(getattr(user, "token_version", 0) or 0)
    user.token_version = previous_version + 1
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "ok": True,
        "updated_by": str(current_user.id),
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "role": user.role,
            "previous_token_version": previous_version,
            "token_version": user.token_version,
        },
    }


@router.patch("/requests/{request_id}/status")
def admin_update_status(
    request_id: UUID,
    payload: AdminStatusUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_user),
):
    if payload.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status.")

    req = db.get(Request, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    req.status = payload.status
    db.commit()
    return serialize_request(load_request(db, request_id))


@router.post("/requests/{request_id}/assign-lawyer")
def admin_assign_lawyer(
    request_id: UUID,
    payload: AdminAssignLawyerIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_user),
):
    req = db.get(Request, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    lawyer = db.get(Lawyer, payload.lawyer_id)
    if not lawyer:
        raise HTTPException(status_code=404, detail="Lawyer not found.")

    req.assigned_lawyer = lawyer.id
    req.status = "assigned"
    db.commit()
    return serialize_request(load_request(db, request_id))


@router.post("/requests/{request_id}/schedule")
def admin_schedule_appointment(
    request_id: UUID,
    payload: ScheduleAppointmentIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_user),
):
    req = db.get(Request, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    req.scheduled_for = payload.scheduled_for
    req.appointment_mode = payload.appointment_mode
    req.appointment_notes = payload.appointment_notes
    req.status = "appointment_scheduled"
    db.commit()
    return serialize_request(load_request(db, request_id))


@router.post("/requests/{request_id}/share-lawyer-details")
def admin_share_lawyer_details(
    request_id: UUID,
    payload: ShareLawyerDetailsIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_user),
):
    req = db.get(Request, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    req.shared_lawyer_name = payload.lawyer_name.strip()
    req.shared_lawyer_phone = payload.lawyer_phone.strip() if payload.lawyer_phone else None
    req.shared_lawyer_email = payload.lawyer_email.strip() if payload.lawyer_email else None
    req.shared_lawyer_note = payload.lawyer_note.strip() if payload.lawyer_note else None
    db.commit()
    return serialize_request(load_request(db, request_id))
