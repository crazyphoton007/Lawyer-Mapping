# app/schemas/request.py
from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


class RequestBase(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    preferred_window: Optional[str] = None
    preferred_city: Optional[str] = None


class RequestCreate(BaseModel):
    category: str
    details: str
    preferred_window: Optional[str] = None
    preferred_city: Optional[str] = None


class RequestOut(RequestBase):
    id: UUID
    user_id: Optional[UUID] = None
    assigned_lawyer: Optional[UUID] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
