from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from sqlalchemy.orm import Session

from app.core.firebase import verify_firebase_token
from app.db.database import get_db
from app.db.models import User

bearer_scheme = HTTPBearer(auto_error=True)


def get_decoded_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Verifies the Firebase ID token. Use directly (not get_current_user)
    on /auth/register, since there's a Firebase account but no Postgres
    row yet at that point."""
    try:
        return verify_firebase_token(credentials.credentials)
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired, please log in again")
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


def get_current_user(
    decoded_token: dict = Depends(get_decoded_token),
    db: Session = Depends(get_db),
) -> User:
    """Full dependency for normal protected routes: verifies the token
    AND loads the matching Postgres profile."""
    user = db.query(User).filter(User.firebase_uid == decoded_token["uid"]).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile found for this account. Complete registration first.",
        )
    return user


def require_role(*roles):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Not authorized for this role")
        return user
    return checker

def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user