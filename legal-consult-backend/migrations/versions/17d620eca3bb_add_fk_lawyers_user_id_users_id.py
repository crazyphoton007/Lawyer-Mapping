from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "17d620eca3bb"                 # <-- the filename's hash
down_revision = "0002_requests_relational"  # <-- previous migration id
branch_labels = None
depends_on = None

def upgrade():
    # create FK only if it doesn't already exist
    op.execute("""
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'lawyers_user_id_fkey'
          AND t.relname = 'lawyers'
      ) THEN
        ALTER TABLE lawyers
        ADD CONSTRAINT lawyers_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id);
      END IF;
    END$$;
    """)

def downgrade():
    op.execute("""
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE c.conname = 'lawyers_user_id_fkey'
          AND t.relname = 'lawyers'
      ) THEN
        ALTER TABLE lawyers
        DROP CONSTRAINT lawyers_user_id_fkey;
      END IF;
    END$$;
    """)
