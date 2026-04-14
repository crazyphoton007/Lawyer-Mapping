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

## 6) Admin bootstrap
To create your first team account without editing the DB manually:

1. Put `ADMIN_BOOTSTRAP_KEY` in `.env`
2. Start the backend
3. Call:

```bash
curl -X POST http://127.0.0.1:8000/auth/admin/bootstrap-role \
  -H "Content-Type: application/json" \
  -H "x-admin-bootstrap-key: YOUR_ADMIN_BOOTSTRAP_KEY" \
  -d '{"phone":"+911234567890","role":"admin"}'
```

After that, that phone number can log in normally and use the internal admin tool at `/admin`.

To promote more team users later, log in as an admin and call:

```bash
curl -X POST http://127.0.0.1:8000/auth/admin/set-role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"phone":"+919876543210","role":"lawyer"}'
```
