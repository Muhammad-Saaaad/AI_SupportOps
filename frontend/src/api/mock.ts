import customers from "../data/customers.json";
import orders from "../data/orders.json";
import products from "../data/products.json";
import inputs from "../data/tickets.json";
import type {
  Snapshot,
  Session,
  Ticket,
  Proposal,
  Category,
  SupportOpsApi,
  AuditEvent,
} from "../types";

// Hand-authored demonstration scenarios, independent of the dataset's answer keys.
const scenarios: Record<
  string,
  {
    category: Category;
    refs: string[];
    action: string;
    text: string;
    sensitive: boolean;
  }
> = {
  "Delivery Tracking": {
    category: "delivery_tracking",
    refs: ["P-02", "KB-002"],
    action: "Share the recorded shipping status",
    text: "You can find the shipping status recorded for your order below. Tracking details are available after dispatch. These are our stored order details; we do not have a live carrier feed.",
    sensitive: false,
  },
  "Delivery Delay": {
    category: "delivery_delay",
    refs: ["P-02", "KB-001"],
    action: "Request an operations follow-up",
    text: "I’m sorry your delivery has taken longer than expected. We can refer your request to our operations team for an update. We cannot confirm a revised delivery date until it has been verified.",
    sensitive: false,
  },
  "Return Refund": {
    category: "return_refund",
    refs: ["P-03", "KB-003"],
    action: "Review a return request",
    text: "Thank you for contacting us about your return. Please confirm whether the item is unopened and in its original packaging. Standard returns may be requested within 7 calendar days of delivery. Our team will review the delivery date and condition before confirming eligibility; no refund has been issued.",
    sensitive: true,
  },
  "Damaged Wrong Item": {
    category: "damaged_wrong_item",
    refs: ["P-04", "KB-004"],
    action: "Review a replacement request",
    text: "I’m sorry the item you received wasn’t right. Please keep the original packaging and share photos of the item, packaging, and shipping label. We’ll pass those details to our support team to review a replacement or refund request. A team member will confirm the next steps after reviewing the evidence.",
    sensitive: true,
  },
  Warranty: {
    category: "warranty",
    refs: ["P-05", "KB-005"],
    action: "Review a warranty service request",
    text: "We can help you start a warranty review. Please describe the issue and provide your order details. The warranty duration is specific to your product; our team will check coverage and review the claim before confirming service.",
    sensitive: true,
  },
  Cancellation: {
    category: "cancellation",
    refs: ["P-06", "KB-006"],
    action: "Review a cancellation request",
    text: "We’ve received your cancellation request. Only orders that are placed or processing can be considered before shipment. Our team must verify the current order status and approve the request. Your order has not been changed.",
    sensitive: true,
  },
  "Payment Problem": {
    category: "payment_problem",
    refs: ["P-07", "KB-007"],
    action: "Refer payment questions to a specialist",
    text: "I’m sorry you had trouble with payment. We will review the recorded payment status. Please do not share card numbers, CVVs, OTPs, passwords, or bank credentials. If the payment is recorded as failed, you may try a safe alternative payment method. A specialist can review any account-specific charge questions.",
    sensitive: false,
  },
  "Product Question": {
    category: "product_question",
    refs: ["KB-005", "KB-001"],
    action: "Confirm the requested product",
    text: "We deliver consumer accessories across Pakistan. Please confirm which product you’re interested in so our team can check its current catalog price, stock, and warranty. Availability and shipping estimates need to be verified before ordering.",
    sensitive: false,
  },
};
function proposalFor(t: Ticket): Proposal {
  const s = scenarios[t.subject];
  const order = orders.find(
    (o) => o.order_id === t.order_id && o.customer_id === t.customer_id,
  );
  const facts = order
    ? `\n\nRecorded order: ${order.order_id}\nOrder status: ${order.order_status.replaceAll("_", " ")}\nPayment status: ${order.payment_status.replaceAll("_", " ")}${order.tracking_number ? `\nTracking reference: ${order.tracking_number}` : ""}`
    : "";
  return {
    ticket_id: t.ticket_id,
    content: `Hello ${customers.find((c) => c.customer_id === t.customer_id)?.name.split(" ")[0] ?? "there"},\n\n${s?.text ?? "Thank you for reaching out. Your request needs a support specialist to review the details and confirm the appropriate next step."}${facts}\n\nBest,\nCartNest Support`,
    citations: s?.refs ?? [],
    action: s?.action ?? "Manual review — no matching demo scenario",
    sensitive: s?.sensitive ?? false,
    status: "draft",
    source: "demo_fixture",
  };
}
export function seed(): Snapshot {
  const tickets = inputs.map((t) => ({ ...t, status: "new" })) as Ticket[];
  const proposals: Proposal[] = [];
  for (const [i, t] of tickets.entries()) {
    if (i >= 24) continue;
    const s = scenarios[t.subject];
    t.category = s?.category;
    t.priority = [
      "damaged_wrong_item",
      "cancellation",
      "payment_problem",
    ].includes(t.category ?? "")
      ? "high"
      : t.category === "product_question" || t.category === "delivery_tracking"
        ? "low"
        : "medium";
    if (i < 16) {
      t.status = i % 5 === 0 ? "triaged" : "pending_review";
      if (t.status === "pending_review") proposals.push(proposalFor(t));
    } else t.status = i % 3 === 0 ? "escalated" : "triaged";
  }
  const approvals = proposals
    .filter((p) => p.sensitive)
    .map((p) => ({
      id: `A-${p.ticket_id}`,
      ticket_id: p.ticket_id,
      action: p.action,
      decision: "pending" as const,
      reason:
        "Sample review request. Confirm eligibility and evidence before any operational action.",
    }));
  return {
    customers,
    orders,
    products,
    tickets,
    proposals,
    approvals,
    events: proposals.map((p) => ({
      id: `seed-${p.ticket_id}`,
      ticket_id: p.ticket_id,
      actor_id: "Demo fixture",
      event_type: "Sample draft prepared",
      outcome: "Waiting for human review; no message sent.",
      created_at: "2026-11-21T07:00:00Z",
    })),
  };
}
export function createMockApi(
  storage?: Pick<Storage, "getItem" | "setItem">,
): SupportOpsApi {
  let state = seed();
  try {
    const saved = storage?.getItem("cartnest-demo-v1");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.tickets && parsed.events && parsed.proposals) state = parsed;
    }
  } catch {
    /* A fresh demo remains usable when storage is unavailable. */
  }
  const persist = () => {
    try {
      storage?.setItem("cartnest-demo-v1", JSON.stringify(state));
    } catch {
      /* Session remains usable. */
    }
  };
  const staff = (s: Session) => {
    if (s.role === "customer")
      throw new Error(
        "Access denied. This action is available to support staff only.",
      );
  };
  const ticket = (id: string) => {
    const t = state.tickets.find((x) => x.ticket_id === id);
    if (!t) throw new Error("Ticket not found.");
    return t;
  };
  const event = (
    s: Session,
    id: string,
    type: string,
    outcome: string,
    visible = false,
  ) => {
    state.events.push({
      id: crypto.randomUUID(),
      ticket_id: id,
      actor_id: s.actor_id,
      event_type: type,
      outcome,
      created_at: new Date().toISOString(),
      customer_visible: visible,
    });
    persist();
  };
  return {
    async snapshot(s) {
      if (s.role !== "customer") return structuredClone(state);
      const ts = state.tickets.filter((t) => t.customer_id === s.customer_id);
      // Customer responses contain no internal proposals, decisions or staff-only metadata.
      return structuredClone({
        tickets: ts.map(({ category, priority, ...t }) => t),
        customers: state.customers.filter(
          (c) => c.customer_id === s.customer_id,
        ),
        orders: state.orders.filter((o) => o.customer_id === s.customer_id),
        products: state.products,
        proposals: [],
        approvals: [],
        events: state.events
          .filter(
            (e) =>
              e.customer_visible && ts.some((t) => t.ticket_id === e.ticket_id),
          )
          .map((e) => ({ ...e, actor_id: "CartNest Support" })),
      });
    },
    async createTicket(s, input) {
      if (s.role !== "customer")
        throw new Error("Use the customer portal to submit a request.");
      if (
        input.subject.trim().length < 4 ||
        input.subject.length > 150 ||
        input.message.trim().length < 20 ||
        input.message.length > 3000
      )
        throw new Error(
          "Use a subject of 4–150 characters and a message of 20–3,000 characters.",
        );
      if (!["web_form", "email", "chat"].includes(input.channel))
        throw new Error("Invalid contact channel.");
      if (
        input.order_id &&
        !state.orders.some(
          (o) =>
            o.order_id === input.order_id && o.customer_id === s.customer_id,
        )
      )
        throw new Error(
          "Access denied. This order does not belong to your demo account.",
        );
      const id = `T-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      state.tickets.unshift({
        ...input,
        subject: input.subject.trim(),
        message: input.message.trim(),
        ticket_id: id,
        customer_id: s.customer_id,
        status: "new",
        created_at: new Date().toISOString(),
      });
      event(s, id, "Ticket created", "Support request received.", true);
      return id;
    },
    async process(s, id) {
      staff(s);
      const t = ticket(id);
      if (["responded", "closed"].includes(t.status))
        throw new Error("This conversation has already been completed.");
      if (
        t.order_id &&
        !state.orders.some(
          (o) => o.order_id === t.order_id && o.customer_id === t.customer_id,
        )
      )
        throw new Error(
          "Order ownership could not be verified. Escalate for manual review.",
        );
      if (
        state.approvals.some(
          (a) => a.ticket_id === id && a.decision !== "pending",
        )
      )
        throw new Error(
          "A manager already reviewed this case. Escalate for a new review.",
        );
      const p = proposalFor(t);
      const scenario = scenarios[t.subject];
      t.category = scenario?.category;
      t.priority = scenario
        ? ["damaged_wrong_item", "payment_problem", "cancellation"].includes(
            scenario.category,
          )
          ? "high"
          : "medium"
        : undefined;
      state.proposals = state.proposals.filter((x) => x.ticket_id !== id);
      state.proposals.push(p);
      t.status = "pending_review";
      if (p.sensitive && !state.approvals.some((a) => a.ticket_id === id))
        state.approvals.push({
          id: `A-${id}`,
          ticket_id: id,
          action: p.action,
          decision: "pending",
          reason: "Human review required. No operation executed.",
        });
      event(
        s,
        id,
        "Demo analysis completed",
        "Loaded a scripted proposal fixture; this is not an AI prediction.",
      );
    },
    async review(s, id, action, content) {
      staff(s);
      const t = ticket(id);
      const p = state.proposals.find((x) => x.ticket_id === id);
      if (action === "escalate") {
        t.status = "escalated";
        event(s, id, "Ticket escalated", "Referred for specialist review.");
        return;
      }
      if (!p) throw new Error("Generate a proposal before reviewing.");
      if (["responded", "closed"].includes(t.status))
        throw new Error("This reply has already been sent.");
      if (!content.trim() || content.length > 6000)
        throw new Error("Enter a draft between 1 and 6,000 characters.");
      if (action === "approve") {
        p.content = content;
        p.status = "approved";
        t.status = "draft_ready";
        event(
          s,
          id,
          "Draft approved",
          "Human-reviewed draft saved. Sending is a separate step.",
        );
      }
      if (action === "reject") {
        p.status = "rejected";
        t.status = "triaged";
        event(s, id, "Draft rejected", "Draft returned for revision.");
      }
      if (action === "send") {
        if (p.status !== "approved" || content !== p.content)
          throw new Error("Approve the current draft before sending.");
        p.content = content;
        t.reply = content;
        t.status = "responded";
        event(
          s,
          id,
          "Demo reply sent",
          "Approved reply added to the customer portal. No email was sent.",
          true,
        );
      }
    },
    async decide(s, id, decision, reason) {
      if (s.role !== "manager")
        throw new Error("Access denied. Manager review is required.");
      const a = state.approvals.find((x) => x.id === id);
      if (!a) throw new Error("Approval request not found.");
      if (a.decision !== "pending")
        throw new Error("This request has already been reviewed.");
      if (reason.trim().length < 8)
        throw new Error("Add a review note with at least 8 characters.");
      a.decision = decision;
      a.reason = reason.trim();
      a.reviewed_by = s.actor_id;
      if (decision === "escalated") ticket(a.ticket_id).status = "escalated";
      event(
        s,
        a.ticket_id,
        `Request ${decision}`,
        `${reason.trim()} — simulation only; no refund, cancellation, or replacement executed.`,
      );
    },
  };
}
export function customerEvents(events: AuditEvent[], id: string) {
  return events.filter((e) => e.ticket_id === id);
}
