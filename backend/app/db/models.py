import enum
import uuid

from sqlalchemy import Column, String, Boolean, Enum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class UserRole(str, enum.Enum):
    innovator = "innovator"
    sponsor = "sponsor"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    firebase_uid = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)

    role = Column(Enum(UserRole), nullable=False)
    full_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)  # sponsor-specific
    company_proof_url = Column(String, nullable=True)  # sponsor-specific proof image URL/data URL

    is_verified = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String, nullable=True)  

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())