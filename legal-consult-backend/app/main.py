import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse


from .db import Base, engine
from .routers import articles
from .routers import requests as requests_router
from .routers import auth as auth_router  # <-- NEW: bring in /auth routes

app = FastAPI(title="Legal Consult API", version="0.1.0")

# CORS so the mobile app can call APIs (tighten later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional: create tables on first run if you set RUN_SYNC_DDL=1 (use Alembic otherwise)
if os.getenv("RUN_SYNC_DDL", "0") == "1":
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    # Redirect base URL to interactive docs
    return RedirectResponse(url="/docs")

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}

# --- Routers ---
app.include_router(articles.router)          # /articles
app.include_router(requests_router.router)   # /requests
app.include_router(auth_router.router)       # /auth  <-- NEW: request-code, verify, me
