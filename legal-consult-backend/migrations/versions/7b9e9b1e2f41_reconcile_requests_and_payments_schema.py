"""reconcile requests and payments schema

Revision ID: 7b9e9b1e2f41
Revises: f2dc57fe28ea
Create Date: 2026-04-12 20:05:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "7b9e9b1e2f41"
down_revision = "f2dc57fe28ea"
branch_labels = None
depends_on = None


REQUEST_STATUS_CHECK = (
    "status IN ("
    "'pending','assigned','awaiting_payment','paid',"
    "'appointment_scheduled','calling','in_progress',"
    "'completed','closed','cancelled'"
    ")"
)


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    request_cols = {col["name"] for col in inspector.get_columns("requests")}
    payment_cols = {col["name"] for col in inspector.get_columns("payments")}

    if "category" not in request_cols:
        op.add_column("requests", sa.Column("category", sa.String(), nullable=True))

    if "provider_ref" not in payment_cols:
        op.add_column("payments", sa.Column("provider_ref", sa.String(), nullable=True))

    # Backfill the new provider_ref from legacy Razorpay columns when present.
    legacy_sources = [
        name for name in ("razorpay_payment_id", "razorpay_order_id") if name in payment_cols
    ]
    if legacy_sources:
        source_sql = ", ".join(legacy_sources)
        bind.execute(
            sa.text(
                f"""
                UPDATE payments
                SET provider_ref = COALESCE(provider_ref, {source_sql})
                WHERE provider_ref IS NULL
                """
            )
        )

    # Normalize the requests status constraint so fresh and existing databases agree.
    check_names = {chk["name"] for chk in inspector.get_check_constraints("requests")}
    if "requests_status_chk" in check_names:
        op.drop_constraint("requests_status_chk", "requests", type_="check")

    op.create_check_constraint("requests_status_chk", "requests", REQUEST_STATUS_CHECK)


def downgrade():
    inspector = sa.inspect(op.get_bind())
    payment_cols = {col["name"] for col in inspector.get_columns("payments")}

    op.drop_constraint("requests_status_chk", "requests", type_="check")
    op.create_check_constraint(
        "requests_status_chk",
        "requests",
        "status IN ('pending','assigned','calling','completed')",
    )

    if "provider_ref" in payment_cols:
        op.drop_column("payments", "provider_ref")
