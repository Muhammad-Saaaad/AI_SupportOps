from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import Order
from backend.app.modules.orders.repository import OrderRepository
from backend.app.modules.orders.schemas import OrderCreate, OrderUpdate


class OrderService:
    def __init__(self, db: AsyncSession):
        self.repository = OrderRepository(db)

    async def get(self, order_id: str) -> Order:
        order = await self.repository.get(order_id)
        if order is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
        return order

    async def list(
        self, customer_id: str | None, offset: int, limit: int
    ) -> list[Order]:
        return await self.repository.list(customer_id, offset, limit)

    async def create(self, payload: OrderCreate) -> Order:
        if await self.repository.get(payload.order_id):
            raise HTTPException(status.HTTP_409_CONFLICT, "Order already exists")
        return await self.repository.create(Order(**payload.model_dump()))

    async def update(self, order_id: str, payload: OrderUpdate) -> Order:
        order = await self.get(order_id)
        return await self.repository.update(
            order, payload.model_dump(exclude_unset=True)
        )

    async def delete(self, order_id: str) -> None:
        order = await self.get(order_id)
        await self.repository.delete(order)
