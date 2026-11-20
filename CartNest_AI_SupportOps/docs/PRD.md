# Product Requirements Document (PRD) — CartNest AI SupportOps

## Release 1: MVP functional requirements
| ID | Requirement | Acceptance test |
|---|---|---|
| FR-01 | Create/read customer support tickets via authenticated API | Customer can create and view own tickets |
| FR-02 | Classify into 8 categories and assign priority | Output is structured, schema-valid, and benchmarked |
| FR-03 | Check order ownership before order lookup | Request from wrong account is rejected and logged |
| FR-04 | Read order status, payment state, and tracking number | Agent never invents a status or tracking code |
| FR-05 | Retrieve relevant product/policy information | Draft cites policy IDs (e.g. P-03) and order record IDs |
| FR-06 | Draft a customer reply with transparent uncertainty | Human can accept/edit/reject |
| FR-07 | Submit sensitive operations for approval | Cancellation, refund, replacement cannot execute without approval |
| FR-08 | Persistent ticket states | Statuses: new, triaged, draft_ready, pending_review, responded, escalated, closed |
| FR-09 | Append-only audit events | Every action stores actor, timestamp, ticket_id, and outcome |
| FR-10 | Agent evaluations and trace links | At least 40 held-out tickets tested with stable metrics |

## Non-functional requirements
- Secure secrets; role-based access; bounded input length; rate limiting; validated tool arguments.
- Idempotency for any future email-send or order mutation calls.
- Background processing with retries, timeouts, and dead-letter escalation for failed work.
- Logs and traces avoid raw credentials, card data, and unnecessary personal details.
- Deployment includes health checks, backup plan, and rollback instructions.

## Proposed LangGraph nodes
`intake_validation` → `authorize_customer` → `classify` → `lookup_order` (if applicable) → `retrieve_policy` → `draft_response` → `policy_guard` → `human_review` (if needed) → `mock_send` / `escalate` → `audit_and_close`.

## State fields
`ticket_id`, `customer_id`, `message`, `category`, `priority`, `order_id`, `order_summary`, `policy_refs`, `draft_response`, `recommended_action`, `requires_review`, `approval_decision`, `status`, `errors`.

## Suggested API endpoints
- `POST /tickets` — submit ticket
- `GET /tickets/{ticket_id}` — get ticket if authorized
- `POST /tickets/{ticket_id}/process` — initiate AI processing
- `GET /tickets/{ticket_id}/proposal` — inspect draft/action
- `POST /tickets/{ticket_id}/review` — approve/edit/reject (authorized support user)
- `GET /orders/{order_id}` — authorized order lookup
- `GET /metrics` — staff-only operational dashboard

## Exclusions from MVP
- Live payment/refund APIs, direct carrier feeds, real customer mailboxes, fully autonomous sends, and production access to real customer PII.
