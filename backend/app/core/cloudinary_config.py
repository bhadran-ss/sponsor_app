import cloudinary

from app.core.config import settings
print("Cloud Name:", settings.CLOUDINARY_CLOUD_NAME)
print("API Key:", settings.CLOUDINARY_API_KEY)
print("API Secret:", settings.CLOUDINARY_API_SECRET[:4] + "****")
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)