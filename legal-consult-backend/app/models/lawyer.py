# app/models/lawyer.py
import uuid
from typing import Optional

from sqlalchemy import String, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

UUID_PK = PG_UUID(as_uuid=True)


class Lawyer(Base):
    __tablename__ = "lawyers"

    id: Mapped[uuid.UUID] = mapped_column(UUID_PK, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID_PK, ForeignKey("users.id"), nullable=True, index=True
    )
    specialties: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), nullable=True)
    rating: Mapped[Optional[float]] = mapped_column(Numeric(2, 1), nullable=True)
    availability_json: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Relations
    user: Mapped["User"] = relationship("User", back_populates="lawyer_profile")
    assigned_requests: Mapped[list["Request"]] = relationship(
        "Request", back_populates="assigned_lawyer_obj"
    )
