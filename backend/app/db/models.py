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

    # Firebase Auth is the source of truth for identity/credentials.
    # We only store the uid it hands us, to link a Postgres profile to it.
    firebase_uid = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)

    role = Column(Enum(UserRole), nullable=False)
    full_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)  # sponsor-specific

    is_verified = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String, nullable=True)  # Cloudinary URL

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())