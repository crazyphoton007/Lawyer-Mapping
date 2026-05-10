"""add token version to users

Revision ID: a8d4f0c9b2e1
Revises: 9b6f1c2d4e7a
Create Date: 2026-05-10 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "a8d4f0c9b2e1"
down_revision = "9b6f1c2d4e7a"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("users")}

    if "token_version" not in columns:
        op.add_column(
            "users",
            sa.Column("token_version", sa.Integer(), nullable=False, server_default="0"),
        )


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {col["name"] for col in inspector.get_columns("users")}

    if "token_version" in columns:
        op.drop_column("users", "token_version")
