import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    is_read: bool
    created_at: datetime


class ConversationOut(BaseModel):
    id: uuid.UUID
    other_user_id: uuid.UUID
    other_user_name: Optional[str] = None
    other_user_role: str
    last_message_at: datetime | None = None
    last_message_preview: Optional[str] = None
    unread_count: int = 0


class StartConversation(BaseModel):
    other_user_id: uuid.UUID