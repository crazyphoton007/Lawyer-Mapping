# migrations/versions/0002_requests_relational.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = "0002_requests_relational"
down_revision = "ba6577195bf2"  # your base migration id
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # does "requests" table already exist?
    exists = conn.execute(sa.text("""
        SELECT to_regclass('public.requests') IS NOT NULL AS exists
    """)).scalar()

    if not exists:
        # fresh create
        op.create_table(
            "requests",
            sa.Column("id", UUID(as_uuid=True), primary_key=True),
            sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("description", sa.Text, nullable=True),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="pending"),
            sa.Column("assigned_lawyer", UUID(as_uuid=True), sa.ForeignKey("lawyers.id"), nullable=True),
            sa.Column("preferred_window", sa.String(length=255), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=False), server_default=sa.text("NOW()")),
        )
        op.create_check_constraint(
            "requests_status_chk",
            "requests",
            "status IN ('pending','assigned','calling','completed')",
        )
        return

    # --- ALTER path (if table already exists, e.g. flat schema) ---
    inspector = sa.inspect(conn)
    cols = {c["name"] for c in inspector.get_columns("requests")}

    if "user_id" not in cols:
        op.add_column("requests", sa.Column("user_id", UUID(as_uuid=True), nullable=True))
        op.create_foreign_key(None, "requests", "users", ["user_id"], ["id"])

    if "assigned_lawyer" not in cols:
        op.add_column("requests", sa.Column("assigned_lawyer", UUID(as_uuid=True), nullable=True))
        op.create_foreign_key(None, "requests", "lawyers", ["assigned_lawyer"], ["id"])

    if "preferred_window" not in cols:
        op.add_column("requests", sa.Column("preferred_window", sa.String(length=255), nullable=True))

    if "description" not in cols:
        op.add_column("requests", sa.Column("description", sa.Text, nullable=True))

    if "status" not in cols:
        op.add_column("requests", sa.Column("status", sa.String(length=50), nullable=False, server_default="pending"))

    if "created_at" not in cols:
        op.add_column("requests", sa.Column("created_at", sa.DateTime(timezone=False), server_default=sa.text("NOW()")))

    # ensure check constraint exists
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'requests_status_chk'
            ) THEN
                ALTER TABLE requests
                ADD CONSTRAINT requests_status_chk
                CHECK (status IN ('pending','assigned','calling','completed'));
            END IF;
        END$$;
    """)

    # cleanup old flat columns if present
    for old_col in ("user_name", "user_phone", "category"):
        if old_col in cols:
            op.drop_column("requests", old_col)


def downgrade():
    op.execute("ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_status_chk")
    with op.batch_alter_table("requests") as b:
        for col in ("user_id", "assigned_lawyer", "preferred_window"):
            try:
                b.drop_constraint(None, type_="foreignkey")
            except Exception:
                pass
            try:
                b.drop_column(col)
            except Exception:
                pass
