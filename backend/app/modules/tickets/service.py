from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import Ticket
from backend.db.ids import next_prefixed_id
from backend.app.modules.tickets.repository import TicketRepository
from backend.app.modules.tickets.schemas import TicketCreate, TicketUpdate


class TicketService:
    def __init__(self, db: AsyncSession):
        self.repository = TicketRepository(db)

    async def get(self, ticket_id: str) -> Ticket:
        ticket = await self.repository.get(ticket_id)
        if ticket is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Ticket not found")
        return ticket

    async def list(
        self,
        customer_id: str | None,
        ticket_status: str | None,
        offset: int,
        limit: int,
    ) -> list[Ticket]:
        return await self.repository.list(customer_id, ticket_status, offset, limit)

    async def create(self, payload: TicketCreate) -> Ticket:
        ticket_id = await next_prefixed_id(
            self.repository.db, Ticket, Ticket.ticket_id, "T-", 6
        )
        return await self.repository.create(
            Ticket(ticket_id=ticket_id, **payload.model_dump())
        )

    async def update(self, ticket_id: str, payload: TicketUpdate) -> Ticket:
        ticket = await self.get(ticket_id)
        return await self.repository.update(
            ticket, payload.model_dump(exclude_unset=True)
        )

    async def delete(self, ticket_id: str) -> None:
        ticket = await self.get(ticket_id)
        await self.repository.delete(ticket)
