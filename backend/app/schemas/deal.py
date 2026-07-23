import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.db.models import DealStage


class DealCreate(BaseModel):
    idea_id: uuid.UUID


class DealUpdate(BaseModel):
    stage: Optional[DealStage] = None
    offered_amount: Optional[Decimal] = None
    equity_percentage: Optional[Decimal] = None
    terms: Optional[str] = None


class DealOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    idea_id: uuid.UUID
    sponsor_id: uuid.UUID
    innovator_id: uuid.UUID
    stage: DealStage
    offered_amount: Optional[Decimal] = None
    equity_percentage: Optional[Decimal] = None
    terms: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    idea_title: Optional[str] = None
    sponsor_name: Optional[str] = None
    innovator_name: Optional[str] = None