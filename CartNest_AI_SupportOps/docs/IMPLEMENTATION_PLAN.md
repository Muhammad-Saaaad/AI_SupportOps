# Implementation Guide — Build from Zero

## Phase 0 — Explore and validate data
- Read CLIENT_BRIEF, POLICIES, and PRD.
- Load `products.json`, `customers.jsonl`, `orders.jsonl` and confirm all foreign keys.
- Read 20 sample tickets and write expected decision logic; note which tasks require human approval.

## Phase 1 — Backend (no AI)
- Use FastAPI + PostgreSQL + SQLAlchemy + Alembic.
- Create Product, Customer, Order, Ticket, TicketEvent, Draft, ApprovalRequest tables.
- Provide authenticated ticket CRUD, read-only order lookup, and a staff review endpoint.
- Unit-test customer ownership and state transitions.

## Phase 2 — Deterministic LangGraph workflow
- Define TicketState using TypedDict and explicit reducers if concurrent writes are needed.
- Build nodes for validation, category detection (initially rules or mock), order lookup, policy retrieval, drafting, and escalation.
- Test conditional routing on shipping, refunds, warranties, and no-order questions.

## Phase 3 — LLM and RAG
- Replace basic routing/draft with structured LLM outputs.
- Chunk policy and KB files, embed, store in pgvector, and cite document IDs.
- Add hybrid retrieval and reranking only after evaluating basic retrieval.
- Prevent retrieved documents from overriding agent rules.

## Phase 4 — Human-in-the-loop
- Pause on replies and sensitive actions; persist approval state to Postgres checkpointer.
- Add staff reviewer UI and immutable audit events.
- Mock external email and business mutations; add idempotency keys.

## Phase 5 — Evaluate and harden
- Evaluate on evaluation_tickets_inputs_only.jsonl; compare predictions with evaluation_tickets_labeled.jsonl.
- Metrics: category accuracy, priority accuracy, human-approval recall, unauthorized access blocks, response groundedness, latency, token cost.
- Add adversarial tests: malicious ticket prompts, another customer's order ID, duplicate webhook, missing order, API timeout.

## Phase 6 — Deploy
- Compose local FastAPI/Postgres/Redis/worker services, then add GitHub Actions tests.
- Deploy to a low-cost managed platform or VM with HTTPS, secrets, logs, backup and health checks.
- Keep integration connectors mocked until explicitly authorized.

## First five engineering tickets
1. Read docs and sketch the entity relationship diagram.
2. Create SQLAlchemy models and migrations.
3. Implement POST /tickets and GET /tickets/{id} with auth.
4. Implement read-only order lookup with ownership check.
5. Write five integration tests for tracking, cancellation, return, wrong owner, and unknown product.
