from pydantic import BaseModel, ConfigDict, Field


class CustomerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    account_status: str = "active"
    tier: str = "standard"


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: str | None = Field(default=None, min_length=3, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    account_status: str | None = None
    tier: str | None = None


class CustomerResponse(CustomerCreate):
    customer_id: str
    model_config = ConfigDict(from_attributes=True)
