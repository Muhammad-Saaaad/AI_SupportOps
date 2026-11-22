from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.app.modules.orders.schemas import OrderCreate, OrderResponse, OrderUpdate
from backend.app.modules.orders.service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreate, db: AsyncSession = Depends(get_db)):
    return await OrderService(db).create(payload)


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    customer_id: str | None = None,
    offset: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    return await OrderService(db).list(customer_id, offset, limit)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    return await OrderService(db).get(order_id)


@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str, payload: OrderUpdate, db: AsyncSession = Depends(get_db)
):
    return await OrderService(db).update(order_id, payload)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: str, db: AsyncSession = Depends(get_db)):
    await OrderService(db).delete(order_id)
