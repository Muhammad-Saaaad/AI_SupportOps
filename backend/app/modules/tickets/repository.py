from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import Ticket


class TicketRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, ticket_id: str) -> Ticket | None:
        return await self.db.get(Ticket, ticket_id)

    async def list(
        self,
        customer_id: str | None = None,
        status: str | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> list[Ticket]:
        statement = select(Ticket).offset(offset).limit(limit).order_by(Ticket.created_at.desc())
        if customer_id:
            statement = statement.where(Ticket.customer_id == customer_id)
        if status:
            statement = statement.where(Ticket.status == status)
        result = await self.db.execute(statement)
        return list(result.scalars().all())

    async def create(self, ticket: Ticket) -> Ticket:
        self.db.add(ticket)
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def update(self, ticket: Ticket, values: dict) -> Ticket:
        for field, value in values.items():
            setattr(ticket, field, value)
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def delete(self, ticket: Ticket) -> None:
        await self.db.delete(ticket)
        await self.db.commit()
