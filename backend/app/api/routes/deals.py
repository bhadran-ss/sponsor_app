import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_current_user, require_role
from app.db.database import get_db
from app.db.models import User, UserRole, Idea, Deal, DealStage
from app.schemas.deal import DealCreate, DealUpdate, DealOut

router = APIRouter(prefix="/deals", tags=["deals"])

# Which stage transitions are actually allowed, and who can make them.
# Kept intentionally simple for v1 — no backward moves except to "passed",
# which either side can do at any point to end things.
SPONSOR_TRANSITIONS = {
    DealStage.interested: {DealStage.in_discussion, DealStage.passed},
    DealStage.in_discussion: {DealStage.term_sheet, DealStage.passed},
    DealStage.term_sheet: {DealStage.passed},
}
INNOVATOR_TRANSITIONS = {
    DealStage.term_sheet: {DealStage.funded, DealStage.passed},
    DealStage.in_discussion: {DealStage.passed},
    DealStage.interested: {DealStage.passed},
}


def _serialize(deal: Deal) -> DealOut:
    out = DealOut.model_validate(deal)
    out.idea_title = deal.idea.title if deal.idea else None
    out.sponsor_name = deal.sponsor.full_name if deal.sponsor else None
    out.innovator_name = deal.innovator.full_name if deal.innovator else None
    return out


@router.post("", response_model=DealOut)
def create_deal(
    payload: DealCreate,
    current_user: User = Depends(require_role(UserRole.sponsor)),
    db: Session = Depends(get_db),
):
    idea = db.query(Idea).filter(Idea.id == payload.idea_id, Idea.is_draft == False).first() 
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")

    existing = db.query(Deal).filter(
        Deal.sponsor_id == current_user.id, Deal.idea_id == idea.id
    ).first()
    if existing:
        return _serialize(existing)  
    
    deal = Deal(
        idea_id=idea.id,
        sponsor_id=current_user.id,
        innovator_id=idea.innovator_id,
        stage=DealStage.interested,
    )
    db.add(deal)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Deal already exists for this idea")
    db.refresh(deal)
    return _serialize(deal)


@router.get("/mine", response_model=list[DealOut])
def list_my_deals(
    current_user: User = Depends(require_role(UserRole.sponsor)),
    db: Session = Depends(get_db),
):
    deals = db.query(Deal).filter(Deal.sponsor_id == current_user.id).order_by(Deal.updated_at.desc()).all()
    return [_serialize(d) for d in deals]


@router.get("/received", response_model=list[DealOut])
def list_received_deals(
    current_user: User = Depends(require_role(UserRole.innovator)),
    db: Session = Depends(get_db),
):
    deals = db.query(Deal).filter(Deal.innovator_id == current_user.id).order_by(Deal.updated_at.desc()).all()
    return [_serialize(d) for d in deals]


def _get_deal_for_participant(deal_id: uuid.UUID, current_user: User, db: Session) -> Deal:
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    if current_user.id not in (deal.sponsor_id, deal.innovator_id):
        raise HTTPException(status_code=403, detail="Not part of this deal")
    return deal


@router.get("/{deal_id}", response_model=DealOut)
def get_deal(
    deal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deal = _get_deal_for_participant(deal_id, current_user, db)
    return _serialize(deal)


@router.patch("/{deal_id}", response_model=DealOut)
def update_deal(
    deal_id: uuid.UUID,
    payload: DealUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deal = _get_deal_for_participant(deal_id, current_user, db)
    is_sponsor = current_user.id == deal.sponsor_id

    if payload.stage is not None and payload.stage != deal.stage:
        allowed = SPONSOR_TRANSITIONS if is_sponsor else INNOVATOR_TRANSITIONS
        valid_next = allowed.get(deal.stage, set())
        if payload.stage not in valid_next:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot move from {deal.stage.value} to {payload.stage.value} as {'sponsor' if is_sponsor else 'innovator'}",
            )
        deal.stage = payload.stage

    # Only the sponsor sets financial terms — the innovator responds via stage changes
    if is_sponsor:
        if payload.offered_amount is not None:
            deal.offered_amount = payload.offered_amount
        if payload.equity_percentage is not None:
            deal.equity_percentage = payload.equity_percentage
        if payload.terms is not None:
            deal.terms = payload.terms

    db.commit()
    db.refresh(deal)
    return _serialize(deal)