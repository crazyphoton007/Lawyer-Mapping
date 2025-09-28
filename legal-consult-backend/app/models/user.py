# app/models/user.py
import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import String, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

UUID_PK = PG_UUID(as_uuid=True)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID_PK, primary_key=True, default=uuid.uuid4)
    name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    role: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # 'user' | 'lawyer' | 'admin'
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    lawyer_profile: Mapped["Lawyer"] = relationship(
        "Lawyer", back_populates="user", uselist=False
    )
    requests: Mapped[List["Request"]] = relationship(
        "Request", back_populates="user", cascade="all,delete-orphan"
    )
