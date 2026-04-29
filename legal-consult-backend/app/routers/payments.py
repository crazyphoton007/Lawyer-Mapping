import os
import time
import logging
from typing import Optional
from uuid import UUID

import razorpay
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import SessionLocal, get_db
from app.models.lawyer import Lawyer
from app.models.request import Request
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)


class CreatePaymentLinkIn(BaseModel):
    request_id: str
    category: Optional[str] = "Legal Consultation"
    description: Optional[str] = "caseFit legal consultation"
    amount_rupees: int = Field(default=199, ge=1)


class CreatePaymentLinkOut(BaseModel):
    success: bool
    payment_link_id: str
    payment_link_url: str
    amount: int
    currency: str
    status: str


class VerifyPaymentIn(BaseModel):
    request_id: str
    payment_link_id: str


class VerifyPaymentOut(BaseModel):
    success: bool
    request_id: str
    request_status: str
    payment_link_id: str
    payment_status: str
    amount: int
    currency: str


def get_razorpay_client() -> razorpay.Client:
    key_id = (os.getenv("RAZORPAY_KEY_ID") or "").strip()
    key_secret = (os.getenv("RAZORPAY_KEY_SECRET") or "").strip()

    if not key_id or not key_secret:
        raise HTTPException(
            status_code=500,
            detail="Razorpay credentials are missing in environment variables.",
        )

    return razorpay.Client(auth=(key_id, key_secret))


def raise_payment_provider_error(action: str, exc: Exception) -> None:
    logger.exception("Razorpay %s failed", action)

    message = str(exc).lower()
    if "authentication failed" in message or "unauthorized" in message:
        raise HTTPException(
            status_code=502,
            detail=(
                "Payment provider authentication failed. "
                "Please check the Razorpay key ID and key secret configured on the backend."
            ),
        )

    raise HTTPException(
        status_code=502,
        detail="Payment provider is unavailable right now. Please try again shortly.",
    )


def assign_lawyer_after_delay(request_id: UUID, delay_seconds: int = 60) -> None:
    time.sleep(delay_seconds)

    db = SessionLocal()
    try:
        req = db.get(Request, request_id)
        if not req or req.status != "paid" or req.assigned_lawyer:
            return

        lawyers = db.execute(select(Lawyer).order_by(Lawyer.id)).scalars().all()
        if len(lawyers) != 1:
            return

        req.assigned_lawyer = lawyers[0].id
        req.status = "assigned"
        db.commit()
    finally:
        db.close()


@router.post("/create-link", response_model=CreatePaymentLinkOut)
def create_payment_link(
    payload: CreatePaymentLinkIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    client = get_razorpay_client()

    try:
        request_uuid = UUID(str(payload.request_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request_id")

    req = db.get(Request, request_uuid)
    if not req or req.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")

    amount_paise = payload.amount_rupees * 100

    customer_name = getattr(current_user, "name", None) or "caseFit User"
    customer_contact = (getattr(current_user, "phone", None) or "").strip()

    customer_payload = {
        "name": customer_name,
    }
    if customer_contact:
        customer_payload["contact"] = customer_contact

    notes = {
        "request_id": str(req.id),
        "user_id": str(getattr(current_user, "id", "")),
        "category": payload.category or "",
        "role": getattr(current_user, "role", "") or "",
    }

    try:
        payment_link = client.payment_link.create(
            {
                "amount": amount_paise,
                "currency": "INR",
                "accept_partial": False,
                "description": f"{payload.category or 'Legal Consultation'} | {payload.description or ''}".strip(),
                "customer": customer_payload,
                "notify": {
                    "sms": bool(customer_contact),
                    "email": False,
                },
                "reminder_enable": True,
                "notes": notes,
                "callback_method": "get",
            }
        )
    except Exception as exc:
        raise_payment_provider_error("payment link creation", exc)

    short_url = payment_link.get("short_url")
    payment_link_id = payment_link.get("id")

    if not short_url or not payment_link_id:
        raise HTTPException(status_code=500, detail="Payment link response was incomplete.")

    if req.status == "pending":
        req.status = "awaiting_payment"
        db.commit()
        db.refresh(req)

    return CreatePaymentLinkOut(
        success=True,
        payment_link_id=payment_link_id,
        payment_link_url=short_url,
        amount=amount_paise,
        currency="INR",
        status=payment_link.get("status", "created"),
    )


@router.post("/verify-link", response_model=VerifyPaymentOut)
def verify_payment_link(
    payload: VerifyPaymentIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    client = get_razorpay_client()

    try:
        request_uuid = UUID(str(payload.request_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid request_id")

    req = db.get(Request, request_uuid)
    if not req or req.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")

    try:
        payment_link = client.payment_link.fetch(payload.payment_link_id)
    except Exception as exc:
        raise_payment_provider_error("payment link verification", exc)

    payment_status = (payment_link.get("status") or "").lower()
    amount = payment_link.get("amount", 0)
    currency = payment_link.get("currency", "INR")

    if payment_status == "paid":
        if req.status != "paid":
            req.status = "paid"
        db.commit()
        db.refresh(req)
        background_tasks.add_task(assign_lawyer_after_delay, req.id, 60)
    elif req.status == "pending":
        req.status = "awaiting_payment"
        db.commit()
        db.refresh(req)

    return VerifyPaymentOut(
        success=payment_status == "paid",
        request_id=str(req.id),
        request_status=req.status,
        payment_link_id=payload.payment_link_id,
        payment_status=payment_status or "unknown",
        amount=amount,
        currency=currency,
    )
