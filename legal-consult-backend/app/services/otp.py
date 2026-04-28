import json
import os
import smtplib
import urllib.parse
import urllib.request
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Iterable

from fastapi import HTTPException
import boto3
from botocore.exceptions import BotoCoreError, ClientError


@dataclass
class OtpDeliveryContext:
    phone: str
    code: str
    email: str | None = None
    name: str | None = None


OTP_PROVIDER = os.getenv("OTP_PROVIDER", "dev").lower().strip()
OTP_FALLBACK_PROVIDER = os.getenv("OTP_FALLBACK_PROVIDER", "dev").lower().strip()

WHATSAPP_API_TOKEN = os.getenv("WHATSAPP_API_TOKEN", "").strip()
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "").strip()
WHATSAPP_TEMPLATE_NAME = os.getenv("WHATSAPP_TEMPLATE_NAME", "").strip()
WHATSAPP_TEMPLATE_LANGUAGE = os.getenv("WHATSAPP_TEMPLATE_LANGUAGE", "en").strip()

MSG91_AUTH_KEY = os.getenv("MSG91_AUTH_KEY", "").strip()
MSG91_SENDER_ID = os.getenv("MSG91_SENDER_ID", "").strip()
MSG91_TEMPLATE_ID = os.getenv("MSG91_TEMPLATE_ID", "").strip()
MSG91_TEMPLATE_OTP_KEY = os.getenv("MSG91_TEMPLATE_OTP_KEY", "OTP").strip() or "OTP"
MSG91_OTP_EXPIRY_MINUTES = int(os.getenv("MSG91_OTP_EXPIRY_MINUTES", "5"))
MSG91_SEND_MODE = os.getenv("MSG91_SEND_MODE", "sendotp").lower().strip()
MSG91_SMS_ROUTE = os.getenv("MSG91_SMS_ROUTE", "4").strip()
MSG91_DLT_TE_ID = os.getenv("MSG91_DLT_TE_ID", "").strip()
MSG91_MESSAGE_TEMPLATE = os.getenv(
    "MSG91_MESSAGE_TEMPLATE",
    "caseFit Technologies Pvt Ltd - Your OTP for login is {code}. Do not share it with anyone.",
).strip()

AWS_REGION = os.getenv("AWS_REGION", "").strip() or os.getenv("AWS_DEFAULT_REGION", "").strip()
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "").strip()
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "").strip()
AWS_SESSION_TOKEN = os.getenv("AWS_SESSION_TOKEN", "").strip()
AWS_SNS_SENDER_ID = os.getenv("AWS_SNS_SENDER_ID", "").strip()
AWS_SNS_ENTITY_ID = os.getenv("AWS_SNS_ENTITY_ID", "").strip()
AWS_SNS_TEMPLATE_ID = os.getenv("AWS_SNS_TEMPLATE_ID", "").strip()
AWS_SNS_SMS_TYPE = os.getenv("AWS_SNS_SMS_TYPE", "Transactional").strip()
AWS_SNS_MESSAGE_TEMPLATE = os.getenv(
    "AWS_SNS_MESSAGE_TEMPLATE",
    "Your caseFit OTP is {code}. It is valid for 5 minutes. Do not share it with anyone.",
).strip()

SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "").strip()
OTP_EMAIL_SUBJECT = os.getenv("OTP_EMAIL_SUBJECT", "Your caseFit login code").strip()


def _provider_chain() -> Iterable[str]:
    providers: list[str] = []
    for candidate in (OTP_PROVIDER, OTP_FALLBACK_PROVIDER):
        value = (candidate or "").strip().lower()
        if value and value not in providers:
            providers.append(value)
    return providers or ["dev"]


def _require_msg91_config(*required_values: str) -> None:
    if not all(required_values):
        raise HTTPException(
            status_code=500,
            detail="MSG91 is selected but required MSG91 settings are missing.",
        )


def _msg91_mobile(ctx: OtpDeliveryContext) -> str:
    mobile = "".join(ch for ch in ctx.phone if ch.isdigit())
    if not mobile:
        raise HTTPException(status_code=400, detail="MSG91 requires a valid phone number.")
    return mobile


def _check_msg91_payload(payload: dict | str) -> None:
    if isinstance(payload, str):
        normalized = payload.lower()
        if "error" in normalized or "fail" in normalized:
            raise HTTPException(status_code=502, detail=f"MSG91 OTP send failed: {payload}")
        return

    msg = str(payload.get("message") or "").lower()
    typ = str(payload.get("type") or "").lower()
    if typ in {"error", "failure", "failed"} or "error" in msg or "fail" in msg:
        raise HTTPException(status_code=502, detail=f"MSG91 OTP send failed: {payload}")


def _read_msg91_response(request: urllib.request.Request) -> dict | str:
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            body = response.read().decode("utf-8", errors="replace")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"MSG91 OTP send failed: {exc}")

    if not body:
        return {}

    try:
        return json.loads(body)
    except json.JSONDecodeError:
        return body


def _send_otp_via_msg91_sendotp(ctx: OtpDeliveryContext) -> None:
    _require_msg91_config(MSG91_AUTH_KEY, MSG91_TEMPLATE_ID)
    mobile = _msg91_mobile(ctx)

    query = urllib.parse.urlencode(
        {
            "template_id": MSG91_TEMPLATE_ID,
            "mobile": mobile,
            "authkey": MSG91_AUTH_KEY,
            "otp": ctx.code,
            "otp_expiry": MSG91_OTP_EXPIRY_MINUTES,
        }
    )
    request = urllib.request.Request(
        f"https://control.msg91.com/api/v5/otp?{query}",
        data=b"{}",
        method="POST",
        headers={
            "content-type": "application/JSON",
            "accept": "application/json",
        },
    )
    payload = _read_msg91_response(request)
    _check_msg91_payload(payload)


def _send_otp_via_msg91_sms(ctx: OtpDeliveryContext) -> None:
    _require_msg91_config(MSG91_AUTH_KEY, MSG91_SENDER_ID, MSG91_MESSAGE_TEMPLATE)
    mobile = _msg91_mobile(ctx)
    message = MSG91_MESSAGE_TEMPLATE.format(code=ctx.code)
    payload = {
        "sender": MSG91_SENDER_ID,
        "route": MSG91_SMS_ROUTE or "4",
        "country": "91",
        "sms": [
            {
                "message": message,
                "to": [mobile],
            }
        ],
    }
    if MSG91_DLT_TE_ID:
        payload["DLT_TE_ID"] = MSG91_DLT_TE_ID

    request = urllib.request.Request(
        "https://api.msg91.com/api/v2/sendsms",
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "authkey": MSG91_AUTH_KEY,
            "content-type": "application/json",
            "accept": "application/json",
        },
    )
    response_payload = _read_msg91_response(request)
    _check_msg91_payload(response_payload)


def _send_otp_via_msg91(ctx: OtpDeliveryContext) -> None:
    if MSG91_SEND_MODE in {"sms", "text", "dlt"}:
        _send_otp_via_msg91_sms(ctx)
        return

    _send_otp_via_msg91_sendotp(ctx)


def _send_otp_via_whatsapp(ctx: OtpDeliveryContext) -> None:
    required = [WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE_NAME]
    if not all(required):
        raise HTTPException(
            status_code=500,
            detail=(
                "WhatsApp OTP is selected but WHATSAPP_API_TOKEN, "
                "WHATSAPP_PHONE_NUMBER_ID, or WHATSAPP_TEMPLATE_NAME is missing."
            ),
        )

    url = (
        f"https://graph.facebook.com/v20.0/"
        f"{WHATSAPP_PHONE_NUMBER_ID}/messages"
    )
    payload = {
        "messaging_product": "whatsapp",
        "to": ctx.phone,
        "type": "template",
        "template": {
            "name": WHATSAPP_TEMPLATE_NAME,
            "language": {"code": WHATSAPP_TEMPLATE_LANGUAGE or "en"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": ctx.code},
                    ],
                }
            ],
        },
    }

    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {WHATSAPP_API_TOKEN}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            body = response.read().decode("utf-8", errors="replace")
            response_payload = json.loads(body) if body else {}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"WhatsApp OTP send failed: {exc}")

    if response_payload.get("error"):
        raise HTTPException(status_code=502, detail=f"WhatsApp OTP send failed: {response_payload}")


def _build_sns_client():
    if not AWS_REGION:
        raise HTTPException(status_code=500, detail="AWS SNS is selected but AWS_REGION is missing.")

    client_kwargs = {"service_name": "sns", "region_name": AWS_REGION}

    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        client_kwargs["aws_access_key_id"] = AWS_ACCESS_KEY_ID
        client_kwargs["aws_secret_access_key"] = AWS_SECRET_ACCESS_KEY
        if AWS_SESSION_TOKEN:
            client_kwargs["aws_session_token"] = AWS_SESSION_TOKEN

    return boto3.client(**client_kwargs)


def _send_otp_via_sns(ctx: OtpDeliveryContext) -> None:
    client = _build_sns_client()

    message_attributes = {
        "AWS.SNS.SMS.SMSType": {
            "DataType": "String",
            "StringValue": AWS_SNS_SMS_TYPE or "Transactional",
        }
    }

    if AWS_SNS_SENDER_ID:
        message_attributes["AWS.SNS.SMS.SenderID"] = {
            "DataType": "String",
            "StringValue": AWS_SNS_SENDER_ID,
        }

    if AWS_SNS_ENTITY_ID:
        message_attributes["AWS.MM.SMS.EntityId"] = {
            "DataType": "String",
            "StringValue": AWS_SNS_ENTITY_ID,
        }

    if AWS_SNS_TEMPLATE_ID:
        message_attributes["AWS.MM.SMS.TemplateId"] = {
            "DataType": "String",
            "StringValue": AWS_SNS_TEMPLATE_ID,
        }

    message = AWS_SNS_MESSAGE_TEMPLATE.format(code=ctx.code)

    try:
        client.publish(
            PhoneNumber=ctx.phone,
            Message=message,
            MessageAttributes=message_attributes,
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=502, detail=f"AWS SNS OTP send failed: {exc}")


def _send_otp_via_email(ctx: OtpDeliveryContext) -> None:
    if not ctx.email:
        raise HTTPException(status_code=400, detail="Email fallback is configured but no email is available.")

    required = [SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL]
    if not all(required):
        raise HTTPException(
            status_code=500,
            detail="Email OTP is selected but SMTP settings are incomplete.",
        )

    message = EmailMessage()
    message["Subject"] = OTP_EMAIL_SUBJECT
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = ctx.email
    recipient = ctx.name or "there"
    message.set_content(
        f"Hi {recipient},\n\n"
        f"Your caseFit login code is: {ctx.code}\n\n"
        "This code expires in 10 minutes.\n\n"
        "If you did not request this, you can ignore this email.\n"
    )

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Email OTP send failed: {exc}")


def _send_otp_dev(ctx: OtpDeliveryContext) -> None:
    print(f"[DEV] OTP for {ctx.phone}: {ctx.code}")


def dispatch_otp(ctx: OtpDeliveryContext) -> str:
    last_error: HTTPException | None = None

    for provider in _provider_chain():
        try:
            if provider == "whatsapp":
                _send_otp_via_whatsapp(ctx)
            elif provider == "msg91":
                _send_otp_via_msg91(ctx)
            elif provider == "sns":
                _send_otp_via_sns(ctx)
            elif provider == "email":
                _send_otp_via_email(ctx)
            elif provider == "dev":
                _send_otp_dev(ctx)
            else:
                raise HTTPException(status_code=500, detail=f"Unsupported OTP provider: {provider}")

            return provider
        except HTTPException as exc:
            last_error = exc
            continue

    if last_error:
        raise last_error

    raise HTTPException(status_code=500, detail="Unable to dispatch OTP.")
