import os
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# --- NEW: load .env early ---
try:
    from dotenv import load_dotenv
    # Try current working dir .env, then project root (…/legal-consult-backend/.env)
    load_dotenv()  # loads .env from CWD if present
    # Fallback: explicitly point to project root .env
    if not os.getenv("DATABASE_URL"):
        project_root_env = Path(__file__).resolve().parents[1] / ".env"
        if project_root_env.exists():
            load_dotenv(project_root_env)
except Exception:
    # don't crash if dotenv isn't installed; we'll error below if var missing
    pass

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Put it in a .env file or environment.")

# Engine & Session
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Base(DeclarativeBase):
    pass

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
