import enum
import uuid

from sqlalchemy import Column, String, Boolean, Enum, DateTime, Date, ForeignKey, Text, Numeric, UniqueConstraint, func
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
    is_admin = Column(Boolean, default=False, nullable=False)
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

class Idea(Base):
    __tablename__ = "ideas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    innovator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    problem = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    business_model = Column(Text, nullable=True)
    funding_requirement = Column(Numeric(12, 2), nullable=True)

    category = Column(ARRAY(String), nullable=True)
    dev_stage = Column(String, nullable=True)
    idea_type = Column(String, nullable=True)
    team_details = Column(ARRAY(String), nullable=True)

    is_patented = Column(Boolean, default=False, nullable=False)
    is_draft = Column(Boolean, default=True, nullable=False)
    pitch_deck_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    innovator = relationship("User")
    
    
class IdeaLike(Base):
    __tablename__ = "idea_likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sponsor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    idea_id = Column(UUID(as_uuid=True), ForeignKey("ideas.id"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # A sponsor can only like a given idea once — the DB itself enforces
    # this, not just application logic.
    __table_args__ = (UniqueConstraint("sponsor_id", "idea_id", name="uq_sponsor_idea_like"),)
    
    
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Always stored with the lexicographically smaller UUID first — see
    # the get_or_create helper in routes/chat.py. This lets a unique
    # constraint enforce "one conversation per pair" regardless of who
    # started it.
    user_a_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    user_b_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_message_at = Column(DateTime(timezone=True), server_default=func.now())

    user_a = relationship("User", foreign_keys=[user_a_id])
    user_b = relationship("User", foreign_keys=[user_b_id])

    __table_args__ = (UniqueConstraint("user_a_id", "user_b_id", name="uq_conversation_pair"),)


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False, index=True)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User")