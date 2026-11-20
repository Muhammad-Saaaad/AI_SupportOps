# CartNest Support Policies — Synthetic Business Rules
**Effective date:** 2026-11-20  
**Scope:** Fictional Pakistani online retailer. These rules are for this project only, not legal or real-world commercial advice.

## P-01 — Identity and access
- A logged-in customer may access **only their own** order and ticket information.
- The support assistant must verify order ownership using the authenticated customer ID; knowing an order number alone is insufficient.
- Never disclose address, payment details, or another customer's information.

## P-02 — Order tracking
- Order states: `placed`, `processing`, `shipped`, `in_transit`, `delayed`, `delivered`, `cancelled`, `payment_failed`.
- Tracking numbers are available only after shipment. Never fabricate live carrier updates; the demonstration database is the source of truth.
- A delayed shipment is referred to a human operations queue; do not promise a new delivery date unless the order record supplies it.

## P-03 — Standard returns
- A standard change-of-mind return may be **requested within 7 calendar days of delivery** if the item is unopened and in original packaging.
- Return eligibility is provisional until a human confirms condition and approves the case.
- Returned items are inspected before any refund is issued.

## P-04 — Damaged, defective on arrival, or wrong item
- Report within **48 hours of delivery** where feasible; reports after 48 hours still go to human review, not auto-rejection.
- Ask for photos and package details; never request sensitive payment credentials.
- Replacement/refund action always requires human approval.

## P-05 — Manufacturer warranty
- Warranty duration comes from `products.json` (`warranty_months`). Warranty claims require order lookup and human review.
- No automatic promises that accidental damage is covered.

## P-06 — Cancellation
- Only orders in `placed` or `processing` are eligible for a cancellation **request**.
- A human must approve cancellation before the order is changed.
- Dispatched orders (`shipped`, `in_transit`, `delayed`, `delivered`) cannot be cancelled by the assistant; explain return or escalation options.

## P-07 — Payment problems
- Never ask for passwords, card numbers, OTPs, CVV, or bank credentials.
- For `payment_failed`, advise safe retry/alternate payment and create a human escalation when account-specific investigation is needed.
- Never claim a successful charge or refund unless the system records it.

## P-08 — Responses and actions
- AI may auto-answer low-risk product FAQs and tracking questions with citations to the catalog/order records.
- AI may **draft**, but cannot send customer messages without human review during the MVP pilot.
- AI may never execute refunds, cancellations, replacements, or account changes without human approval and audit recording.
- Unknown/conflicting policy => escalate; do not guess.

## P-09 — Service targets (synthetic SLAs)
- High: initial triage within **1 hour**; Medium: **4 hours**; Low: **1 business day**.
- These are targets for the demo, not guarantees to customers.
