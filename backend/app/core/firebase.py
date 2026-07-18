"""
Firebase is used ONLY for authentication in this project.
The Admin SDK's one job: verify the ID token the React frontend sends
after a user signs in/up with the Firebase client SDK.
"""
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from app.core.config import settings

_cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
firebase_app = firebase_admin.initialize_app(_cred)


def verify_firebase_token(id_token: str) -> dict:
    return firebase_auth.verify_id_token(id_token)