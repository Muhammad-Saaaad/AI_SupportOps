import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL") or (
        "postgresql+asyncpg://postgres:"
        f"{os.getenv('POSTGRESQL_PASSWORD', '')}@localhost:5432/CartNest"
    )
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-in-production")
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@cartnest.example.test").lower()
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin123!")
    CUSTOMER_DEFAULT_PASSWORD = os.getenv("CUSTOMER_DEFAULT_PASSWORD", "Customer123!")