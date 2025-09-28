import uuid
from typing import Optional

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

UUID_PK = PG_UUID(as_uuid=True)


class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[uuid.UUID] = mapped_column(UUID_PK, primary_key=True, default=uuid.uuid4)

    # generic reference to the owning entity (e.g., 'request', 'article')
    entity_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID_PK, nullable=True)

    s3_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mime: Mapped[Optional[str]] = mapped_column(String, nullable=True)
