import json
from datetime import datetime
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.models import Customer, Order, Product, Ticket


DATA_DIRECTORY = (
    Path(__file__).resolve().parents[3] / "CartNest_AI_SupportOps" / "data"
)


def parse_datetime(value: str | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def read_jsonl(filename: str) -> list[dict]:
    path = DATA_DIRECTORY / filename
    return [
        json.loads(line)
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


async def seed_database(db: AsyncSession) -> None:
    products = json.loads(
        (DATA_DIRECTORY / "products.json").read_text(encoding="utf-8")
    )
    for row in products:
        if await db.get(Product, row["product_id"]) is None:
            db.add(Product(**row))
    await db.commit()

    for row in read_jsonl("customers.jsonl"):
        if await db.get(Customer, row["customer_id"]) is None:
            db.add(
                Customer(
                    customer_id=row["customer_id"],
                    name=row["name"],
                    email=row["email"],
                    city=row["city"],
                    account_status=row["account_status"],
                    tier=row["tier"],
                )
            )
    await db.commit()

    for row in read_jsonl("orders.jsonl"):
        if await db.get(Order, row["order_id"]) is None:
            db.add(
                Order(
                    order_id=row["order_id"],
                    customer_id=row["customer_id"],
                    product_id=row["product_id"],
                    quantity=row["quantity"],
                    total_pkr=row["total_pkr"],
                    order_status=row["order_status"],
                    payment_status=row["payment_status"],
                    payment_method=row["payment_method"],
                    placed_at=parse_datetime(row["placed_at"]),
                    shipped_at=parse_datetime(row["shipped_at"]),
                    delivered_at=parse_datetime(row["delivered_at"]),
                    estimated_delivery_at=parse_datetime(
                        row["estimated_delivery_at"]
                    ),
                    tracking_number=row["tracking_number"],
                )
            )
    await db.commit()

    ticket_files = (
        "historical_tickets_labeled.jsonl",
        "evaluation_tickets_inputs_only.jsonl",
    )
    for filename in ticket_files:
        for row in read_jsonl(filename):
            if await db.get(Ticket, row["ticket_id"]) is None:
                db.add(
                    Ticket(
                        ticket_id=row["ticket_id"],
                        customer_id=row["customer_id"],
                        order_id=row.get("order_id"),
                        channel=row["channel"],
                        subject=row["subject"],
                        message=row["message"],
                        status=row.get("status", "new"),
                        created_at=parse_datetime(row["created_at"]),
                    )
                )
    await db.commit()
