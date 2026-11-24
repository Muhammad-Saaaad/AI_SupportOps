import { useEffect, useRef, type ReactNode } from "react";
import { X, Search, Inbox, LoaderCircle } from "lucide-react";
export const pretty = (text: string) =>
  text.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
export const money = (n: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
export const date = (s: string | null, withTime = false) =>
  s
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        day: "2-digit",
        month: "short",
        ...(withTime
          ? { hour: "2-digit", minute: "2-digit" }
          : { year: "numeric" }),
      }).format(new Date(s))
    : "Not recorded";
export const shortId = (s: string) => s.replace("T-HISTORY-", "#");
export function Badge({
  value,
  children,
}: {
  value: string;
  children?: ReactNode;
}) {
  return <span className={`badge ${value}`}>{children ?? pretty(value)}</span>;
}
export function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar ${small ? "small" : ""}`}
      style={
        {
          "--avatar-color": ["#e3ebe8", "#e9e4f1", "#f5e9d9", "#e2edf3"][
            name.charCodeAt(0) % 4
          ],
        } as React.CSSProperties
      }
    >
      {name
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Inbox size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" aria-label="Loading workspace">
      <LoaderCircle className="spin" /> Loading your workspace…
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search tickets, customers, orders…",
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search">
      <Search size={17} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <X size={14} />
        </button>
      )}
    </label>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      aria-labelledby="modal-title"
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <header>
        <h2 id="modal-title">{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
