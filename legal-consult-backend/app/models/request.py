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

    category: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # pending | assigned | awaiting_payment | paid | appointment_scheduled
    # | calling | in_progress | completed | closed | cancelled | voided
    status: Mapped[str] = mapped_column(String, default="pending")

    assigned_lawyer: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID_PK, ForeignKey("lawyers.id"), nullable=True
    )
    scheduled_for: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    appointment_mode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    appointment_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    shared_lawyer_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    shared_lawyer_phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    shared_lawyer_email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    shared_lawyer_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preferred_window: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    preferred_city: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','assigned','awaiting_payment','paid','appointment_scheduled','calling','in_progress','completed','closed','cancelled','voided')",
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

    @property
    def assigned_lawyer_name(self) -> Optional[str]:
        if self.shared_lawyer_name:
            return self.shared_lawyer_name
        lawyer = getattr(self, "assigned_lawyer_obj", None)
        user = getattr(lawyer, "user", None) if lawyer else None
        return getattr(user, "name", None) or ("CaseFit Legal Expert" if lawyer else None)

    @property
    def assigned_lawyer_phone(self) -> Optional[str]:
        if self.shared_lawyer_phone:
            return self.shared_lawyer_phone
        lawyer = getattr(self, "assigned_lawyer_obj", None)
        user = getattr(lawyer, "user", None) if lawyer else None
        return getattr(user, "phone", None)

    @property
    def assigned_lawyer_specialties(self) -> list[str]:
        lawyer = getattr(self, "assigned_lawyer_obj", None)
        return list(getattr(lawyer, "specialties", None) or [])
