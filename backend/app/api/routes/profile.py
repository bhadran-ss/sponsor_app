from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, UserRole, InnovatorProfile, SponsorProfile
from app.schemas.profile import ProfileUpdate, ProfileOut

router = APIRouter(prefix="/profile", tags=["profile"])


def _serialize(user: User) -> dict:
    """Flattens User + whichever role-profile table applies into one dict."""
    data = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
        "company_name": user.company_name,
        "is_verified": user.is_verified,
        "is_admin": user.is_admin,
        "avatar_url": user.avatar_url,
        "phone": user.phone,
        "city": user.city,
        "address_line1": user.address_line1,
        "address_line2": user.address_line2,
        "state": user.state,
        "postal_code": user.postal_code,
        "country": user.country,
        "bio": user.bio,
        "created_at": user.created_at,
    }
    if user.role == UserRole.innovator and user.innovator_profile:
        data["date_of_birth"] = user.innovator_profile.date_of_birth
        data["resume_url"] = user.innovator_profile.resume_url
        data["interests"] = user.innovator_profile.interests
    if user.role == UserRole.sponsor and user.sponsor_profile:
        data["website"] = user.sponsor_profile.website
    return data


@router.get("/me", response_model=ProfileOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return _serialize(current_user)

@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    print(f"hitted")
    shared_fields = [
        "full_name", "phone", "city", "address_line1",
        "address_line2", "state", "postal_code", "country", "bio",
    ]
    for field in shared_fields:
        value = getattr(payload, field)
        if value is not None:
            setattr(current_user, field, value)

    if current_user.role == UserRole.sponsor:
        if payload.company_name is not None:
            current_user.company_name = payload.company_name
        if payload.website is not None:
            # First time this sponsor has set a website — the related row doesn't exist yet, create it
            if current_user.sponsor_profile is None:
                current_user.sponsor_profile = SponsorProfile(user_id=current_user.id)
            current_user.sponsor_profile.website = payload.website

    if current_user.role == UserRole.innovator:
        if payload.date_of_birth is not None or payload.interests is not None:
            if current_user.innovator_profile is None:
                current_user.innovator_profile = InnovatorProfile(user_id=current_user.id)
            if payload.date_of_birth is not None:
                current_user.innovator_profile.date_of_birth = payload.date_of_birth
            if payload.interests is not None:
                current_user.innovator_profile.interests = payload.interests
                
    print(f"current_user: {current_user}")

    db.commit()
    db.refresh(current_user)
    return _serialize(current_user)