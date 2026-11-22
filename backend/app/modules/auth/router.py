from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import Customer, User
from backend.db.ids import next_prefixed_id
from backend.db.session import get_db
from backend.app.modules.auth.schemas import (
    CustomerRegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from backend.app.modules.auth.dependencies import get_current_user
from backend.app.modules.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_customer(
    payload: CustomerRegisterRequest, db: AsyncSession = Depends(get_db)
):
    email = str(payload.email).lower()
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email is already registered")
    customer_id = await next_prefixed_id(
        db, Customer, Customer.customer_id, "C", 4
    )

    customer = Customer(
        customer_id=customer_id,
        name=payload.name,
        email=email,
        city=payload.city,
        account_status="active",
        tier="standard",
    )
    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        role="customer",
        customer_id=customer_id,
    )
    db.add(customer)
    db.add(user)
    await db.commit()

    token = create_access_token(email, "customer", customer_id)
    return TokenResponse(access_token=token, role="customer")


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    email = str(payload.email).lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if (
        user is None
        or not user.is_active
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invalid email or password",
        )

    token = create_access_token(email, user.role, user.customer_id)
    return TokenResponse(access_token=token, role=user.role)


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    email = str(payload.email).lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if (
        user is None
        or user.role != "admin"
        or not user.is_active
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid administrator credentials")

    token = create_access_token(email, "admin")
    return TokenResponse(access_token=token, role="admin")


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user
