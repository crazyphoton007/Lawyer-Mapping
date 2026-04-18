"""add feedback table

Revision ID: 9b6f1c2d4e7a
Revises: 5e2fb3a4d991
Create Date: 2026-04-18 12:30:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = "9b6f1c2d4e7a"
down_revision = "5e2fb3a4d991"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "feedback" not in tables:
        op.create_table(
            "feedback",
            sa.Column("id", UUID(as_uuid=True), primary_key=True, nullable=False),
            sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("phone", sa.String(), nullable=True),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("platform", sa.String(length=32), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")),
        )


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "feedback" in tables:
        op.drop_table("feedback")
