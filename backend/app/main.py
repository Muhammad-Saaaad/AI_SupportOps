from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI

from backend.app.db.session import create_database_tables, get_db


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

@app.get("/")
async def read_root(db = Depends(get_db)):
    return {"message": "Welcome to AI SupportOps!"}