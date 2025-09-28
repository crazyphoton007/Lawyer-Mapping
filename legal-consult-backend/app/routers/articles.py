from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.db import get_db
from app.models.article import Article
from app.schemas import ArticleOut

router = APIRouter(prefix="/articles", tags=["articles"])

@router.get("/", response_model=List[ArticleOut])
def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    query: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    stmt = select(Article)
    if query:
        like = f"%{query.lower()}%"
        stmt = stmt.where(
            or_(
                Article.title.ilike(like),
                Article.summary.ilike(like),
                Article.court.ilike(like),
            )
        )
    if tag:
        stmt = stmt.where(Article.tags.contains([tag]))

    offset = (page - 1) * page_size
    stmt = stmt.order_by(Article.created_at.desc()).offset(offset).limit(page_size)
    return db.execute(stmt).scalars().all()
