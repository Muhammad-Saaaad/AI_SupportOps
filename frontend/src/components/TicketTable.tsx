import {
  ChevronRight,
  Mail,
  MessageSquare,
  Globe,
  ArrowUp,
  Minus,
  ArrowDown,
} from "lucide-react";
import { Avatar, Badge, date, shortId } from "./ui";
import type { Ticket, Customer } from "../types";
export function TicketTable({
  tickets,
  customers,
  onOpen,
  customerMode = false,
}: {
  tickets: Ticket[];
  customers: Customer[];
  onOpen: (id: string) => void;
  customerMode?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Ticket / subject</th>
            {!customerMode && <th>Customer</th>}
            <th>Status</th>
            {!customerMode && <th>Priority</th>}
            <th>Created</th>
            <th>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const c = customers.find((c) => c.customer_id === t.customer_id);
            const Icon =
              t.channel === "email"
                ? Mail
                : t.channel === "chat"
                  ? MessageSquare
                  : Globe;
            return (
              <tr key={t.ticket_id}>
                <td>
                  <button
                    className="ticket-link"
                    onClick={() => onOpen(t.ticket_id)}
                  >
                    <span className="ticket-meta">
                      <Icon size={13} />
                      {shortId(t.ticket_id)}
                    </span>
                    <strong>{t.subject}</strong>
                  </button>
                </td>
                {!customerMode && (
                  <td>
                    <div className="person">
                      <Avatar name={c?.name ?? "Customer"} small />
                      <span>{c?.name ?? t.customer_id}</span>
                    </div>
                  </td>
                )}
                <td>
                  <Badge value={t.status} />
                </td>
                {!customerMode && (
                  <td>
                    <span className={`priority ${t.priority ?? "unassigned"}`}>
                      {t.priority === "high" ? (
                        <ArrowUp size={14} />
                      ) : t.priority === "low" ? (
                        <ArrowDown size={14} />
                      ) : (
                        <Minus size={14} />
                      )}{" "}
                      {t.priority
                        ? `${t.priority[0].toUpperCase()}${t.priority.slice(1)}`
                        : "Unassigned"}
                    </span>
                  </td>
                )}
                <td className="muted nowrap">
                  {date(t.created_at).replace(" 2026", "")}
                </td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={`Open ${t.ticket_id}`}
                    onClick={() => onOpen(t.ticket_id)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
