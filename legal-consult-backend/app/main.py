import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from .db import Base, engine
from .routers import admin as admin_router
from .routers import articles
from .routers import auth as auth_router
from .routers import feedback as feedback_router
from .routers import requests as requests_router
from .routers.payments import router as payments_router


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


app_env = os.getenv("APP_ENV", "development").strip().lower()
docs_enabled = os.getenv("ENABLE_DOCS", "1" if app_env != "production" else "0") == "1"
cors_origins = _split_csv(os.getenv("CORS_ALLOW_ORIGINS", "*"))

app = FastAPI(
    title="Legal Consult API",
    version="0.1.0",
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
)

allow_all_origins = cors_origins == ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else cors_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional: create tables on first run if you set RUN_SYNC_DDL=1 (use Alembic otherwise)
if os.getenv("RUN_SYNC_DDL", "0") == "1":
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    if docs_enabled:
        return RedirectResponse(url="/docs")
    return {"status": "ok", "name": "Legal Consult API", "environment": app_env}

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0", "environment": app_env}

# --- Routers ---
app.include_router(articles.router)          # /articles
app.include_router(admin_router.router)      # /admin
app.include_router(requests_router.router)   # /requests
app.include_router(auth_router.router)       # /auth  <-- NEW: request-code, verify, me
app.include_router(feedback_router.router)   # /feedback
app.include_router(payments_router)
