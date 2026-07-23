from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User, UserRole, Idea, IdeaLike, Deal, DealStage, Conversation, Message
from app.schemas.dashboard import DashboardSummary, DealStageCounts, RecentIdeaSummary, RecentDealSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _stage_counts(deals: list[Deal]) -> DealStageCounts:
    counts = DealStageCounts()
    for deal in deals:
        setattr(counts, deal.stage.value, getattr(counts, deal.stage.value) + 1)
    return counts


def _unread_message_count(user_id, db: Session) -> int:
    return (
        db.query(Message)
        .join(Conversation, Message.conversation_id == Conversation.id)
        .filter(
            or_(Conversation.user_a_id == user_id, Conversation.user_b_id == user_id),
            Message.sender_id != user_id,
            Message.is_read == False,  # noqa: E712
        )
        .count()
    )


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    unread = _unread_message_count(current_user.id, db)

    if current_user.role == UserRole.innovator:
        ideas = db.query(Idea).filter(Idea.innovator_id == current_user.id).all()
        idea_ids = [i.id for i in ideas]
        total_likes = (
            db.query(IdeaLike).filter(IdeaLike.idea_id.in_(idea_ids)).count() if idea_ids else 0
        )

        deals = db.query(Deal).filter(Deal.innovator_id == current_user.id).all()
        recent_deals_raw = sorted(deals, key=lambda d: d.updated_at, reverse=True)[:5]
        recent_ideas_raw = sorted(ideas, key=lambda i: i.created_at, reverse=True)[:5]

        return DashboardSummary(
            role="innovator",
            total_ideas=len(ideas),
            published_ideas=sum(1 for i in ideas if not i.is_draft),
            draft_ideas=sum(1 for i in ideas if i.is_draft),
            total_likes_received=total_likes,
            deal_stage_counts=_stage_counts(deals),
            unread_messages=unread,
            recent_ideas=[RecentIdeaSummary.model_validate(i) for i in recent_ideas_raw],
            recent_deals=[
                RecentDealSummary(
                    id=d.id, idea_id=d.idea_id, idea_title=d.idea.title,
                    other_party_name=d.sponsor.full_name, stage=d.stage.value, updated_at=d.updated_at,
                )
                for d in recent_deals_raw
            ],
        )

    # sponsor
    total_liked = db.query(IdeaLike).filter(IdeaLike.sponsor_id == current_user.id).count()
    deals = db.query(Deal).filter(Deal.sponsor_id == current_user.id).all()
    recent_deals_raw = sorted(deals, key=lambda d: d.updated_at, reverse=True)[:5]

    return DashboardSummary(
        role="sponsor",
        total_liked_ideas=total_liked,
        deal_stage_counts=_stage_counts(deals),
        unread_messages=unread,
        recent_deals=[
            RecentDealSummary(
                id=d.id, idea_id=d.idea_id, idea_title=d.idea.title,
                other_party_name=d.innovator.full_name, stage=d.stage.value, updated_at=d.updated_at,
            )
            for d in recent_deals_raw
        ],
    )