from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_decoded_token, get_current_user
from app.db.database import get_db
from app.db.models import User, UserRole
from app.schemas.user import UserRegister, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(
    payload: UserRegister,
    decoded_token: dict = Depends(get_decoded_token),
    db: Session = Depends(get_db),
):
    uid = decoded_token["uid"]
    email = decoded_token.get("email")

    existing = db.query(User).filter(User.firebase_uid == uid).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists for this account")

    if payload.role == UserRole.sponsor and not payload.company_name:
        raise HTTPException(status_code=422, detail="company_name is required for sponsors")

    user = User(
        firebase_uid=uid,
        email=email,
        role=payload.role,
        full_name=payload.full_name,
        company_name=payload.company_name,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user