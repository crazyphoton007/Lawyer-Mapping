# app/schemas.py
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


# ---------- Articles ----------
class ArticleOut(BaseModel):
    id: UUID
    title: str
    year: Optional[int] = None
    court: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[list[str]] = None

    class Config:
        from_attributes = True


# ---------- Requests ----------
class RequestBase(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    preferred_window: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    appointment_mode: Optional[str] = None
    appointment_notes: Optional[str] = None


class RequestCreate(BaseModel):
    category: str
    details: str
    preferred_window: Optional[str] = None


class RequestOut(RequestBase):
    id: UUID
    user_id: Optional[UUID] = None
    assigned_lawyer: Optional[UUID] = None
    assigned_lawyer_name: Optional[str] = None
    assigned_lawyer_phone: Optional[str] = None
    shared_lawyer_email: Optional[str] = None
    shared_lawyer_note: Optional[str] = None
    assigned_lawyer_specialties: Optional[list[str]] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ScheduleAppointmentIn(BaseModel):
    scheduled_for: datetime
    appointment_mode: Literal["call", "video", "in_person"] = "call"
    appointment_notes: Optional[str] = None


class ShareLawyerDetailsIn(BaseModel):
    lawyer_name: str
    lawyer_phone: Optional[str] = None
    lawyer_email: Optional[str] = None
    lawyer_note: Optional[str] = None


# ---------- Users / Profile ----------
class UserOut(BaseModel):
    id: UUID
    phone: str
    name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    area: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[Literal["Male", "Female", "Other"]] = None
    age: Optional[int] = Field(default=None, ge=1, le=120)
    area: Optional[str] = None

    class Config:
        from_attributes = True
