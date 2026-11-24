# CartNest AI SupportOps frontend

A standalone React + TypeScript application in `frontend/`, alongside the existing `backend/`. The backend is unchanged. The interface covers customer intake, support queues, a ticket workbench, human review, manager decisions, policy browsing, and an activity trail.

## Run locally

Requires Node.js 20.19+ (tested on Node 24) and npm.

```sh
cd frontend
npm ci
npm run dev
```

Open the URL printed by Vite. To check the production build:

```sh
npm test
npm run build
npm run preview
```

## Explore the demo

The default support-agent overview explains the product and opens the review queue. Use **Demo mode** or **Switch demo role** to explore:

- **Support agent:** search/filter/sort tickets, open the workbench, read source policy citations, load a scripted proposal, edit and approve/reject a draft, escalate, and separately send a simulated reply.
- **Support manager:** inspect sensitive requests and record approve/reject/escalate decisions with a required review note. No operational action is executed.
- **Customer:** see only synthetic account `C0009`, its orders and tickets; submit a request; inspect approved demo replies. Internal proposals, staff-only events, other customers, and evaluation labels are excluded from this view.

All roles are demo controls, **not authentication**. Demo state is saved under `cartnest-demo-v1` in the browser's local storage. Clearing that key resets the demo. The activity log is append-only through the UI, but browser storage is user-editable and is not a production audit system.

The mock adapter is synchronous in-memory work behind an asynchronous interface; loading is usually brief. Validation, no-results, no-evidence, access-denied, and network failure states are implemented. No real email, refunds, cancellations, replacements, or carrier queries occur.

## Source data and provenance

The source repository was inspected at `74ebb7ed02bf01f4ef33dc5ead9043333362ad78`.

`src/data/` contains the 80 synthetic customers, 105 orders, 12 products, and 160 historical ticket **inputs** from `CartNest_AI_SupportOps/data/`. Historical `expected_*` labels and held-out evaluation records are excluded. Existing source files and backend models are preserved.

The first 24 historical inputs receive hand-authored demo presentation states. Proposal scenarios are independently written in `src/api/mock.ts`; they are not model predictions, test results, or confidence scores. New freeform requests fall back to manual review with no invented policy citations. Stored order details are included only after matching customer ownership. Dashboard counts derive from current demo state; category charts explicitly show the classified subset. Dates use Asia/Karachi and amounts use PKR.

Policy and knowledge text in `src/data/policies.json` comes from the repository's `POLICIES.md` and `KNOWLEDGE_BASE.md`.

## API boundary and backend readiness

`SupportOpsApi` in `src/types.ts` defines the frontend interface. `src/api/mock.ts` implements the working demo. `src/api/http.ts` is a proposed HTTP adapter with cookie credentials, timeouts, access-denied handling, and network errors. It never uses demo role or customer IDs as authorization and never silently falls back to mock data after an API failure.

Copy `.env.example` to `.env` and set `VITE_DATA_MODE=api` and `VITE_API_BASE_URL` only when the server contract is ready. Environment changes require restarting Vite / rebuilding. API mode disables the demo role selector. It does **not** provide a production login flow; a real authenticated session/role provider must replace the initial demo staff presentation before production use.

The inspected FastAPI app currently has only `GET /`. Models exist for Product, Customer, Order, Ticket, TicketEvent, Draft, and ApprovalRequest. The following HTTP routes are **proposals, not existing endpoints**:

| Method | Route | Expected response / purpose |
| --- | --- | --- |
| GET | `/tickets`, `/orders`, `/customers`, `/products` | Authorized arrays matching the TypeScript models |
| GET | `/proposals`, `/approvals`, `/events` | Role-scoped arrays for the staff workspace; customer-safe empty/internal projections where applicable |
| POST | `/tickets` | Create validated ticket; return `{ ticket_id }` |
| POST | `/tickets/{id}/process` | Start the backend workflow |
| POST | `/tickets/{id}/review` | `{ action: approve\|reject\|escalate\|send, content }` |
| POST | `/approvals/{id}/decision` | `{ decision, reason }` |

The server must enforce authenticated identity, role and customer ownership, input validation, state transitions, CSRF protection for cookie authentication, CORS where needed, and durable auditing. Async process jobs need a status/polling contract. Production AI processing, LangGraph, authentication, PostgreSQL reads, notifications and sensitive action execution are intentionally not implemented in this frontend task.

## Structure

- `src/App.tsx`: workspace navigation and page composition
- `src/components/Workbench.tsx`: ticket, evidence, draft and review experience
- `src/components/TicketTable.tsx`, `ui.tsx`: shared UI
- `src/api/`: replaceable mock and HTTP adapters
- `src/types.ts`: domain/API types aligned with backend model names
- `src/data/`: synthetic fixtures and policy sources
- `tests/`: ownership, review transitions, persistence, manager controls and HTTP failure tests

The design uses responsive layouts, keyboard-visible focus, native modal focus trapping, named form inputs, and reduced-motion support. Google Fonts is optional; system font fallbacks work offline. No frontend secrets are required.

## Validation

`npm test`: 8 passing tests for customer isolation, cross-customer rejection, approval-before-send, edited-content reapproval, duplicate-send prevention, request validation, persistence, no-evidence fallback, manager-only decisions, no order mutations, rejection/escalation, and HTTP authorization/network failure.

`npm run build`: TypeScript compilation and Vite production bundle pass.
