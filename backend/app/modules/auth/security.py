from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from backend.app.core.config import Settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(
    email: str, role: str, customer_id: str | None = None
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=Settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": email,
        "role": role,
        "customer_id": customer_id,
        "exp": expire,
    }
    return jwt.encode(
        payload, Settings.JWT_SECRET_KEY, algorithm=Settings.JWT_ALGORITHM
    )


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            Settings.JWT_SECRET_KEY,
            algorithms=[Settings.JWT_ALGORITHM],
        )
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc
