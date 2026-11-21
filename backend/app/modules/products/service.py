from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import Product
from backend.app.modules.products.repository import ProductRepository
from backend.app.modules.products.schemas import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db: AsyncSession):
        self.repository = ProductRepository(db)

    async def get(self, product_id: str) -> Product:
        product = await self.repository.get(product_id)
        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
        return product

    async def list(self, offset: int, limit: int) -> list[Product]:
        return await self.repository.list(offset, limit)

    async def create(self, payload: ProductCreate) -> Product:
        if await self.repository.get(payload.product_id):
            raise HTTPException(status.HTTP_409_CONFLICT, "Product already exists")
        return await self.repository.create(Product(**payload.model_dump()))

    async def update(self, product_id: str, payload: ProductUpdate) -> Product:
        product = await self.get(product_id)
        values = payload.model_dump(exclude_unset=True)
        return await self.repository.update(product, values)

    async def delete(self, product_id: str) -> None:
        product = await self.get(product_id)
        await self.repository.delete(product)
