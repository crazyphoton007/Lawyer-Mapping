import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse  # <-- add this import

from .db import Base, engine
from .routers import articles
from .routers import requests as requests_router

app = FastAPI(title="Legal Consult API", version="0.1.0")

# Enable CORS (so the mobile app can call APIs)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # later restrict to your domain or frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on first run if RUN_SYNC_DDL=1 (then disable and use Alembic)
if os.getenv("RUN_SYNC_DDL", "0") == "1":
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    # Redirect base URL to interactive docs
    return RedirectResponse(url="/docs")

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}

# Routers
app.include_router(articles.router)
app.include_router(requests_router.router)
