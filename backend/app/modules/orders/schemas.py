from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrderCreate(BaseModel):
    customer_id: str = Field(min_length=1, max_length=32)
    product_id: str = Field(min_length=1, max_length=32)
    quantity: int = Field(default=1, ge=1)
    total_pkr: int = Field(ge=0)
    order_status: str = Field(min_length=1, max_length=32)
    payment_status: str = Field(min_length=1, max_length=32)
    payment_method: str = Field(min_length=1, max_length=32)
    placed_at: datetime
    shipped_at: datetime | None = None
    delivered_at: datetime | None = None
    estimated_delivery_at: datetime | None = None
    tracking_number: str | None = Field(default=None, max_length=255)


class OrderUpdate(BaseModel):
    quantity: int | None = Field(default=None, ge=1)
    total_pkr: int | None = Field(default=None, ge=0)
    order_status: str | None = Field(default=None, max_length=32)
    payment_status: str | None = Field(default=None, max_length=32)
    payment_method: str | None = Field(default=None, max_length=32)
    shipped_at: datetime | None = None
    delivered_at: datetime | None = None
    estimated_delivery_at: datetime | None = None
    tracking_number: str | None = Field(default=None, max_length=255)


class OrderResponse(OrderCreate):
    order_id: str
    model_config = ConfigDict(from_attributes=True)
