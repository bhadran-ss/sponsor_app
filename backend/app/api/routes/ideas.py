import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.database import get_db
from app.db.models import IdeaLike, User, UserRole, Idea
from app.schemas.idea import IdeaCreate, IdeaUpdate, IdeaOut

router = APIRouter(prefix="/ideas", tags=["ideas"])


@router.post("", response_model=IdeaOut)
def create_idea(
    payload: IdeaCreate,
    current_user: User = Depends(require_role(UserRole.innovator)),
    db: Session = Depends(get_db),
):
    idea = Idea(innovator_id=current_user.id, **payload.model_dump())
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@router.get("/mine", response_model=list[IdeaOut])
def list_my_ideas(
    current_user: User = Depends(require_role(UserRole.innovator)),
    db: Session = Depends(get_db),
):
    return (
        db.query(Idea)
        .filter(Idea.innovator_id == current_user.id)
        .order_by(Idea.created_at.desc())
        .all()
    )


@router.get("", response_model=list[IdeaOut])
def browse_ideas(
    category: str | None = Query(None),
    dev_stage: str | None = Query(None),
    idea_type: str | None = Query(None),
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(require_role(UserRole.sponsor)),
    db: Session = Depends(get_db),
):
    q = db.query(Idea).filter(Idea.is_draft == False)  
    if category:
        q = q.filter(Idea.category.contains([category]))
    if dev_stage:
        q = q.filter(Idea.dev_stage == dev_stage)
    if idea_type:
        q = q.filter(Idea.idea_type == idea_type)
    ideas = q.order_by(Idea.created_at.desc()).offset(skip).limit(limit).all()

    liked_ids = {
        row.idea_id for row in db.query(IdeaLike).filter(IdeaLike.sponsor_id == current_user.id)
    }
    result = []
    for idea in ideas:
        out = IdeaOut.model_validate(idea)
        out.is_liked = idea.id in liked_ids
        result.append(out)
    return result


def _get_owned_idea(idea_id: uuid.UUID, current_user: User, db: Session) -> Idea:
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    if idea.innovator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your idea")
    return idea


@router.get("/{idea_id}", response_model=IdeaOut)
def get_idea(
    idea_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")

    is_owner = idea.innovator_id == current_user.id
    if not is_owner and (idea.is_draft or current_user.role != UserRole.sponsor):
        raise HTTPException(status_code=404, detail="Idea not found")

    out = IdeaOut.model_validate(idea)
    if current_user.role == UserRole.sponsor:
        out.is_liked = db.query(IdeaLike).filter(
            IdeaLike.sponsor_id == current_user.id, IdeaLike.idea_id == idea.id
        ).first() is not None
    return out


@router.put("/{idea_id}", response_model=IdeaOut)
def update_idea(
    idea_id: uuid.UUID,
    payload: IdeaUpdate,
    current_user: User = Depends(require_role(UserRole.innovator)),
    db: Session = Depends(get_db),
):
    idea = _get_owned_idea(idea_id, current_user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(idea, field, value)
    db.commit()
    db.refresh(idea)
    return idea


@router.delete("/{idea_id}", status_code=204)
def delete_idea(
    idea_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.innovator)),
    db: Session = Depends(get_db),
):
    idea = _get_owned_idea(idea_id, current_user, db)
    db.delete(idea)
    db.commit()
    
@router.post("/{idea_id}/like")
def like_idea(
    idea_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.sponsor)),
    db: Session = Depends(get_db),
):
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.is_draft == False).first()  
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")

    existing = db.query(IdeaLike).filter(
        IdeaLike.sponsor_id == current_user.id, IdeaLike.idea_id == idea_id
    ).first()
    if existing is None:
        db.add(IdeaLike(sponsor_id=current_user.id, idea_id=idea_id))
        db.commit()
    return {"liked": True}


@router.delete("/{idea_id}/like")
def unlike_idea(
    idea_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.sponsor)),
    db: Session = Depends(get_db),
):
    db.query(IdeaLike).filter(
        IdeaLike.sponsor_id == current_user.id, IdeaLike.idea_id == idea_id
    ).delete()
    db.commit()
    return {"liked": False}


@router.get("/liked/list", response_model=list[IdeaOut])
def list_liked_ideas(
    current_user: User = Depends(require_role(UserRole.sponsor)),
    db: Session = Depends(get_db),
):
    liked_ids = {
        row.idea_id for row in db.query(IdeaLike).filter(IdeaLike.sponsor_id == current_user.id)
    }
    ideas = db.query(Idea).filter(Idea.id.in_(liked_ids)).order_by(Idea.created_at.desc()).all()
    result = []
    for idea in ideas:
        out = IdeaOut.model_validate(idea)
        out.is_liked = True
        result.append(out)
    return result