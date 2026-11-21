from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI

from backend.app.db.session import create_database_tables
from backend.app.modules.customers.router import router as customers_router
from backend.app.modules.orders.router import router as orders_router
from backend.app.modules.products.router import router as products_router
from backend.app.modules.tickets.router import router as tickets_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_database_tables()
    yield


app = FastAPI(
    title="AI SupportOps",
    description="An AI-powered support operations platform.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)
app.include_router(tickets_router)


@app.get("/")
async def read_root():
    return {"message": "Welcome to AI SupportOps!"}