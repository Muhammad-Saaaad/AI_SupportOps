from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.modules.customers.schemas import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
)
from backend.app.modules.customers.service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(payload: CustomerCreate, db: AsyncSession = Depends(get_db)):
    return await CustomerService(db).create(payload)


@router.get("", response_model=list[CustomerResponse])
async def list_customers(offset: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await CustomerService(db).list(offset, limit)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str, db: AsyncSession = Depends(get_db)):
    return await CustomerService(db).get(customer_id)


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str, payload: CustomerUpdate, db: AsyncSession = Depends(get_db)
):
    return await CustomerService(db).update(customer_id, payload)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(customer_id: str, db: AsyncSession = Depends(get_db)):
    await CustomerService(db).delete(customer_id)
