import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  LayoutDashboard,
  Inbox,
  ShieldCheck,
  BookOpen,
  History,
  ShoppingBag,
  Sparkles,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Check,
  CheckCheck,
  Clock3,
  Flag,
  Menu,
  X,
  Package,
  CircleHelp,
  ArrowUpRight,
  SlidersHorizontal,
  CircleCheck,
  AlertCircle,
  LogIn,
  Layers3,
  Ticket as TicketIcon,
  Command,
  Mail,
  ListFilter,
} from "lucide-react";
import { api, dataMode } from "./api";
import type { Snapshot, Session, Role, Ticket, Approval } from "./types";
import {
  Avatar,
  Badge,
  date,
  money,
  Modal,
  Empty,
  Loading,
  SearchBox,
  pretty,
  shortId,
} from "./components/ui";
import { TicketTable } from "./components/TicketTable";
import { Workbench } from "./components/Workbench";
import policies from "./data/policies.json";
const roles = {
  agent: "Support agent",
  manager: "Support manager",
  customer: "Customer",
};
const sessionFor = (role: Role): Session => ({
  role,
  customer_id: "C0009",
  actor_id: role === "customer" ? "C0009" : `demo-${role}`,
});
const titles: Record<string, string> = {
  overview: "Overview",
  tickets: "All tickets",
  reviews: "Review queue",
  approvals: "Sensitive approvals",
  orders: "My orders",
  knowledge: "Knowledge base",
  audit: "Activity log",
};
export default function App() {
  const [session, setSession] = useState<Session>(sessionFor("agent"));
  const [page, setPage] = useState("overview");
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [filters, setFilters] = useState(false);
  const [limit, setLimit] = useState(12);
  const [menu, setMenu] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [help, setHelp] = useState(false);
  const [newTicket, setNewTicket] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showOrder, setShowOrder] = useState<string | null>(null);
  const [decision, setDecision] = useState<{
    approval: Approval;
    value: "approved" | "rejected" | "escalated";
  } | null>(null);
  const [reason, setReason] = useState("");
  const customerMode = session.role === "customer";
  const manager = session.role === "manager";
  const reload = useCallback(async () => {
    try {
      setError("");
      setData(await api.snapshot(session));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [session]);
  useEffect(() => {
    setLoading(true);
    setData(null);
    void reload();
  }, [reload]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 5500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>(".topbar .search input")
          ?.focus();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  const navigate = (to: string) => {
    setPage(to);
    setSelected(null);
    setSearch("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
    setChannel("all");
    setFromDate("");
    setLimit(12);
    setMenu(false);
  };
  const open = (id: string) => {
    setSelected(id);
    setMenu(false);
  };
  async function act(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError("");
    try {
      await action();
      await reload();
      setToast(message);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  const pending =
    data?.tickets.filter((t) => t.status === "pending_review") ?? [];
  const unresolved =
    data?.tickets.filter((t) => !["closed", "responded"].includes(t.status)) ??
    [];
  const escalated = data?.tickets.filter((t) => t.status === "escalated") ?? [];
  const ticket = data?.tickets.find((t) => t.ticket_id === selected);
  const activeOrder = data?.orders.find((o) => o.order_id === showOrder);
  const filtered =
    data?.tickets
      .filter((t) => {
        const c = data.customers.find((c) => c.customer_id === t.customer_id);
        return (
          (page !== "reviews" || t.status === "pending_review") &&
          (status === "all" || t.status === status) &&
          (priority === "all" || t.priority === priority) &&
          (category === "all" || t.category === category) &&
          (channel === "all" || t.channel === channel) &&
          (!fromDate || t.created_at.slice(0, 10) >= fromDate) &&
          `${t.subject} ${t.ticket_id} ${t.order_id ?? ""} ${c?.name ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      })
      .sort((a, b) =>
        sort === "priority"
          ? { high: 3, medium: 2, low: 1 }[b.priority ?? "low"] -
            { high: 3, medium: 2, low: 1 }[a.priority ?? "low"]
          : sort === "oldest"
            ? a.created_at.localeCompare(b.created_at)
            : b.created_at.localeCompare(a.created_at),
      ) ?? [];
  const nav = [
    {
      id: "overview",
      label: customerMode ? "My overview" : "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "tickets",
      label: customerMode ? "My tickets" : "All tickets",
      icon: Inbox,
      count: data?.tickets.length,
    },
    ...(customerMode
      ? [{ id: "orders", label: "My orders", icon: ShoppingBag }]
      : [
          {
            id: "reviews",
            label: "Review queue",
            icon: ShieldCheck,
            count: pending.length,
          },
          ...(manager
            ? [
                {
                  id: "approvals",
                  label: "Sensitive approvals",
                  icon: CheckCheck,
                  count: data?.approvals.filter((a) => a.decision === "pending")
                    .length,
                },
              ]
            : []),
        ]),
  ];
  function Queue({ compact = false }: { compact?: boolean }) {
    return (
      <section className="panel queue-panel">
        <div className="panel-heading">
          <div>
            <h2>
              {compact ? "Your attention, where it matters" : "Support tickets"}
            </h2>
            {compact && (
              <p>Review a draft, resolve a question, make someone’s day.</p>
            )}
          </div>
          {compact ? (
            <button className="text-button" onClick={() => navigate("tickets")}>
              View all tickets <ChevronRight size={15} />
            </button>
          ) : (
            <span className="muted">{filtered.length} tickets</span>
          )}
        </div>
        {compact ? (
          <TicketTable
            tickets={data!.tickets
              .filter((t) => t.status === "pending_review")
              .slice(0, 5)}
            customers={data!.customers}
            onOpen={open}
          />
        ) : (
          <>
            <div className="queue-tools">
              <SearchBox
                value={search}
                onChange={(s) => {
                  setSearch(s);
                  setLimit(12);
                }}
              />
              <button
                className={`button ${filters ? "selected" : ""}`}
                onClick={() => setFilters(!filters)}
                aria-expanded={filters}
              >
                <SlidersHorizontal size={15} />
                Filters
              </button>
              <select
                aria-label="Sort tickets"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priority">Highest priority</option>
              </select>
            </div>
            {filters && (
              <div className="filter-row">
                <label>
                  Status
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    {[
                      "new",
                      "triaged",
                      "draft_ready",
                      "pending_review",
                      "responded",
                      "escalated",
                      "closed",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {pretty(s)}
                      </option>
                    ))}
                  </select>
                </label>
                {!customerMode && (
                  <>
                    <label>
                      Priority
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="all">All priorities</option>
                        {["high", "medium", "low"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Category
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="all">All categories</option>
                        {[
                          "delivery_tracking",
                          "delivery_delay",
                          "return_refund",
                          "damaged_wrong_item",
                          "warranty",
                          "cancellation",
                          "payment_problem",
                          "product_question",
                        ].map((c) => (
                          <option key={c} value={c}>
                            {pretty(c)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
                <label>
                  Channel
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option value="all">All channels</option>
                    {["email", "chat", "web_form"].map((c) => (
                      <option key={c} value={c}>
                        {pretty(c)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Created from
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </label>
              </div>
            )}
            {filtered.length ? (
              <>
                <TicketTable
                  tickets={filtered.slice(0, limit)}
                  customers={data!.customers}
                  onOpen={open}
                  customerMode={customerMode}
                />
                <div className="table-footer">
                  <span>
                    Showing {Math.min(limit, filtered.length)} of{" "}
                    {filtered.length} tickets
                  </span>
                  {limit < filtered.length && (
                    <button
                      className="button"
                      onClick={() => setLimit(limit + 12)}
                    >
                      Load more
                    </button>
                  )}
                </div>
              </>
            ) : (
              <Empty
                title="No tickets match"
                description="Try another search or adjust your filters."
              />
            )}
          </>
        )}
      </section>
    );
  }
  return (
    <div className="app-shell">
      {menu && <div className="sidebar-scrim" onClick={() => setMenu(false)} />}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <span className="brand-mark">
            <ShoppingBag size={22} />
          </span>
          <div>
            cartnest<span>AI SUPPORTOPS</span>
          </div>
        </a>
        <div className="workspace-switch">
          <span className="workspace-icon">C</span>
          <div>
            <strong>CartNest workspace</strong>
            <small>Support operations</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-heading">WORKSPACE</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              className={page === n.id && !selected ? "active" : ""}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
              {n.count !== undefined && <b>{n.count}</b>}
            </button>
          ))}
        </nav>
        {!customerMode && (
          <>
            <div className="nav-heading second">RESOURCES</div>
            <nav>
              <button
                className={page === "knowledge" ? "active" : ""}
                onClick={() => navigate("knowledge")}
              >
                <BookOpen size={18} />
                <span>Knowledge base</span>
              </button>
              <button
                className={page === "audit" ? "active" : ""}
                onClick={() => navigate("audit")}
              >
                <History size={18} />
                <span>Activity log</span>
              </button>
            </nav>
          </>
        )}
        <div className="sidebar-bottom">
          <div className="pilot-card">
            <span>
              <Sparkles size={15} />
              THE HUMAN-IN-THE-LOOP PILOT
            </span>
            <h3>AI drafts. You decide.</h3>
            <p>Every reply gets a human touch before it reaches a customer.</p>
            <button onClick={() => setHelp(true)}>
              Explore the workflow <ChevronRight size={14} />
            </button>
          </div>
          <button className="help-link" onClick={() => setHelp(true)}>
            <CircleHelp size={18} />
            How it works
          </button>
          <button
            className="profile"
            disabled={dataMode === "api"}
            onClick={() => setRoleModal(true)}
          >
            <Avatar
              name={
                customerMode
                  ? (data?.customers[0]?.name ?? "Customer")
                  : "Demo Agent"
              }
              small
            />
            <div>
              <strong>
                {customerMode
                  ? (data?.customers[0]?.name ?? "Customer")
                  : "Demo Agent"}
              </strong>
              <span>{roles[session.role]} · Demo</span>
            </div>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-location">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{selected ? "Ticket workbench" : titles[page]}</strong>
          </div>
          <div className="topbar-actions">
            <SearchBox
              value={search}
              onChange={(s) => {
                setSearch(s);
                setSelected(null);
                setPage("tickets");
              }}
              placeholder="Search workspace…"
            />
            <kbd>⌘ K</kbd>
            <span className="top-divider" />
            <button
              className="mode-control"
              disabled={dataMode === "api"}
              onClick={() => setRoleModal(true)}
            >
              <span className="mode-dot" />
              {dataMode === "mock" ? "Demo mode" : "API mode"}
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        <main id="main-content">
          <div className="demo-banner">
            <span>
              <span className="demo-pill">
                {dataMode === "mock" ? "SANDBOX" : "API"}
              </span>
              {dataMode === "mock"
                ? "A safe space to explore. Synthetic data, simulated AI, human decisions."
                : "API mode requires a server-authenticated session. Demo role switching is disabled."}
            </span>
            {dataMode === "mock" && (
              <button onClick={() => setRoleModal(true)}>
                Switch demo role <ChevronRight size={14} />
              </button>
            )}
          </div>
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={19} />
              <span>{error}</span>
              <button className="button" onClick={() => void reload()}>
                Retry
              </button>
              <button
                className="icon-button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {loading ? (
            <Loading />
          ) : data ? (
            <>
              {ticket ? (
                <Workbench
                  key={
                    ticket.ticket_id +
                    (data.proposals.find(
                      (p) => p.ticket_id === ticket.ticket_id,
                    )?.content ?? "")
                  }
                  data={data}
                  ticket={ticket}
                  session={session}
                  busy={busy}
                  onBack={() => navigate("tickets")}
                  onProcess={() =>
                    void act(
                      () => api.process(session, ticket.ticket_id),
                      "Demo proposal loaded. Review the evidence before approving.",
                    )
                  }
                  onReview={(action, content) =>
                    act(
                      () =>
                        api.review(session, ticket.ticket_id, action, content),
                      action === "send"
                        ? "Demo reply sent to the customer portal."
                        : "Review decision saved to the activity log.",
                    )
                  }
                />
              ) : (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">
                        {customerMode
                          ? "CUSTOMER PORTAL"
                          : "SUPPORT, WITH A HUMAN TOUCH"}
                      </div>
                      <h1>
                        {page === "overview"
                          ? customerMode
                            ? `Hello, ${data.customers[0]?.name.split(" ")[0] ?? "there"}.`
                            : "A little clarity. A lot of care."
                          : titles[page]}
                      </h1>
                      <p>
                        {page === "overview"
                          ? customerMode
                            ? "Your orders and conversations, all in one place."
                            : "Your support workspace, ready for the next good conversation."
                          : page === "tickets"
                            ? "Every customer question deserves a thoughtful answer."
                            : page === "reviews"
                              ? "A second look before the conversation moves forward."
                              : page === "approvals"
                                ? "Sensitive requests need a considered human decision."
                                : page === "knowledge"
                                  ? "The policies and product knowledge behind every good answer."
                                  : page === "audit"
                                    ? "A clear record of what happened, who acted, and why."
                                    : "Track your purchases and get help with an order."}
                      </p>
                    </div>
                    {customerMode ? (
                      <button
                        className="button primary"
                        onClick={() => {
                          setOrderId("");
                          setNewTicket(true);
                        }}
                      >
                        <Plus size={17} />
                        New support ticket
                      </button>
                    ) : (
                      <div className="heading-date">
                        <Clock3 size={16} />
                        Sample workspace · Nov 2026
                      </div>
                    )}
                  </div>
                  {page === "overview" && (
                    <>
                      <div className="stats-grid">
                        {[
                          {
                            label: customerMode
                              ? "Your orders"
                              : "Open tickets",
                            value: customerMode
                              ? data.orders.length
                              : unresolved.length,
                            icon: Inbox,
                            detail: customerMode
                              ? "All recorded purchases"
                              : "Across the support workspace",
                            color: "teal",
                          },
                          {
                            label: "Awaiting review",
                            value: pending.length,
                            icon: ShieldCheck,
                            detail: "A human decision is next",
                            color: "purple",
                          },
                          {
                            label: customerMode ? "Replied to" : "Escalated",
                            value: customerMode
                              ? data.tickets.filter(
                                  (t) => t.status === "responded",
                                ).length
                              : escalated.length,
                            icon: customerMode ? Check : Flag,
                            detail: customerMode
                              ? "Replies from our team"
                              : "Ready for specialist attention",
                            color: "orange",
                          },
                          {
                            label: customerMode
                              ? "Open requests"
                              : "High priority",
                            value: customerMode
                              ? unresolved.length
                              : data.tickets.filter(
                                  (t) =>
                                    t.priority === "high" &&
                                    !["closed", "responded"].includes(t.status),
                                ).length,
                            icon: Clock3,
                            detail: customerMode
                              ? "We’re here to help"
                              : "1-hour initial triage target",
                            color: "blue",
                          },
                        ].map((stat) => (
                          <div className="stat-card" key={stat.label}>
                            <div>
                              <span>{stat.label}</span>
                              <span className={`stat-icon ${stat.color}`}>
                                <stat.icon size={18} />
                              </span>
                            </div>
                            <strong>
                              {stat.value.toString().padStart(2, "0")}
                            </strong>
                            <p>{stat.detail}</p>
                          </div>
                        ))}
                      </div>
                      {customerMode ? (
                        <>
                          <section className="customer-welcome">
                            <div>
                              <span className="eyebrow">
                                A LITTLE HELP GOES A LONG WAY
                              </span>
                              <h2>Something not quite right?</h2>
                              <p>
                                Tell us about your order. Our team will take it
                                from here.
                              </p>
                              <button
                                className="button primary"
                                onClick={() => setNewTicket(true)}
                              >
                                <Plus size={16} />
                                Start a conversation
                              </button>
                            </div>
                            <ShoppingBag size={88} />
                          </section>
                          {Queue({})}
                        </>
                      ) : (
                        <>
                          <div className="overview-main">
                            <div className="overview-left">
                              <div className="review-callout">
                                <div className="sparkle-orbit">
                                  <Sparkles size={25} />
                                </div>
                                <div>
                                  <span className="eyebrow">
                                    YOUR COPILOT HAS DONE THE FIRST PASS
                                  </span>
                                  <h2>
                                    {pending.length} conversations. Ready for
                                    your perspective.
                                  </h2>
                                  <p>
                                    Sample drafts and supporting evidence are
                                    waiting for review.
                                  </p>
                                </div>
                                <button
                                  className="button dark"
                                  onClick={() => navigate("reviews")}
                                >
                                  Review drafts
                                </button>
                              </div>
                              {Queue({ compact: true })}
                            </div>
                            <aside className="overview-right">
                              <section className="panel workflow-card">
                                <div className="panel-heading">
                                  <h2>A thoughtful workflow</h2>
                                  <Layers3 size={18} />
                                </div>
                                <p>From a question to a confident reply.</p>
                                <div className="workflow-steps">
                                  {[
                                    {
                                      icon: Inbox,
                                      title: "Understand the request",
                                      text: "Ticket, customer, and order context.",
                                    },
                                    {
                                      icon: BookOpen,
                                      title: "Ground it in evidence",
                                      text: "Relevant policies. Recorded facts.",
                                    },
                                    {
                                      icon: Sparkles,
                                      title: "Prepare a helpful draft",
                                      text: "A suggested reply for your review.",
                                    },
                                    {
                                      icon: ShieldCheck,
                                      title: "Keep a human in control",
                                      text: "Review, approve, then send.",
                                    },
                                  ].map((s, i) => (
                                    <div
                                      className={i === 3 ? "highlight" : ""}
                                      key={s.title}
                                    >
                                      <span>
                                        <s.icon size={18} />
                                      </span>
                                      <section>
                                        <h3>{s.title}</h3>
                                        <p>{s.text}</p>
                                      </section>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  className="text-button"
                                  onClick={() => setHelp(true)}
                                >
                                  See how it works <ChevronRight size={15} />
                                </button>
                              </section>
                              <section className="policy-reminder">
                                <ShieldCheck size={20} />
                                <div>
                                  <h3>Careful by design</h3>
                                  <p>
                                    Refunds, replacements, and cancellations
                                    always need human approval.
                                  </p>
                                  <button
                                    className="text-button"
                                    onClick={() => navigate("knowledge")}
                                  >
                                    Explore the policies
                                  </button>
                                </div>
                              </section>
                            </aside>
                          </div>
                          <div className="bottom-grid">
                            <section className="panel category-panel">
                              <div className="panel-heading">
                                <h2>What’s coming in</h2>
                                <Badge value="demo">
                                  Classified demo subset
                                </Badge>
                              </div>
                              <div className="category-bars">
                                {[
                                  "delivery_tracking",
                                  "delivery_delay",
                                  "return_refund",
                                  "damaged_wrong_item",
                                ].map((c, i) => {
                                  const count = data.tickets.filter(
                                    (t) => t.category === c,
                                  ).length;
                                  return (
                                    <div key={c}>
                                      <span>{pretty(c)}</span>
                                      <div>
                                        <i
                                          style={{
                                            width: `${(count / Math.max(1, ...["delivery_tracking", "delivery_delay", "return_refund", "damaged_wrong_item"].map((c) => data.tickets.filter((t) => t.category === c).length))) * 100}%`,
                                            background: [
                                              "#4b8075",
                                              "#89aaa1",
                                              "#b9c5af",
                                              "#d9b78a",
                                            ][i],
                                          }}
                                        />
                                      </div>
                                      <strong>{count}</strong>
                                    </div>
                                  );
                                })}
                              </div>
                            </section>
                            <section className="panel recent-activity">
                              <div className="panel-heading">
                                <h2>Latest activity</h2>
                                <button
                                  className="text-button"
                                  onClick={() => navigate("audit")}
                                >
                                  View log
                                </button>
                              </div>
                              {data.events
                                .slice(-2)
                                .reverse()
                                .map((e) => (
                                  <button
                                    className="activity-row"
                                    key={e.id}
                                    onClick={() => open(e.ticket_id)}
                                  >
                                    <span className="activity-check">
                                      <Check size={16} />
                                    </span>
                                    <div>
                                      <strong>{e.event_type}</strong>
                                      <p>
                                        {shortId(e.ticket_id)} · {e.actor_id}
                                      </p>
                                    </div>
                                    <small>{date(e.created_at, true)}</small>
                                  </button>
                                ))}
                            </section>
                          </div>
                        </>
                      )}
                      <p className="dashboard-footnote">
                        Counts reflect the current demo state. Service targets
                        are pilot goals, not measured results.
                      </p>
                    </>
                  )}
                  {(page === "tickets" || page === "reviews") && Queue({})}
                  {page === "orders" && (
                    <div className="orders-grid">
                      {data.orders.map((o) => {
                        const p = data.products.find(
                          (p) => p.product_id === o.product_id,
                        );
                        return (
                          <section
                            className="panel order-card"
                            key={o.order_id}
                          >
                            <div className="order-card-top">
                              <span>{o.order_id}</span>
                              <Badge value={o.order_status} />
                            </div>
                            <div className="order-product">
                              <div className="product-icon">
                                <Package size={28} />
                              </div>
                              <div>
                                <h3>{p?.name}</h3>
                                <p>
                                  Qty {o.quantity} · {money(o.total_pkr)}
                                </p>
                              </div>
                            </div>
                            <div className="facts">
                              <div>
                                <span>Ordered</span>
                                <strong>{date(o.placed_at)}</strong>
                              </div>
                              <div>
                                <span>Payment</span>
                                <strong>{pretty(o.payment_status)}</strong>
                              </div>
                            </div>
                            <button
                              className="button full"
                              onClick={() => setShowOrder(o.order_id)}
                            >
                              View order details
                            </button>
                          </section>
                        );
                      })}
                      {!data.orders.length && (
                        <Empty
                          title="No orders yet"
                          description="Your recorded orders will appear here."
                        />
                      )}
                    </div>
                  )}
                  {page === "knowledge" && (
                    <>
                      <div className="knowledge-search">
                        <SearchBox
                          value={search}
                          onChange={setSearch}
                          placeholder="Search policies and knowledge articles…"
                        />
                        <span>{policies.length} source documents</span>
                      </div>
                      <div className="knowledge-grid">
                        {policies
                          .filter((p) =>
                            `${p.id} ${p.title} ${p.body}`
                              .toLowerCase()
                              .includes(search.toLowerCase()),
                          )
                          .map((p) => (
                            <details
                              className="panel knowledge-card"
                              key={p.id}
                            >
                              <summary>
                                <span className="policy-id">{p.id}</span>
                                <h3>{p.title}</h3>
                                <ChevronDown size={18} />
                              </summary>
                              <div className="policy-body">{p.body}</div>
                            </details>
                          ))}
                      </div>
                      <p className="footnote">
                        Synthetic CartNest policies · Effective 20 November 2026
                        · Read only
                      </p>
                    </>
                  )}
                  {page === "audit" && (
                    <section className="panel">
                      <div className="queue-tools">
                        <SearchBox
                          value={search}
                          onChange={setSearch}
                          placeholder="Search actions, actors, or ticket IDs…"
                        />
                        <Badge value="demo">Demo audit trail</Badge>
                      </div>
                      <div className="audit-list">
                        {data.events
                          .filter((e) =>
                            `${e.ticket_id} ${e.actor_id} ${e.event_type} ${e.outcome}`
                              .toLowerCase()
                              .includes(search.toLowerCase()),
                          )
                          .slice()
                          .reverse()
                          .map((e) => (
                            <div className="audit-event" key={e.id}>
                              <span className="activity-check">
                                <History size={17} />
                              </span>
                              <div>
                                <strong>{e.event_type}</strong>
                                <p>{e.outcome}</p>
                                <span>
                                  {e.actor_id} ·{" "}
                                  <button
                                    className="text-button"
                                    onClick={() => open(e.ticket_id)}
                                  >
                                    {shortId(e.ticket_id)}
                                  </button>
                                </span>
                              </div>
                              <time>{date(e.created_at, true)} PKT</time>
                            </div>
                          ))}
                      </div>
                    </section>
                  )}
                  {page === "approvals" &&
                    (manager ? (
                      <div className="approval-grid">
                        {data.approvals.map((a) => {
                          const t = data.tickets.find(
                            (t) => t.ticket_id === a.ticket_id,
                          );
                          return (
                            <section className="panel approval-card" key={a.id}>
                              <div className="panel-heading">
                                <Badge value={a.decision} />
                                <span>{shortId(a.ticket_id)}</span>
                              </div>
                              <div className="panel-pad">
                                <h2>{a.action}</h2>
                                <p>{t?.message}</p>
                                <div className="approval-context">
                                  <Package size={16} />
                                  {t?.order_id ?? "No order linked"}
                                  <span>·</span>
                                  {
                                    data.customers.find(
                                      (c) => c.customer_id === t?.customer_id,
                                    )?.name
                                  }
                                </div>
                                <p className="notice">{a.reason}</p>
                                <button
                                  className="text-button"
                                  onClick={() => open(a.ticket_id)}
                                >
                                  Inspect ticket and evidence{" "}
                                  <ChevronRight size={15} />
                                </button>
                                {a.decision === "pending" && (
                                  <div className="approval-actions">
                                    <button
                                      className="button"
                                      onClick={() => {
                                        setReason("");
                                        setDecision({
                                          approval: a,
                                          value: "rejected",
                                        });
                                      }}
                                    >
                                      Reject
                                    </button>
                                    <button
                                      className="button"
                                      onClick={() => {
                                        setReason("");
                                        setDecision({
                                          approval: a,
                                          value: "escalated",
                                        });
                                      }}
                                    >
                                      Escalate
                                    </button>
                                    <button
                                      className="button primary"
                                      onClick={() => {
                                        setReason("");
                                        setDecision({
                                          approval: a,
                                          value: "approved",
                                        });
                                      }}
                                    >
                                      Approve
                                    </button>
                                  </div>
                                )}
                              </div>
                            </section>
                          );
                        })}
                        {!data.approvals.length && (
                          <Empty
                            title="All clear"
                            description="Sensitive requests will appear here when they need review."
                          />
                        )}
                      </div>
                    ) : (
                      <Empty
                        title="Manager access required"
                        description="Switch to the manager demo role to review sensitive requests."
                      />
                    ))}
                </>
              )}
            </>
          ) : (
            !loading && (
              <Empty
                title="Workspace unavailable"
                description="Check the connection details and retry loading the workspace."
              >
                <button className="button" onClick={() => void reload()}>
                  Retry
                </button>
              </Empty>
            )
          )}
          <footer className="app-footer">
            <span>
              cartnest <span>Support with care.</span>
            </span>
            <span>
              <ShieldCheck size={13} />
              Human-led. Evidence-backed.
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CircleCheck size={19} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {roleModal && (
        <Modal
          title="Explore a different perspective"
          onClose={() => setRoleModal(false)}
        >
          <p>
            This demo role switch is for exploring the product. It is not
            authentication.
          </p>
          <div className="role-options">
            {(["agent", "manager", "customer"] as Role[]).map((r) => (
              <button
                key={r}
                className={session.role === r ? "selected" : ""}
                onClick={() => {
                  setSession(sessionFor(r));
                  navigate("overview");
                  setRoleModal(false);
                }}
              >
                <span className="role-icon">
                  {r === "agent" ? (
                    <Inbox />
                  ) : r === "manager" ? (
                    <ShieldCheck />
                  ) : (
                    <ShoppingBag />
                  )}
                </span>
                <div>
                  <strong>{roles[r]}</strong>
                  <span>
                    {r === "agent"
                      ? "Triage tickets, inspect evidence, and review drafts."
                      : r === "manager"
                        ? "Review sensitive requests and the activity trail."
                        : "View one demo account’s orders and create tickets."}
                  </span>
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
          <p className="footnote">
            All customer records are synthetic. Customer view is scoped to
            C0009.
          </p>
        </Modal>
      )}
      {help && (
        <Modal
          title="Good support is a team effort."
          onClose={() => setHelp(false)}
        >
          <p>
            CartNest brings customer context, policy evidence, and human review
            into one workspace.
          </p>
          <ol className="help-steps">
            <li>
              <strong>Start with the customer.</strong> Open a ticket to read
              the request and the linked order record.
            </li>
            <li>
              <strong>Let the copilot prepare.</strong> Run demo analysis to
              load a scripted proposal and policy citations.
            </li>
            <li>
              <strong>Make it your own.</strong> Read the evidence, edit the
              draft, then approve or reject it.
            </li>
            <li>
              <strong>Review before acting.</strong> Send a simulated reply
              separately. Managers review sensitive requests; the demo never
              executes them.
            </li>
          </ol>
          <div className="notice">
            The backend currently exposes a welcome endpoint only. This frontend
            uses local synthetic fixtures; AI processing, authentication, and
            production APIs are future integration work.
          </div>
          <div className="modal-actions">
            <button
              className="button primary"
              onClick={() => {
                setHelp(false);
                if (!customerMode) open("T-HISTORY-0004");
              }}
            >
              Explore the workspace
            </button>
          </div>
        </Modal>
      )}
      {newTicket && data && (
        <Modal title="Let’s get it sorted." onClose={() => setNewTicket(false)}>
          <p>
            Tell us what happened. Our support team will review your request.
          </p>
          <form
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              let id = "";
              if (
                await act(async () => {
                  id = await api.createTicket(session, {
                    subject: String(fd.get("subject")),
                    message: String(fd.get("message")),
                    order_id: String(fd.get("order")) || null,
                    channel: String(fd.get("channel")),
                  });
                }, "Your support ticket has been created.")
              ) {
                setNewTicket(false);
                open(id);
              }
            }}
          >
            <label>
              Subject
              <input
                name="subject"
                required
                minLength={4}
                maxLength={150}
                placeholder="What can we help with?"
              />
            </label>
            <label>
              Related order
              <select name="order" defaultValue={orderId}>
                <option value="">No related order</option>
                {data.orders.map((o) => (
                  <option key={o.order_id} value={o.order_id}>
                    {o.order_id} ·{" "}
                    {
                      data.products.find((p) => p.product_id === o.product_id)
                        ?.name
                    }
                  </option>
                ))}
              </select>
            </label>
            <label>
              Message
              <textarea
                name="message"
                required
                minLength={20}
                maxLength={3000}
                rows={5}
                placeholder="Share a few details so we can help. Please don’t include passwords or payment credentials."
              />
            </label>
            <label>
              Contact channel
              <select name="channel">
                <option value="web_form">Web form</option>
                <option value="email">Email</option>
                <option value="chat">Chat</option>
              </select>
            </label>
            <p className="footnote">
              20–3,000 characters. Your request stays in this browser’s demo
              workspace.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button"
                onClick={() => setNewTicket(false)}
              >
                Cancel
              </button>
              <button className="button primary" disabled={busy}>
                {busy ? "Creating…" : "Create support ticket"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {activeOrder && data && (
        <Modal
          title={`Order ${activeOrder.order_id}`}
          onClose={() => setShowOrder(null)}
        >
          <div className="order-product">
            <div className="product-icon">
              <Package size={28} />
            </div>
            <div>
              <h3>
                {
                  data.products.find(
                    (p) => p.product_id === activeOrder.product_id,
                  )?.name
                }
              </h3>
              <p>
                {money(activeOrder.total_pkr)} · Qty {activeOrder.quantity}
              </p>
            </div>
          </div>
          <Badge value={activeOrder.order_status} />
          <dl className="order-details">
            {[
              ["Placed", date(activeOrder.placed_at)],
              ["Shipped", date(activeOrder.shipped_at)],
              ["Estimated delivery", date(activeOrder.estimated_delivery_at)],
              ["Delivered", date(activeOrder.delivered_at)],
              ["Tracking", activeOrder.tracking_number ?? "Not recorded"],
              [
                "Payment",
                `${pretty(activeOrder.payment_status)} · ${pretty(activeOrder.payment_method)}`,
              ],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="footnote">
            Stored synthetic order facts. No live carrier updates.
          </p>
          <div className="modal-actions">
            <button
              className="button primary"
              onClick={() => {
                setOrderId(activeOrder.order_id);
                setShowOrder(null);
                setNewTicket(true);
              }}
            >
              Get help with this order
            </button>
          </div>
        </Modal>
      )}
      {decision && (
        <Modal
          title={`${pretty(decision.value)} · sensitive request`}
          onClose={() => setDecision(null)}
        >
          <p>
            {decision.approval.action}. This records a simulated manager
            decision. It will not issue a refund, cancel an order, or replace a
            product.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await act(
                  () =>
                    api.decide(
                      session,
                      decision.approval.id,
                      decision.value,
                      reason,
                    ),
                  "Manager decision recorded. No operational action executed.",
                )
              )
                setDecision(null);
            }}
          >
            <label>
              Review note
              <textarea
                required
                minLength={8}
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Explain the decision and what should happen next."
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="button"
                onClick={() => setDecision(null)}
              >
                Cancel
              </button>
              <button className="button primary" disabled={busy}>
                {busy ? "Saving…" : "Record demo decision"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
