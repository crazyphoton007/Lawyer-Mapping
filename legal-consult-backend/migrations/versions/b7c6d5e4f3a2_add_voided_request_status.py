"""add voided request status

Revision ID: b7c6d5e4f3a2
Revises: a8d4f0c9b2e1
Create Date: 2026-05-10 00:00:00.000000
"""

from alembic import op


revision = "b7c6d5e4f3a2"
down_revision = "a8d4f0c9b2e1"
branch_labels = None
depends_on = None


ACTIVE_REQUEST_STATUS_CHECK = (
    "status IN ("
    "'pending','assigned','awaiting_payment','paid',"
    "'appointment_scheduled','calling','in_progress',"
    "'completed','closed','cancelled'"
    ")"
)

VOIDABLE_REQUEST_STATUS_CHECK = (
    "status IN ("
    "'pending','assigned','awaiting_payment','paid',"
    "'appointment_scheduled','calling','in_progress',"
    "'completed','closed','cancelled','voided'"
    ")"
)


def upgrade():
    op.drop_constraint("requests_status_chk", "requests", type_="check")
    op.create_check_constraint("requests_status_chk", "requests", VOIDABLE_REQUEST_STATUS_CHECK)


def downgrade():
    op.execute("UPDATE requests SET status = 'cancelled' WHERE status = 'voided'")
    op.drop_constraint("requests_status_chk", "requests", type_="check")
    op.create_check_constraint("requests_status_chk", "requests", ACTIVE_REQUEST_STATUS_CHECK)
