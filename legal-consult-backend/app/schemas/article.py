from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID

class ArticleOut(BaseModel):
    id: UUID
    title: str
    year: Optional[int] = None
    court: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None

    class Config:
        from_attributes = True
