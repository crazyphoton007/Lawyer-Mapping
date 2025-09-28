# Legal Consult Backend (FastAPI + Postgres/Neon)

This is a production-ready starter for your MVP backend.

## 0) Prerequisites
- Python 3.11+
- Neon connection string (Postgres) — include `?sslmode=require` at the end
- `pip` and optionally `virtualenv`

## 1) Clone & setup
```bash
cd legal-consult-backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # put your Neon DATABASE_URL here
```

## 2) First run (quick start)
For the very first run only, keep `RUN_SYNC_DDL=1` in `.env` so tables auto-create.
```bash
uvicorn app.main:app --reload
# visit http://127.0.0.1:8000/health
```

## 3) Seed articles
```bash
python seed_articles.py
# then try: GET http://127.0.0.1:8000/articles
```

## 4) Migrations (recommended after first run)
Once you're ready to manage schema via Alembic, set `RUN_SYNC_DDL=0` in `.env`.
Then generate your initial migration and apply it:
```bash
alembic revision --autogenerate -m "init schema"
alembic upgrade head
```

## 5) Suggested next steps
- Add endpoints for requests/payments
- Wire Razorpay webhook: `/payments/webhook`
- Add CORS middleware for your mobile app
- Set up GitHub Actions for CI (lint/test)
