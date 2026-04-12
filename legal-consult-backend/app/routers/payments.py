import os
from typing import Optional

import razorpay
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])


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


def get_razorpay_client() -> razorpay.Client:
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")

    if not key_id or not key_secret:
      raise HTTPException(
          status_code=500,
          detail="Razorpay credentials are missing in environment variables.",
      )

    return razorpay.Client(auth=(key_id, key_secret))


@router.post("/create-link", response_model=CreatePaymentLinkOut)
def create_payment_link(
    payload: CreatePaymentLinkIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    client = get_razorpay_client()

    amount_paise = payload.amount_rupees * 100

    customer_name = getattr(current_user, "name", None) or "caseFit User"
    customer_contact = getattr(current_user, "phone", None) or ""

    notes = {
        "request_id": payload.request_id,
        "user_id": str(getattr(current_user, "id", "")),
        "category": payload.category or "",
    }

    try:
        payment_link = client.payment_link.create(
            {
                "amount": amount_paise,
                "currency": "INR",
                "accept_partial": False,
                "description": f"{payload.category or 'Legal Consultation'} | {payload.description or ''}".strip(),
                "customer": {
                    "name": customer_name,
                    "contact": customer_contact,
                },
                "notify": {
                    "sms": True,
                    "email": False,
                },
                "reminder_enable": True,
                "notes": notes,
                "callback_method": "get",
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to create payment link: {exc}")

    short_url = payment_link.get("short_url")
    payment_link_id = payment_link.get("id")

    if not short_url or not payment_link_id:
        raise HTTPException(status_code=500, detail="Payment link response was incomplete.")

    return CreatePaymentLinkOut(
        success=True,
        payment_link_id=payment_link_id,
        payment_link_url=short_url,
        amount=amount_paise,
        currency="INR",
        status=payment_link.get("status", "created"),
    )