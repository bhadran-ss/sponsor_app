import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class DealStageCounts(BaseModel):
    interested: int = 0
    in_discussion: int = 0
    term_sheet: int = 0
    funded: int = 0
    passed: int = 0


class RecentIdeaSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    is_draft: bool
    created_at: datetime


class RecentDealSummary(BaseModel):
    id: uuid.UUID
    idea_id: uuid.UUID
    idea_title: str
    other_party_name: Optional[str] = None
    stage: str
    updated_at: datetime


class DashboardSummary(BaseModel):
    role: str

    # innovator-only
    total_ideas: Optional[int] = None
    published_ideas: Optional[int] = None
    draft_ideas: Optional[int] = None
    total_likes_received: Optional[int] = None

    # sponsor-only
    total_liked_ideas: Optional[int] = None

    # shared
    deal_stage_counts: DealStageCounts = DealStageCounts()
    unread_messages: int = 0
    recent_ideas: List[RecentIdeaSummary] = []
    recent_deals: List[RecentDealSummary] = []