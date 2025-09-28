from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

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
