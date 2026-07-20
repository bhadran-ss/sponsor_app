import uuid
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from app.db.models import UserRole


class ProfileUpdate(BaseModel):
    # shared — both roles
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None

    # innovator-only
    date_of_birth: Optional[date] = None
    interests: Optional[List[str]] = None

    # sponsor-only
    company_name: Optional[str] = None
    website: Optional[str] = None


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    role: UserRole
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    is_verified: bool
    avatar_url: Optional[str] = None

    phone: Optional[str] = None
    city: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None

    created_at: datetime

    date_of_birth: Optional[date] = None
    resume_url: Optional[str] = None
    interests: Optional[List[str]] = None

    website: Optional[str] = None