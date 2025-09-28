import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Numeric, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

UUID_PK = PG_UUID(as_uuid=True)


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID_PK, primary_key=True, default=uuid.uuid4)

    request_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID_PK, ForeignKey("requests.id"), nullable=True
    )
    provider_ref: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), default=300.00)

    # pending | paid | failed
    status: Mapped[str] = mapped_column(String, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("status IN ('pending','paid','failed')", name="payments_status_chk"),
    )

    # Relationships
    request: Mapped["Request"] = relationship("Request", back_populates="payment")
