import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.database import get_db
from app.db.models import User
from app.schemas.user import PendingUserOut, UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users/pending", response_model=list[PendingUserOut])
def list_pending_users(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(User)
        .filter(User.is_verified == False)  # noqa: E712
        .order_by(User.created_at.asc())
        .all()
    )


@router.patch("/users/{user_id}/verify", response_model=UserOut)
def verify_user(
    user_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def reject_user(
    user_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Rejects a pending signup — deletes the Postgres row. Note: this does
    NOT delete the Firebase account, so a rejected person could technically
    sign up again. Good enough for now; revisit if that becomes a problem."""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()