import { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Package,
  FileText,
  Check,
  RotateCcw,
  Send,
  Flag,
  Clock,
  MessageSquare,
  CircleCheck,
  UserRound,
  BookOpen,
  Pencil,
} from "lucide-react";
import {
  Avatar,
  Badge,
  date,
  money,
  Modal,
  pretty,
  shortId,
  Empty,
} from "./ui";
import type { Snapshot, Ticket, Session, ReviewAction } from "../types";
import policies from "../data/policies.json";
export function Workbench({
  data,
  ticket,
  session,
  busy,
  onProcess,
  onReview,
  onBack,
}: {
  data: Snapshot;
  ticket: Ticket;
  session: Session;
  busy: boolean;
  onProcess: () => void;
  onReview: (a: ReviewAction, text: string) => Promise<boolean>;
  onBack: () => void;
}) {
  const proposal = data.proposals.find((p) => p.ticket_id === ticket.ticket_id);
  const customer = data.customers.find(
    (c) => c.customer_id === ticket.customer_id,
  );
  const order = data.orders.find(
    (o) =>
      o.order_id === ticket.order_id && o.customer_id === ticket.customer_id,
  );
  const product = data.products.find((p) => p.product_id === order?.product_id);
  const [text, setText] = useState(proposal?.content ?? "");
  const [tab, setTab] = useState("conversation");
  const [confirm, setConfirm] = useState<ReviewAction | null>(null);
  const [citation, setCitation] = useState<string | null>(null);
  const events = data.events
    .filter((e) => e.ticket_id === ticket.ticket_id)
    .slice()
    .reverse();
  const isCustomer = session.role === "customer";
  const completed = ["responded", "closed"].includes(ticket.status);
  const cited = policies.find((p) => p.id === citation);
  const approved = proposal?.status === "approved" && proposal.content === text;
  return (
    <>
      <div className="breadcrumb">
        <button onClick={onBack}>Tickets</button>
        <span>/</span>
        <span>{shortId(ticket.ticket_id)}</span>
      </div>
      <div className="page-heading workbench-heading">
        <div>
          <div className="eyebrow">
            {isCustomer ? "YOUR SUPPORT REQUEST" : "TICKET WORKBENCH"}
          </div>
          <h1>{ticket.subject}</h1>
          <div className="inline-meta">
            <Badge value={ticket.status} />
            <span>{shortId(ticket.ticket_id)}</span>
            <span>Opened {date(ticket.created_at, true)} PKT</span>
          </div>
        </div>
        {!isCustomer && (
          <button
            className="button"
            disabled={busy || completed}
            onClick={() => setConfirm("escalate")}
          >
            <Flag size={16} />
            Escalate
          </button>
        )}
      </div>
      <div
        className={`workbench-grid ${isCustomer ? "customer-workbench" : ""}`}
      >
        <div className="stack">
          <section className="panel conversation">
            <div className="tabs">
              <button
                className={tab === "conversation" ? "active" : ""}
                onClick={() => setTab("conversation")}
              >
                <MessageSquare size={16} />
                Conversation
              </button>
              <button
                className={tab === "activity" ? "active" : ""}
                onClick={() => setTab("activity")}
              >
                <Clock size={16} />
                Activity <span>{events.length}</span>
              </button>
            </div>
            {tab === "conversation" ? (
              <div className="panel-pad">
                <div className="message-author">
                  <Avatar name={customer?.name ?? "Customer"} />
                  <div>
                    <strong>{customer?.name ?? ticket.customer_id}</strong>
                    <span>
                      {pretty(ticket.channel)} · {date(ticket.created_at, true)}{" "}
                      PKT
                    </span>
                  </div>
                </div>
                <div className="customer-message">{ticket.message}</div>
                <div className="message-footer">
                  <span>
                    <UserRound size={14} />
                    Customer message
                  </span>
                  <span>Original request</span>
                </div>
                {ticket.reply && (
                  <div className="reply">
                    <Badge value="responded">Approved demo reply</Badge>
                    <p>{ticket.reply}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="panel-pad timeline">
                {events.length ? (
                  events.map((e) => (
                    <div className="timeline-event" key={e.id}>
                      <span className="timeline-dot">
                        <Check size={12} />
                      </span>
                      <div>
                        <strong>{e.event_type}</strong>
                        <p>{e.outcome}</p>
                        <small>
                          {e.actor_id} · {date(e.created_at, true)} PKT
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty
                    title="No updates yet"
                    description="The next update will appear here."
                  />
                )}
              </div>
            )}
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>
                <Package size={18} />
                Order context
              </h2>
              <span className="verified-label">
                <ShieldCheck size={14} />
                Recorded facts
              </span>
            </div>
            {order ? (
              <div className="panel-pad">
                <div className="order-product">
                  <div className="product-icon">
                    <Package size={27} />
                  </div>
                  <div>
                    <h3>{product?.name ?? order.product_id}</h3>
                    <p>
                      {order.order_id} · Qty {order.quantity}
                    </p>
                  </div>
                  <strong>{money(order.total_pkr)}</strong>
                </div>
                <div className="facts">
                  <div>
                    <span>Order status</span>
                    <Badge value={order.order_status} />
                  </div>
                  <div>
                    <span>Payment</span>
                    <strong>
                      {pretty(order.payment_status)} ·{" "}
                      {pretty(order.payment_method)}
                    </strong>
                  </div>
                  <div>
                    <span>Placed</span>
                    <strong>{date(order.placed_at)}</strong>
                  </div>
                  <div>
                    <span>Estimated delivery</span>
                    <strong>{date(order.estimated_delivery_at)}</strong>
                  </div>
                  <div>
                    <span>Delivered</span>
                    <strong>{date(order.delivered_at)}</strong>
                  </div>
                  <div>
                    <span>Product warranty</span>
                    <strong>{product?.warranty_months ?? "—"} months</strong>
                  </div>
                </div>
                <div className="tracking">
                  <Package size={15} />
                  <span>
                    {order.tracking_number ?? "Tracking not recorded"}
                  </span>
                </div>
                <p className="footnote">
                  Synthetic order record. No live carrier connection.
                </p>
              </div>
            ) : (
              <div className="panel-pad">
                <p className="muted">
                  {ticket.order_id
                    ? "This order could not be verified for the customer."
                    : "No order linked to this request."}
                </p>
              </div>
            )}
          </section>
          <section className="panel customer-card">
            <Avatar name={customer?.name ?? "Customer"} />
            <div>
              <strong>{customer?.name ?? ticket.customer_id}</strong>
              <p>{customer?.email}</p>
              <span>
                {customer?.city} · {pretty(customer?.tier ?? "standard")}{" "}
                customer
              </span>
            </div>
          </section>
        </div>
        {!isCustomer && (
          <div className="stack">
            <section className="panel copilot">
              <div className="panel-heading">
                <h2>
                  <Sparkles size={19} />
                  AI copilot
                </h2>
                <Badge value="demo">Scripted demo</Badge>
              </div>
              <div className="panel-pad">
                <p className="muted copilot-intro">
                  From request to a considered reply.
                  <br />
                  You review every step.
                </p>
                <div className="workflow-strip">
                  <span className="done">
                    <Check size={13} />
                    Intake
                  </span>
                  <i />
                  <span className={proposal ? "done" : ""}>
                    <Check size={13} />
                    Evidence
                  </span>
                  <i />
                  <span className={proposal ? "current" : ""}>
                    Human review
                  </span>
                </div>
                {proposal ? (
                  <>
                    <div className="classification">
                      <div>
                        <span>Suggested category</span>
                        <strong>
                          {ticket.category
                            ? pretty(ticket.category)
                            : "Manual review"}
                        </strong>
                      </div>
                      <div>
                        <span>Priority</span>
                        <Badge value={ticket.priority ?? "new"}>
                          {ticket.priority
                            ? pretty(ticket.priority)
                            : "Unassigned"}
                        </Badge>
                      </div>
                    </div>
                    <div className="recommendation">
                      <span className="eyebrow">PROPOSED NEXT STEP</span>
                      <p>{proposal.action}</p>
                      {proposal.sensitive && (
                        <span>
                          <ShieldCheck size={14} />
                          Manager approval required for the action
                        </span>
                      )}
                    </div>
                    <div className="evidence-label">
                      <h3>
                        <BookOpen size={15} />
                        Supporting evidence
                      </h3>
                      <span>{proposal.citations.length} sources</span>
                    </div>
                    {proposal.citations.length ? (
                      <div className="citations">
                        {proposal.citations.map((id) => (
                          <button key={id} onClick={() => setCitation(id)}>
                            <span>{id}</span>
                            {policies.find((p) => p.id === id)?.title}
                            <FileText size={15} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="notice">
                        No matching evidence. Escalate this request for manual
                        review.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="analysis-empty">
                    <Sparkles size={30} />
                    <h3>Ready when you are</h3>
                    <p>
                      Load a sample proposal, policy references, and a suggested
                      next step.
                    </p>
                  </div>
                )}
                <button
                  className="button full"
                  disabled={busy || completed}
                  onClick={onProcess}
                >
                  <RotateCcw size={15} />
                  {busy
                    ? "Processing…"
                    : proposal
                      ? "Run demo analysis again"
                      : "Run AI analysis · demo"}
                </button>
                <p className="footnote">
                  Demo proposals are scripted examples, not AI predictions.
                </p>
              </div>
            </section>
            {proposal && (
              <section className="panel draft-panel">
                <div className="panel-heading">
                  <h2>
                    <Pencil size={17} />
                    Response draft
                  </h2>
                  <Badge value={approved ? "approved" : "draft_ready"}>
                    {approved ? "Approved" : "Not sent"}
                  </Badge>
                </div>
                <div className="panel-pad">
                  <label className="draft-label" htmlFor="draft">
                    AI-generated draft — not sent <span>Simulated</span>
                  </label>
                  <textarea
                    id="draft"
                    value={text}
                    maxLength={6000}
                    onChange={(e) => setText(e.target.value)}
                    disabled={completed || busy}
                    rows={13}
                  />
                  <div className="draft-note">
                    <ShieldCheck size={15} />
                    {approved
                      ? "Approved by a human. Ready for a separate demo send."
                      : "Review the facts and edit the reply before approving."}
                  </div>
                  {!completed && (
                    <div className="draft-actions">
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() => setConfirm("reject")}
                      >
                        Reject draft
                      </button>
                      <button
                        className="button primary"
                        disabled={busy || !text.trim()}
                        onClick={() =>
                          setConfirm(approved ? "send" : "approve")
                        }
                      >
                        {approved ? <Send size={16} /> : <Check size={16} />}{" "}
                        {approved ? "Send demo reply" : "Approve draft"}
                      </button>
                    </div>
                  )}
                  {completed && (
                    <div className="success-note">
                      <CircleCheck size={17} />
                      Reply added to the customer portal. No email sent.
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      {confirm && (
        <Modal
          title={
            confirm === "approve"
              ? "Approve this draft?"
              : confirm === "send"
                ? "Send a demo reply?"
                : confirm === "reject"
                  ? "Reject this draft?"
                  : "Escalate this ticket?"
          }
          onClose={() => setConfirm(null)}
        >
          <p>
            {confirm === "approve"
              ? "This saves your reviewed wording. It does not send a message or authorize a sensitive action."
              : confirm === "send"
                ? "This adds the approved reply to the demo customer portal. No real email will be sent."
                : confirm === "reject"
                  ? "The draft will be marked rejected and the ticket returned for revision."
                  : "This ticket will be marked for specialist review and the decision recorded in the audit log."}
          </p>
          <div className="modal-actions">
            <button className="button" onClick={() => setConfirm(null)}>
              Keep reviewing
            </button>
            <button
              className="button primary"
              disabled={busy}
              onClick={async () => {
                if (await onReview(confirm, text)) setConfirm(null);
              }}
            >
              {busy ? "Saving…" : "Confirm"}
            </button>
          </div>
        </Modal>
      )}
      {cited && (
        <Modal
          title={`${cited.id} · ${cited.title}`}
          onClose={() => setCitation(null)}
        >
          <div className="policy-body">{cited.body}</div>
          <p className="footnote">
            CartNest synthetic business rules · Effective 20 Nov 2026
          </p>
        </Modal>
      )}
    </>
  );
}
