# app/models/request.py
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

UUID_PK = PG_UUID(as_uuid=True)

class Request(Base):
    __tablename__ = "requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID_PK, primary_key=True, default=uuid.uuid4)

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID_PK, ForeignKey("users.id"), nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # pending | assigned | calling | completed
    status: Mapped[str] = mapped_column(String, default="pending")

    assigned_lawyer: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID_PK, ForeignKey("lawyers.id"), nullable=True
    )
    preferred_window: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','assigned','calling','completed')",
            name="requests_status_chk",
        ),
    )

    # relationships
    user: Mapped["User"] = relationship("User", back_populates="requests")
    assigned_lawyer_obj: Mapped["Lawyer"] = relationship(
        "Lawyer", back_populates="assigned_requests"
    )
    payment: Mapped[Optional["Payment"]] = relationship(
        "Payment", back_populates="request", uselist=False, cascade="all,delete-orphan"
    )
