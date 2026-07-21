import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class IdeaCreate(BaseModel):
    title: str
    problem: str
    solution: str
    business_model: Optional[str] = None
    funding_requirement: Optional[Decimal] = None
    category: List[str] = []
    dev_stage: Optional[str] = None
    idea_type: Optional[str] = None
    team_details: List[str] = []
    is_patented: bool = False
    is_draft: bool = True


class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    business_model: Optional[str] = None
    funding_requirement: Optional[Decimal] = None
    category: Optional[List[str]] = None
    dev_stage: Optional[str] = None
    idea_type: Optional[str] = None
    team_details: Optional[List[str]] = None
    is_patented: Optional[bool] = None
    is_draft: Optional[bool] = None


class IdeaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    innovator_id: uuid.UUID
    title: str
    problem: str
    solution: str
    business_model: Optional[str] = None
    funding_requirement: Optional[Decimal] = None
    category: Optional[List[str]] = None
    dev_stage: Optional[str] = None
    idea_type: Optional[str] = None
    team_details: Optional[List[str]] = None
    is_patented: bool
    is_draft: bool
    is_liked: bool = False
    pitch_deck_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime