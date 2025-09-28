# app/schemas/request.py
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

# --- Existing Article schema ---
class ArticleOut(BaseModel):
    id: UUID
    title: str
    year: Optional[int] = None
    court: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[list[str]] = None

    class Config:
        from_attributes = True


# --- New Request schemas ---
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
