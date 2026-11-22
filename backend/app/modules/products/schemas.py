from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    price_pkr: int = Field(ge=0)
    category: str = Field(min_length=1, max_length=100)
    stock_units: int = Field(default=0, ge=0)
    warranty_months: int = Field(ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    price_pkr: int | None = Field(default=None, ge=0)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    stock_units: int | None = Field(default=None, ge=0)
    warranty_months: int | None = Field(default=None, ge=0)


class ProductResponse(ProductCreate):
    product_id: str
    model_config = ConfigDict(from_attributes=True)
