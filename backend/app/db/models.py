import enum
import uuid

from sqlalchemy import Column, String, Boolean, Enum, DateTime, Date, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from app.db.database import Base
from sqlalchemy.orm import relationship



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
    
     # Shared contact/profile fields — both roles use these
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    country = Column(String, nullable=True)
    bio = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    innovator_profile = relationship(
        "InnovatorProfile", uselist=False, back_populates="user", cascade="all, delete-orphan"
    )
    sponsor_profile = relationship(
        "SponsorProfile", uselist=False, back_populates="user", cascade="all, delete-orphan"
    )
    
class InnovatorProfile(Base):
    __tablename__ = "innovator_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    date_of_birth = Column(Date, nullable=True)
    resume_url = Column(String, nullable=True)  # filled in once Cloudinary uploads are wired up
    interests = Column(ARRAY(String), nullable=True)  # e.g. ["technology", "sustainability"]

    user = relationship("User", back_populates="innovator_profile")


class SponsorProfile(Base):
    __tablename__ = "sponsor_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    website = Column(String, nullable=True)

    user = relationship("User", back_populates="sponsor_profile")
