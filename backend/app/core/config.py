import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL") or (
        "postgresql+asyncpg://postgres:"
        f"{os.getenv('POSTGRESQL_PASSWORD', '')}@localhost:5432/CartNest"
    )