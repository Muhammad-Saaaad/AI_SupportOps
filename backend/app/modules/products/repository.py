from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.models import Product


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, product_id: str) -> Product | None:
        return await self.db.get(Product, product_id)

    async def list(self, offset: int = 0, limit: int = 100) -> list[Product]:
        result = await self.db.execute(
            select(Product).offset(offset).limit(limit).order_by(Product.product_id)
        )
        return list(result.scalars().all())

    async def create(self, product: Product) -> Product:
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def update(self, product: Product, values: dict) -> Product:
        for field, value in values.items():
            setattr(product, field, value)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def delete(self, product: Product) -> None:
        await self.db.delete(product)
        await self.db.commit()
