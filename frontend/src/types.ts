export type Role = "agent" | "manager" | "customer";
export type Session = { role: Role; customer_id: string; actor_id: string };
export type Category =
  | "delivery_tracking"
  | "delivery_delay"
  | "return_refund"
  | "damaged_wrong_item"
  | "warranty"
  | "cancellation"
  | "payment_problem"
  | "product_question";
export type Status =
  | "new"
  | "triaged"
  | "draft_ready"
  | "pending_review"
  | "responded"
  | "escalated"
  | "closed";
export type Priority = "low" | "medium" | "high";
export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  city: string;
  account_status: string;
  tier: string;
}
export interface Product {
  product_id: string;
  name: string;
  price_pkr: number;
  category: string;
  stock_units: number;
  warranty_months: number;
}
export interface Order {
  order_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  total_pkr: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  placed_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  estimated_delivery_at: string | null;
  tracking_number: string | null;
}
export interface Ticket {
  ticket_id: string;
  customer_id: string;
  order_id: string | null;
  channel: string;
  subject: string;
  message: string;
  created_at: string;
  status: Status;
  category?: Category;
  priority?: Priority;
  reply?: string;
}
export interface Proposal {
  ticket_id: string;
  content: string;
  citations: string[];
  action: string;
  sensitive: boolean;
  status: "draft" | "approved" | "rejected";
  source: "demo_fixture" | "api";
}
export interface AuditEvent {
  id: string;
  ticket_id: string;
  actor_id: string;
  event_type: string;
  outcome: string;
  created_at: string;
  customer_visible?: boolean;
}
export interface Approval {
  id: string;
  ticket_id: string;
  action: string;
  decision: "pending" | "approved" | "rejected" | "escalated";
  reason: string;
  reviewed_by?: string;
}
export interface Snapshot {
  tickets: Ticket[];
  customers: Customer[];
  orders: Order[];
  products: Product[];
  proposals: Proposal[];
  approvals: Approval[];
  events: AuditEvent[];
}
export type TicketInput = Pick<
  Ticket,
  "subject" | "message" | "order_id" | "channel"
>;
export type ReviewAction = "approve" | "reject" | "escalate" | "send";
export interface SupportOpsApi {
  snapshot(session: Session): Promise<Snapshot>;
  createTicket(session: Session, input: TicketInput): Promise<string>;
  process(session: Session, ticketId: string): Promise<void>;
  review(
    session: Session,
    ticketId: string,
    action: ReviewAction,
    content: string,
  ): Promise<void>;
  decide(
    session: Session,
    approvalId: string,
    decision: "approved" | "rejected" | "escalated",
    reason: string,
  ): Promise<void>;
}
