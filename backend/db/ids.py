import re

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute


async def next_prefixed_id(
    db: AsyncSession,
    model: type,
    id_column: InstrumentedAttribute,
    prefix: str,
    width: int,
) -> str:
    result = await db.execute(select(id_column))
    values = result.scalars().all()
    pattern = re.compile(rf"^{re.escape(prefix)}(\d{{{width},}})$")
    suffixes = [
        int(match.group(1))
        for value in values
        if (match := pattern.match(value))
    ]
    return f"{prefix}{max(suffixes, default=0) + 1:0{width}d}"
