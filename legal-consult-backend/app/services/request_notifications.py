import logging
import os
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from html import escape
from uuid import UUID

from app.services.case_reference import derive_case_reference

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class NewRequestAlert:
    request_id: UUID
    category: str | None
    description: str | None
    status: str | None
    preferred_city: str | None
    preferred_window: str | None
    created_at: object
    customer_name: str | None
    customer_phone: str | None
    customer_email: str | None
    customer_area: str | None


def _smtp_port() -> int:
    try:
        return int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        return 587


def _request_alert_recipient() -> str:
    return os.getenv("ADMIN_REQUEST_ALERT_EMAIL", "shukla.vik927@gmail.com").strip()


def _value(value: object) -> str:
    text = str(value).strip() if value is not None else ""
    return text or "Not provided"


def send_new_request_email(alert: NewRequestAlert) -> None:
    recipient = _request_alert_recipient()
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_from_email = os.getenv("SMTP_FROM_EMAIL", "").strip()

    if not recipient:
        logger.info("Skipping request alert email because ADMIN_REQUEST_ALERT_EMAIL is empty.")
        return

    if not all([smtp_host, smtp_username, smtp_password, smtp_from_email]):
        logger.warning("Skipping request alert email because SMTP settings are incomplete.")
        return

    case_reference = derive_case_reference(alert.request_id)
    customer_name = alert.customer_name or "Guest User"

    subject = f"New CaseFit request received: {case_reference}"
    plain_body = "\n".join(
        [
            "A new request has been submitted on CaseFit.",
            "",
            f"Case reference: {case_reference}",
            f"Category: {_value(alert.category)}",
            f"Status: {_value(alert.status)}",
            f"Preferred city: {_value(alert.preferred_city)}",
            f"Preferred window: {_value(alert.preferred_window)}",
            f"Submitted at: {_value(alert.created_at)} UTC",
            "",
            "Client",
            f"Name: {_value(customer_name)}",
            f"Phone: {_value(alert.customer_phone)}",
            f"Email: {_value(alert.customer_email)}",
            f"Area: {_value(alert.customer_area)}",
            "",
            "Request details",
            _value(alert.description),
            "",
            "Admin console",
            "https://api.thecasefit.com/admin",
        ]
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">New CaseFit request received</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tr><td><strong>Case reference</strong></td><td>{escape(case_reference)}</td></tr>
        <tr><td><strong>Category</strong></td><td>{escape(_value(alert.category))}</td></tr>
        <tr><td><strong>Status</strong></td><td>{escape(_value(alert.status))}</td></tr>
        <tr><td><strong>Preferred city</strong></td><td>{escape(_value(alert.preferred_city))}</td></tr>
        <tr><td><strong>Preferred window</strong></td><td>{escape(_value(alert.preferred_window))}</td></tr>
        <tr><td><strong>Submitted at</strong></td><td>{escape(_value(alert.created_at))} UTC</td></tr>
        <tr><td><strong>Client name</strong></td><td>{escape(_value(customer_name))}</td></tr>
        <tr><td><strong>Client phone</strong></td><td>{escape(_value(alert.customer_phone))}</td></tr>
        <tr><td><strong>Client email</strong></td><td>{escape(_value(alert.customer_email))}</td></tr>
        <tr><td><strong>Client area</strong></td><td>{escape(_value(alert.customer_area))}</td></tr>
      </table>
      <h3 style="margin: 20px 0 8px;">Request details</h3>
      <p style="white-space: pre-wrap; background: #f8fafc; padding: 12px; border-radius: 8px;">{escape(_value(alert.description))}</p>
      <p><a href="https://api.thecasefit.com/admin">Open admin console</a></p>
    </div>
    """

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = smtp_from_email
    message["To"] = recipient
    message.set_content(plain_body)
    message.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(smtp_host, _smtp_port(), timeout=15) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(message)
    except Exception:
        logger.exception("Failed to send new request alert email for %s", case_reference)
