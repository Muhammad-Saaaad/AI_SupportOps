from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_db
from backend.app.modules.tickets.schemas import (
    TicketCreate,
    TicketResponse,
    TicketUpdate,
)
from backend.app.modules.tickets.service import TicketService

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(payload: TicketCreate, db: AsyncSession = Depends(get_db)):
    return await TicketService(db).create(payload)


@router.get("", response_model=list[TicketResponse])
async def list_tickets(
    customer_id: str | None = None,
    status: str | None = None,
    offset: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    return await TicketService(db).list(customer_id, status, offset, limit)


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str, db: AsyncSession = Depends(get_db)):
    return await TicketService(db).get(ticket_id)


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str, payload: TicketUpdate, db: AsyncSession = Depends(get_db)
):
    return await TicketService(db).update(ticket_id, payload)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(ticket_id: str, db: AsyncSession = Depends(get_db)):
    await TicketService(db).delete(ticket_id)
