# CartNest AI SupportOps — Fictional Client Starter Pack

**Purpose:** Ready-to-use business requirements and synthetic data for building a production-style customer-support AI application. CartNest does not represent a real customer or actual business data. All emails use the reserved `example.test` domain.

## Read first
1. `docs/CLIENT_BRIEF.md` — company, current workflow, needs, personas, targets.
2. `docs/POLICIES.md` — the business rules AI must follow.
3. `docs/PRD.md` — requirements, APIs, graph nodes, success tests.
4. `docs/IMPLEMENTATION_PLAN.md` — recommended build stages.
5. `docs/KNOWLEDGE_BASE.md` — seed source material for RAG.

## Data files
- `data/products.json` — 12 products with price, stock, warranty.
- `data/customers.jsonl` — 80 synthetic customer accounts.
- `data/orders.jsonl` — 105 synthetic orders and tracking fields.
- `data/historical_tickets_labeled.jsonl` — 160 tickets with expected triage labels.
- `data/evaluation_tickets_inputs_only.jsonl` — 40 withheld evaluation inputs.
- `data/evaluation_tickets_labeled.jsonl` — corresponding expected labels to score results.

All JSONL files contain one JSON object per line. Load them with:

```python
import json
from pathlib import Path
rows = [json.loads(x) for x in Path('data/orders.jsonl').read_text().splitlines()]
print(rows[0])
```

## Important caveats
- These records are generated for engineering practice, not evidence about live businesses.
- Some synthetic customers have multiple orders and support tickets, intentionally.
- Use the `expected_*` fields only for scoring, never as input to the agent.
- Labels are simplified starter benchmarks, not expert-annotated production ground truth.
- Date-based decisions should use actual `delivered_at` values and the synthetic policy documents, not rely on labels.
- No actual payment, shipping, or email provider API is connected.
