# Client Brief — CartNest (fictional)

## Who we are
CartNest is a fictional Pakistan-based e-commerce retailer selling consumer computer accessories and small electronics (mouse, keyboards, chargers, earbuds, power banks, storage and webcams). Prices are in PKR. The sample orders and emails are synthetic.

## What our company does
Customers browse products, place orders on a website, pay by card/bank transfer/cash on delivery, and receive deliveries from a fulfillment team. A support team manages delivery questions, late shipments, returns, damaged goods, warranties, cancellation, checkout failures, and product questions.

## Our current manual support process (AS-IS)
1. Customer submits email, web form, or chat message.
2. Support agent opens the customer profile and checks whether the order belongs to that customer.
3. Agent checks orders and tracking in different internal panels.
4. Agent reads the policy handbook and knowledge base to decide next steps.
5. Agent drafts a reply. Sensitive cases go to a team lead for approval.
6. Agent updates the ticket and records an audit note.

**Business pain points:** repetitive questions, long response times, inconsistent policy application, manual lookups, weak tracking of approval decisions, and no structured AI evaluation.

## Product we're commissioning (TO-BE)
Build **CartNest AI SupportOps**, an internal support-co-pilot with a customer-facing intake API. The AI must classify each ticket, check authenticated order details, retrieve policy evidence, draft a response, suggest a safe next action, and escalate or request human approval when appropriate.

The AI is not an independent money-moving system. An authorized support representative remains responsible for sends, refunds, cancellations, and replacements.

## Team roles
- Customer: submits ticket, views own tickets and order status.
- Support agent: reviews AI drafts, edits responses, approves low-risk ticket updates, escalates when necessary.
- Support manager: approves sensitive refunds/cancellations/replacements and audits decisions.
- Administrator: manages policies, product catalogue, integrations, and access.

## Initial business targets (pilot goals, to measure honestly)
- ≥90% routing accuracy on the held-out evaluation set.
- 100% unauthorized cross-customer order lookups blocked.
- 0 sensitive actions executed without approval.
- ≥95% factual policy compliance on a manually graded held-out test set.
- Median draft generation under 15 seconds on the selected infrastructure (a target, not a promise).

## Constraints
- Use synthetic data and mock outbound email/fulfillment integrations initially.
- Prefer low-cost inference and local development.
- All AI actions must be explainable and traceable, with customer/order and policy references.
- Treat messages and documents as untrusted input; protect against prompt injection.
