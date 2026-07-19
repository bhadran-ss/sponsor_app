import cloudinary
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_decoded_token, get_current_user
from app.db.database import get_db
from app.db.models import User, UserRole
from app.schemas.user import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(
    role: UserRole = Form(...),
    full_name: str = Form(...),
    company_name: str | None = Form(None),
    company_proof: UploadFile | None = File(None),
    decoded_token: dict = Depends(get_decoded_token),
    db: Session = Depends(get_db),
):
    uid = decoded_token["uid"]
    email = decoded_token.get("email")

    existing = db.query(User).filter(User.firebase_uid == uid).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists for this account")

    if role == UserRole.sponsor and not company_name:
        raise HTTPException(status_code=422, detail="company_name is required for sponsors")

    company_proof_url = None
    if role == UserRole.sponsor:
        if not company_proof:
            raise HTTPException(status_code=422, detail="company_proof is required for sponsors")

        upload_result = cloudinary.uploader.upload(
            company_proof.file,
            folder="sponsor_proofs",
            resource_type="image",
        )
        company_proof_url = upload_result.get("secure_url")

    user = User(
        firebase_uid=uid,
        email=email,
        role=role,
        full_name=full_name,
        company_name=company_name,
        company_proof_url=company_proof_url,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user