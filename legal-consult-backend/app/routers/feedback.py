from typing import Optional

from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.feedback import Feedback
from app.schemas import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=FeedbackOut, status_code=201)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    # Keep this endpoint permissive for now: feedback can come from authenticated
    # users or from the app as a lightweight support signal.
    rec = Feedback(
        user_id=payload.user_id,
        phone=(payload.phone or "").strip() or None,
        message=payload.message.strip(),
        platform=(payload.platform or "").strip() or None,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
