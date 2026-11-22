from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import Customer
from backend.db.ids import next_prefixed_id
from backend.app.modules.customers.repository import CustomerRepository
from backend.app.modules.customers.schemas import CustomerCreate, CustomerUpdate


class CustomerService:
    def __init__(self, db: AsyncSession):
        self.repository = CustomerRepository(db)

    async def get(self, customer_id: str) -> Customer:
        customer = await self.repository.get(customer_id)
        if customer is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
        return customer

    async def list(self, offset: int, limit: int) -> list[Customer]:
        return await self.repository.list(offset, limit)

    async def create(self, payload: CustomerCreate) -> Customer:
        customer_id = await next_prefixed_id(
            self.repository.db, Customer, Customer.customer_id, "C", 4
        )
        return await self.repository.create(
            Customer(customer_id=customer_id, **payload.model_dump())
        )

    async def update(self, customer_id: str, payload: CustomerUpdate) -> Customer:
        customer = await self.get(customer_id)
        return await self.repository.update(
            customer, payload.model_dump(exclude_unset=True)
        )

    async def delete(self, customer_id: str) -> None:
        customer = await self.get(customer_id)
        await self.repository.delete(customer)
