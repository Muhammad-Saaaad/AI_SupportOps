from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import Customer


class CustomerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, customer_id: str) -> Customer | None:
        return await self.db.get(Customer, customer_id)

    async def list(self, offset: int, limit: int) -> list[Customer]:
        result = await self.db.execute(
            select(Customer).offset(offset).limit(limit).order_by(Customer.customer_id)
        )
        return list(result.scalars().all())

    async def create(self, customer: Customer) -> Customer:
        self.db.add(customer)
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def update(self, customer: Customer, values: dict) -> Customer:
        for field, value in values.items():
            setattr(customer, field, value)
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def delete(self, customer: Customer) -> None:
        await self.db.delete(customer)
        await self.db.commit()
