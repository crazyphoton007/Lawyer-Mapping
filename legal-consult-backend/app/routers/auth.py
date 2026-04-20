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
from app.services.otp import OtpDeliveryContext, dispatch_otp

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret")
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "43200"))  # 30 days default
ADMIN_BOOTSTRAP_KEY = os.getenv("ADMIN_BOOTSTRAP_KEY")
TEAM_ROLES = {"user", "lawyer", "admin"}


class RequestCodeIn(BaseModel):
    phone: str
    email: str | None = None


class VerifyCodeIn(BaseModel):
    phone: str
    code: str


class GuestLoginIn(BaseModel):
    name: str | None = None


class SetRoleIn(BaseModel):
    phone: str
    role: str


# simple in-memory store (MVP only)
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


def require_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def _upsert_user_role(db: Session, phone: str, role: str) -> User:
    if role not in TEAM_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    clean_phone = phone.strip()
    if not clean_phone:
        raise HTTPException(status_code=400, detail="Phone is required")

    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        user = User(phone=clean_phone, role=role)
        db.add(user)
    else:
        user.role = role

    db.commit()
    db.refresh(user)
    return user


@router.post("/request-code")
def request_code(inp: RequestCodeIn, db: Session = Depends(get_db)):
    code = f"{random.randint(100000, 999999)}"
    _otp[inp.phone] = (code, time.time() + 600)  # 10 min
    user = db.query(User).filter(User.phone == inp.phone).first()
    fallback_email = inp.email or getattr(user, "email", None)
    if inp.email and user and not getattr(user, "email", None):
        user.email = str(inp.email)
        db.add(user)
        db.commit()

    provider = dispatch_otp(
        OtpDeliveryContext(
            phone=inp.phone,
            code=code,
            email=fallback_email,
            name=getattr(user, "name", None) if user else None,
        )
    )
    return {"ok": True, "delivery_channel": provider}


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
            "role": getattr(user, "role", None),
        },
    }


@router.post("/guest")
def guest_login(inp: GuestLoginIn, db: Session = Depends(get_db)):
    guest_name = (inp.name or "").strip() or "Guest"

    user = User(name=guest_name, role="guest")
    db.add(user)
    db.commit()
    db.refresh(user)

    token = _make_jwt(str(user.id), user.phone or "")

    return {
        "token": token,
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "name": user.name,
            "gender": getattr(user, "gender", None),
            "age": getattr(user, "age", None),
            "area": getattr(user, "area", None),
            "role": getattr(user, "role", None),
            "is_guest": True,
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
        "role": getattr(current_user, "role", None),
        "is_guest": getattr(current_user, "role", None) == "guest",
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
        "role": current_user.role,
        "is_guest": current_user.role == "guest",
    }


@router.post("/admin/bootstrap-role")
def bootstrap_role(
    payload: SetRoleIn,
    db: Session = Depends(get_db),
    x_admin_bootstrap_key: str | None = Header(None),
):
    if not ADMIN_BOOTSTRAP_KEY:
        raise HTTPException(
            status_code=500,
            detail="ADMIN_BOOTSTRAP_KEY is not configured.",
        )

    if x_admin_bootstrap_key != ADMIN_BOOTSTRAP_KEY:
        raise HTTPException(status_code=403, detail="Invalid bootstrap key")

    user = _upsert_user_role(db, payload.phone, payload.role)
    return {
        "ok": True,
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "role": user.role,
        },
    }


@router.post("/admin/set-role")
def set_role(
    payload: SetRoleIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_user),
):
    user = _upsert_user_role(db, payload.phone, payload.role)
    return {
        "ok": True,
        "updated_by": str(current_user.id),
        "user": {
            "id": str(user.id),
            "phone": user.phone,
            "role": user.role,
        },
    }
