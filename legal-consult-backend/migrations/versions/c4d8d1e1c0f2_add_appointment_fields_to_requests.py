"""add appointment fields to requests

Revision ID: c4d8d1e1c0f2
Revises: 7b9e9b1e2f41
Create Date: 2026-04-13 18:45:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c4d8d1e1c0f2"
down_revision = "7b9e9b1e2f41"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("requests")}

    if "scheduled_for" not in columns:
        op.add_column("requests", sa.Column("scheduled_for", sa.DateTime(), nullable=True))

    if "appointment_mode" not in columns:
        op.add_column("requests", sa.Column("appointment_mode", sa.String(), nullable=True))

    if "appointment_notes" not in columns:
        op.add_column("requests", sa.Column("appointment_notes", sa.Text(), nullable=True))


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("requests")}

    if "appointment_notes" in columns:
        op.drop_column("requests", "appointment_notes")

    if "appointment_mode" in columns:
        op.drop_column("requests", "appointment_mode")

    if "scheduled_for" in columns:
        op.drop_column("requests", "scheduled_for")
