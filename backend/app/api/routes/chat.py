import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, Conversation, Message
from app.schemas.chat import ConversationOut, MessageCreate, MessageOut, StartConversation

router = APIRouter(prefix="/chat", tags=["chat"])


def _get_or_create_conversation(user_id: uuid.UUID, other_id: uuid.UUID, db: Session) -> Conversation:
    if user_id == other_id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    # Order consistently so (A, B) and (B, A) always map to the same row
    a, b = sorted([user_id, other_id], key=str)

    convo = db.query(Conversation).filter(
        Conversation.user_a_id == a, Conversation.user_b_id == b
    ).first()
    if convo is None:
        convo = Conversation(user_a_id=a, user_b_id=b)
        db.add(convo)
        db.commit()
        db.refresh(convo)
    return convo


@router.post("/conversations", response_model=ConversationOut)
def start_conversation(
    payload: StartConversation,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    other = db.query(User).filter(User.id == payload.other_user_id).first()
    if other is None:
        raise HTTPException(status_code=404, detail="User not found")

    convo = _get_or_create_conversation(current_user.id, other.id, db)
    return ConversationOut(
        id=convo.id,
        other_user_id=other.id,
        other_user_name=other.full_name,
        other_user_role=other.role.value,
        last_message_at=convo.last_message_at,
        last_message_preview=None,
        unread_count=0,
    )


@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convos = (
        db.query(Conversation)
        .filter(or_(Conversation.user_a_id == current_user.id, Conversation.user_b_id == current_user.id))
        .order_by(Conversation.last_message_at.desc())
        .all()
    )

    result = []
    for convo in convos:
        other = convo.user_b if convo.user_a_id == current_user.id else convo.user_a

        last_message = (
            db.query(Message)
            .filter(Message.conversation_id == convo.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        unread_count = (
            db.query(Message)
            .filter(
                Message.conversation_id == convo.id,
                Message.sender_id != current_user.id,
                Message.is_read == False,
            )
            .count()
        )

        result.append(ConversationOut(
            id=convo.id,
            other_user_id=other.id,
            other_user_name=other.full_name,
            other_user_role=other.role.value,
            last_message_at=convo.last_message_at,
            last_message_preview=last_message.content[:100] if last_message else None,
            unread_count=unread_count,
        ))
    return result

def _get_conversation_for_user(conversation_id: uuid.UUID, current_user: User, db: Session) -> Conversation:
    convo = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if convo is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if current_user.id not in (convo.user_a_id, convo.user_b_id):
        raise HTTPException(status_code=403, detail="Not your conversation")
    return convo


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
def get_messages(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convo = _get_conversation_for_user(conversation_id, current_user, db)

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == convo.id)
        .order_by(Message.created_at.asc())
        .all()
    )

    # Mark anything sent by the other person as read, now that this user
    # has fetched the conversation.
    db.query(Message).filter(
        Message.conversation_id == convo.id,
        Message.sender_id != current_user.id,
        Message.is_read == False,  
    ).update({"is_read": True})
    db.commit()

    return messages


@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut)
def send_message(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convo = _get_conversation_for_user(conversation_id, current_user, db)

    message = Message(conversation_id=convo.id, sender_id=current_user.id, content=payload.content)
    db.add(message)
    db.commit()
    db.refresh(message)

    convo.last_message_at = message.created_at
    db.commit()
    return message