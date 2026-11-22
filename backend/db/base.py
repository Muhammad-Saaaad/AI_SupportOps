from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from backend.db import models as _models  # noqa: F401, E402