# app/routers/auth.py
import os, time, random, jwt
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User          # SQLAlchemy User model with columns: phone, name, gender, age, area
from app.schemas import UserUpdate        # <-- add this (from your schemas.py)

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
    return jwt.encode({"sub": user_id, "phone": phone, "iat": now, "exp": exp}, JWT_SECRET, algorithm="HS256")

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
    # Return all profile fields we have so the app can prefill Profile
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
def me(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    user = _require_user(authorization, db)
    return {
        "id": str(user.id),
        "phone": user.phone,
        "name": getattr(user, "name", None),
        "gender": getattr(user, "gender", None),
        "age": getattr(user, "age", None),
        "area": getattr(user, "area", None),
    }

@router.patch("/me")
def update_me(
    payload: UserUpdate,
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    """
    Update the currently authenticated user's profile.
    Only provided fields are updated.
    """
    user = _require_user(authorization, db)

    # Make sure your User model has these columns:
    # name: String | None, gender: String | None, age: Integer | None, area: String | None
    missing_cols = []
    for col in ("name", "gender", "age", "area"):
        if not hasattr(user, col):
            missing_cols.append(col)
    if missing_cols:
        raise HTTPException(
            status_code=500,
            detail=f"User model is missing columns: {', '.join(missing_cols)}. "
                   f"Add them via migration (name, gender, age, area)."
        )

    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.gender is not None:
        user.gender = payload.gender
    if payload.age is not None:
        user.age = payload.age
    if payload.area is not None:
        user.area = payload.area.strip()

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": str(user.id),
        "phone": user.phone,
        "name": user.name,
        "gender": user.gender,
        "age": user.age,
        "area": user.area,
    }
