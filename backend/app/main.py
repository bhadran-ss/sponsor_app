from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.firebase import firebase_app  
from app.core import cloudinary_config  
from app.db.database import Base, engine
from app.db import models  
from app.api.routes import auth, profile
app = FastAPI(title="Sponsor App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    # Local dev only — switch to Alembic migrations once stable.
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health():
    return {"status": "ok"}