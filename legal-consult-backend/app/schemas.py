from typing import Optional, Literal
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

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
    description: Optional[str] = None
    preferred_window: Optional[str] = None


class RequestCreate(RequestBase):
    user_id: Optional[UUID] = None
    assigned_lawyer: Optional[UUID] = None


class RequestOut(RequestBase):
    id: UUID
    user_id: Optional[UUID] = None
    assigned_lawyer: Optional[UUID] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


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
