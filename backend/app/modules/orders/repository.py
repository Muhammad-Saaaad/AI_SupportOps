from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import Order


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, order_id: str) -> Order | None:
        return await self.db.get(Order, order_id)

    async def list(
        self, customer_id: str | None = None, offset: int = 0, limit: int = 100
    ) -> list[Order]:
        statement = select(Order).offset(offset).limit(limit).order_by(Order.order_id)
        if customer_id:
            statement = statement.where(Order.customer_id == customer_id)
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def create(self, order: Order) -> Order:
        self.db.add(order)
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def update(self, order: Order, values: dict) -> Order:
        for field, value in values.items():
            setattr(order, field, value)
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def delete(self, order: Order) -> None:
        await self.db.delete(order)
        await self.db.commit()
