from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "43460e64919e"        # keep as generated
down_revision = "d884c77a9ccd"   # the other head you set earlier
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = {c["name"] for c in insp.get_columns("users")}

    # 'name' already exists in your table per the error, so we skip it.
    if "gender" not in cols:
        op.add_column("users", sa.Column("gender", sa.String(length=10), nullable=True))
    if "age" not in cols:
        op.add_column("users", sa.Column("age", sa.Integer(), nullable=True))
    if "area" not in cols:
        op.add_column("users", sa.Column("area", sa.String(length=120), nullable=True))


def downgrade():
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = {c["name"] for c in insp.get_columns("users")}

    if "area" in cols:
        op.drop_column("users", "area")
    if "age" in cols:
        op.drop_column("users", "age")
    if "gender" in cols:
        op.drop_column("users", "gender")
