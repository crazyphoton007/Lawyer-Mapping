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

## 5A) Production environment
For production, use explicit backend settings instead of the local development defaults:

```env
APP_ENV=production
ENABLE_DOCS=0
CORS_ALLOW_ORIGINS=https://thecasefit.com,https://api.thecasefit.com
RUN_SYNC_DDL=0
```

Recommended production values:
- `APP_ENV=production`
- `ENABLE_DOCS=0` so Swagger is not publicly exposed by default
- `CORS_ALLOW_ORIGINS` should be a comma-separated allowlist, not `*`
- `RUN_SYNC_DDL=0` and use `alembic upgrade head` during deploy

Recommended domain structure:
- Public website: `https://thecasefit.com`
- Backend API: `https://api.thecasefit.com`
- Admin tool: `https://api.thecasefit.com/admin`

## 5B) Lightsail deployment
If you are deploying on AWS Lightsail, you do not need Docker.
Run the backend as a persistent `systemd` service and put `nginx` in front of it.

Templates included in this repo:
- `deploy/lightsail/casefit-backend.service`
- `deploy/lightsail/nginx-casefit.conf`

Suggested server layout:
```bash
/home/ubuntu/legal-consult-backend
/home/ubuntu/legal-consult-backend/.venv
/home/ubuntu/legal-consult-backend/.env
```

One-time setup on Lightsail:
```bash
cd /home/ubuntu
git clone <your-repo-url> legal-consult-backend
cd legal-consult-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Install the service:
```bash
sudo cp deploy/lightsail/casefit-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable casefit-backend
sudo systemctl start casefit-backend
sudo systemctl status casefit-backend
```

Install the nginx site:
```bash
sudo cp deploy/lightsail/nginx-casefit.conf /etc/nginx/sites-available/casefit
sudo ln -s /etc/nginx/sites-available/casefit /etc/nginx/sites-enabled/casefit
sudo nginx -t
sudo systemctl restart nginx
```

Recommended production backend settings:
```env
APP_ENV=production
ENABLE_DOCS=0
RUN_SYNC_DDL=0
CORS_ALLOW_ORIGINS=https://thecasefit.com,https://api.thecasefit.com
```

How this affects your app:
- your Expo app uses `https://api.thecasefit.com` by default
- that means the app keeps working when your local laptop backend is off
- if the Lightsail backend goes down, the app UI may still open, but login, requests, payments, articles, and admin data calls will fail

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

## 7) Production OTP providers
To send login OTPs instead of printing them in server logs, configure a primary provider and optional fallback.

### WhatsApp + Email fallback
```env
OTP_PROVIDER=whatsapp
OTP_FALLBACK_PROVIDER=email
WHATSAPP_API_TOKEN=your_meta_permanent_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_TEMPLATE_NAME=casefit_login_otp
WHATSAPP_TEMPLATE_LANGUAGE=en
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=no-reply@thecasefit.com
OTP_EMAIL_SUBJECT=Your caseFit login code
```

Notes:
- the WhatsApp template is expected to accept the OTP code as its first body variable
- if WhatsApp delivery fails, the service can fall back to email
- the login request must include an email address for email fallback to work

### AWS SNS
```env
OTP_PROVIDER=sns
OTP_FALLBACK_PROVIDER=dev
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SNS_SENDER_ID=CASFIT
AWS_SNS_ENTITY_ID=your_dlt_entity_id
AWS_SNS_TEMPLATE_ID=your_dlt_template_id
AWS_SNS_SMS_TYPE=Transactional
```

Notes:
- for India delivery, `AWS_SNS_ENTITY_ID` and `AWS_SNS_TEMPLATE_ID` are the DLT values typically required by the local route
- if your instance already has an IAM role with SNS access, you can omit `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### MSG91
```env
OTP_PROVIDER=msg91
OTP_FALLBACK_PROVIDER=email
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=CASEFT
MSG91_TEMPLATE_ID=your_msg91_flow_or_template_id
MSG91_TEMPLATE_OTP_KEY=OTP
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=no-reply@thecasefit.com
```

Notes:
- this integration uses MSG91's SMS flow API so `MSG91_TEMPLATE_ID` should be the approved MSG91 flow/template id from the panel
- `MSG91_TEMPLATE_OTP_KEY` must match the variable name you created in the MSG91 template; for a template like `Your caseFit OTP is ##OTP## ...`, keep it as `OTP`
- phone numbers are sent to MSG91 in international format digits only, e.g. `919807863007`
- keep `OTP_PROVIDER=dev` for local/dev if you want OTPs printed in logs
- once `OTP_PROVIDER=whatsapp`, `OTP_PROVIDER=sns`, or `OTP_PROVIDER=msg91` is enabled, `/auth/request-code` will send the OTP through that provider
- if `OTP_FALLBACK_PROVIDER=email` is configured, the backend will try email when the primary channel fails
- email fallback only works if an email is supplied in `/auth/request-code` or already exists on the user record
- `/auth/verify` stays the same for the app and admin tool
