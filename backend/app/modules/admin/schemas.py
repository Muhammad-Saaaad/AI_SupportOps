from pydantic import BaseModel, Field


class AdminCreateUser(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(pattern="^(admin|customer)$")
    customer_id: str | None = Field(default=None, max_length=32)


class AdminUpdateUser(BaseModel):
    role: str | None = Field(default=None, pattern="^(admin|customer)$")
    is_active: bool | None = None
    customer_id: str | None = Field(default=None, max_length=32)
