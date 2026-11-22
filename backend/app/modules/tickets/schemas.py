from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TicketCreate(BaseModel):
    customer_id: str = Field(min_length=1, max_length=32)
    order_id: str | None = Field(default=None, max_length=32)
    channel: str = "web_form"
    subject: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    category: str | None = None
    priority: str | None = None
    policy_refs: list[str] = Field(default_factory=list)
    recommended_action: str | None = None
    requires_review: bool = False
    status: str = "new"


class TicketUpdate(BaseModel):
    subject: str | None = Field(default=None, min_length=1, max_length=255)
    message: str | None = Field(default=None, min_length=1)
    category: str | None = None
    priority: str | None = None
    policy_refs: list[str] | None = None
    recommended_action: str | None = None
    requires_review: bool | None = None
    status: str | None = None


class TicketResponse(TicketCreate):
    ticket_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
