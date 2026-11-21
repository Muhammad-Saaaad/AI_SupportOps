import type { SupportOpsApi, Snapshot } from "../types";
// Proposed contract. The server must authenticate the session and enforce ownership.
// Demo role and customer identifiers are deliberately never sent as authorization.
export function createHttpApi(base: string): SupportOpsApi {
  async function request<T>(path: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
        method: body ? "POST" : "GET",
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new Error(
        "The API could not be reached. Check the server URL and connection, then retry.",
      );
    }
    if (response.status === 401 || response.status === 403)
      throw new Error(
        "Access denied. A valid server-authenticated session is required.",
      );
    if (!response.ok)
      throw new Error(
        `API request failed (${response.status}). This endpoint may not be implemented yet.`,
      );
    return response.status === 204 ? (undefined as T) : response.json();
  }
  return {
    async snapshot() {
      const [
        tickets,
        orders,
        customers,
        products,
        proposals,
        approvals,
        events,
      ] = await Promise.all(
        [
          "tickets",
          "orders",
          "customers",
          "products",
          "proposals",
          "approvals",
          "events",
        ].map((p) => request<unknown[]>(`/${p}`)),
      );
      return {
        tickets,
        orders,
        customers,
        products,
        proposals,
        approvals,
        events,
      } as Snapshot;
    },
    async createTicket(_, input) {
      const t = await request<{ ticket_id: string }>("/tickets", input);
      return t.ticket_id;
    },
    async process(_, id) {
      await request(`/tickets/${encodeURIComponent(id)}/process`, {});
    },
    async review(_, id, action, content) {
      await request(`/tickets/${encodeURIComponent(id)}/review`, {
        action,
        content,
      });
    },
    async decide(_, id, decision, reason) {
      await request(`/approvals/${encodeURIComponent(id)}/decision`, {
        decision,
        reason,
      });
    },
  };
}
