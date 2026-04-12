# app/routers/auth.py
import os
import time
import random
import jwt
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.schemas import UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret")
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "43200"))  # 30 days default


class RequestCodeIn(BaseModel):
    phone: str


class VerifyCodeIn(BaseModel):
    phone: str
    code: str


# simple in-memory store (dev only)
_otp: dict[str, tuple[str, float]] = {}


def _make_jwt(user_id: str, phone: str) -> str:
    now = int(time.time())
    exp = now + JWT_EXPIRES_MIN * 60
    return jwt.encode(
        {"sub": user_id, "phone": phone, "iat": now, "exp": exp},
        JWT_SECRET,
        algorithm="HS256",
    )


def _require_user(authorization: Optional[str], db: Session) -> User:
    """Decode Bearer token and return the current user or raise 401."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization")

    token = authorization.split(" ", 1)[1].strip()

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get(User, payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def get_current_user(
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
) -> User:
    """FastAPI dependency for authenticated routes."""
    return _require_user(authorization, db)


@router.post("/request-code")
def request_code(inp: RequestCodeIn):
    code = f"{random.randint(100000, 999999)}"
    _otp[inp.phone] = (code, time.time() + 600)  # 10 min
    print(f"[DEV] OTP for {inp.phone}: {code}")
    return {"ok": True}


@router.post("/verify")
def verify(inp: VerifyCodeIn, db: Session = Depends(get_db)):
    rec = _otp.get(inp.phone)
    if not rec or rec[0] != inp.code or rec[1] < time.time():
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    # upsert user
    user = db.query(User).filter(User.phone == inp.phone).first()
    if not user:
        user = User(phone=inp.phone)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = _make_jwt(str(user.id), user.phone)

    return {
        "token": token,
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "name": getattr(user, "name", None),
            "gender": getattr(user, "gender", None),
            "age": getattr(user, "age", None),
            "area": getattr(user, "area", None),
        },
    }


@router.get("/me")
def me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "phone": current_user.phone,
        "name": getattr(current_user, "name", None),
        "gender": getattr(current_user, "gender", None),
        "age": getattr(current_user, "age", None),
        "area": getattr(current_user, "area", None),
    }


@router.patch("/me")
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the currently authenticated user's profile.
    Only provided fields are updated.
    """
    missing_cols = []
    for col in ("name", "gender", "age", "area"):
        if not hasattr(current_user, col):
            missing_cols.append(col)

    if missing_cols:
        raise HTTPException(
            status_code=500,
            detail=(
                f"User model is missing columns: {', '.join(missing_cols)}. "
                f"Add them via migration (name, gender, age, area)."
            ),
        )

    if payload.name is not None:
        current_user.name = payload.name.strip()
    if payload.gender is not None:
        current_user.gender = payload.gender
    if payload.age is not None:
        current_user.age = payload.age
    if payload.area is not None:
        current_user.area = payload.area.strip()

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "id": str(current_user.id),
        "phone": current_user.phone,
        "name": current_user.name,
        "gender": current_user.gender,
        "age": current_user.age,
        "area": current_user.area,
    }