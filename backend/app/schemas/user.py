import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.db.models import UserRole


class UserRegister(BaseModel):
    role: UserRole
    full_name: str
    company_name: Optional[str] = None
    company_proof_url: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    role: UserRole
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    company_proof_url: Optional[str] = None
    is_verified: bool
    is_admin: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    
class PendingUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    role: UserRole
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    company_proof_url: Optional[str] = None
    created_at: datetime