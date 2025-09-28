# migrations/env.py
import os
import sys
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

# ---------- Make backend root importable ----------
BACKEND_ROOT = Path(__file__).resolve().parents[1]  # .../legal-consult-backend
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# ---------- Load .env (for DATABASE_URL) ----------
try:
    from dotenv import load_dotenv
    load_dotenv(BACKEND_ROOT / ".env")
except Exception:
    pass

# ---------- Alembic config ----------
config = context.config

# Set sqlalchemy.url from env (leave alembic.ini empty for this key)
db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

# ---------- Import metadata & register models ----------
from app.db import Base            # noqa: E402
import app.models                  # noqa: F401,E402  (package re-exports all models)

target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
