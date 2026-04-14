"""add shared lawyer fields to requests

Revision ID: 5e2fb3a4d991
Revises: c4d8d1e1c0f2
Create Date: 2026-04-13 19:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "5e2fb3a4d991"
down_revision = "c4d8d1e1c0f2"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("requests")}

    if "shared_lawyer_name" not in columns:
        op.add_column("requests", sa.Column("shared_lawyer_name", sa.String(), nullable=True))

    if "shared_lawyer_phone" not in columns:
        op.add_column("requests", sa.Column("shared_lawyer_phone", sa.String(), nullable=True))

    if "shared_lawyer_email" not in columns:
        op.add_column("requests", sa.Column("shared_lawyer_email", sa.String(), nullable=True))

    if "shared_lawyer_note" not in columns:
        op.add_column("requests", sa.Column("shared_lawyer_note", sa.Text(), nullable=True))


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("requests")}

    if "shared_lawyer_note" in columns:
        op.drop_column("requests", "shared_lawyer_note")

    if "shared_lawyer_email" in columns:
        op.drop_column("requests", "shared_lawyer_email")

    if "shared_lawyer_phone" in columns:
        op.drop_column("requests", "shared_lawyer_phone")

    if "shared_lawyer_name" in columns:
        op.drop_column("requests", "shared_lawyer_name")
