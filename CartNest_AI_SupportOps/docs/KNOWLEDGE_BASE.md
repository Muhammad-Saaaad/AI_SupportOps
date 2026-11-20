# CartNest Knowledge Base — Synthetic source documents

## KB-001 — Shipping overview
CartNest ships consumer accessories throughout Pakistan. Demo order shipping status and ETA are shown in the `orders` table. Estimated delivery is not guaranteed. If a shipment is delayed, create an operations follow-up.

## KB-002 — How to track an order
Sign in to your CartNest account, open Orders, select the order, and view the tracking number once it has shipped. If no tracking code is present for an unshipped order, explain that dispatch has not yet occurred. Never invent live carrier events.

## KB-003 — Standard return instructions
To request a standard return, provide the order number and reason; support checks delivery date against policy P-03. If eligible, staff issue a return-case number and provide packing instructions. Do not promise an immediate refund.

## KB-004 — Damaged-item reports
Ask the customer to keep packaging and provide photos of damage, received item, and shipping label. Forward the claim to support review under P-04.

## KB-005 — Product prices and warranty
Only use the latest values from `products.json`. Most peripherals and audio items have 12-month warranty; charging products have 6 months in this synthetic catalogue. Verify per product.

## KB-006 — Cancellations
Cancellation requests are possible before shipment, but must go to a human for approval (P-06). Once shipped, provide return/escalation guidance rather than promising cancellation.

## KB-007 — Failed payment
Check `payment_status` first; a failed payment is not a paid order. Recommend a safe retry or customer support escalation; never request full card numbers or OTPs.
