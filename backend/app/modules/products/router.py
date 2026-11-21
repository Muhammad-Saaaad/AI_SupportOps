from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.modules.products.schemas import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from backend.app.modules.products.service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await ProductService(db).create(payload)


@router.get("", response_model=list[ProductResponse])
async def list_products(offset: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await ProductService(db).list(offset, limit)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    return await ProductService(db).get(product_id)


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str, payload: ProductUpdate, db: AsyncSession = Depends(get_db)
):
    return await ProductService(db).update(product_id, payload)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db)):
    await ProductService(db).delete(product_id)
