import { describe, it, expect } from "vitest";
import { createMockApi } from "../src/api/mock";
import type { Session } from "../src/types";
const customer: Session = {
  role: "customer",
  customer_id: "C0009",
  actor_id: "C0009",
};
const agent: Session = {
  role: "agent",
  customer_id: "C0009",
  actor_id: "demo-agent",
};
const manager: Session = {
  role: "manager",
  customer_id: "C0009",
  actor_id: "demo-manager",
};
const input = {
  subject: "Need help with my item",
  message: "I received the wrong item and would like your help.",
  order_id: "CN-00062",
  channel: "web_form",
};
describe("customer ownership and review workflow", () => {
  it("scopes customer records and strips internal proposals and labels", async () => {
    const api = createMockApi();
    const data = await api.snapshot(customer);
    expect(data.tickets.length).toBeGreaterThan(0);
    expect(
      data.orders.every((o) => o.customer_id === customer.customer_id),
    ).toBe(true);
    expect(
      data.tickets.every((t) => t.customer_id === customer.customer_id),
    ).toBe(true);
    expect(data.customers.map((c) => c.customer_id)).toEqual(["C0009"]);
    expect(data.proposals).toEqual([]);
    expect(data.approvals).toEqual([]);
    expect(data.events).toEqual([]);
    expect(
      data.tickets.every((t) => !("category" in t) && !("priority" in t)),
    ).toBe(true);
    expect(JSON.stringify(data)).not.toContain("expected_category");
  });
  it("rejects cross-customer order attachment and staff actions from a customer", async () => {
    const api = createMockApi();
    await expect(
      api.createTicket(customer, { ...input, order_id: "CN-00001" }),
    ).rejects.toThrow("Access denied");
    await expect(api.process(customer, "T-HISTORY-0004")).rejects.toThrow(
      "Access denied",
    );
    await expect(
      api.review(customer, "T-HISTORY-0004", "approve", "test"),
    ).rejects.toThrow("Access denied");
  });
  it("requires approval of exact content, separates sending, and prevents duplicate sends", async () => {
    const api = createMockApi();
    const id = "T-HISTORY-0004";
    const before = await api.snapshot(agent);
    const proposal = before.proposals.find((p) => p.ticket_id === id)!;
    await expect(
      api.review(agent, id, "send", proposal.content),
    ).rejects.toThrow("Approve");
    const edited = proposal.content + "\nWe will review the photos.";
    await api.review(agent, id, "approve", edited);
    let data = await api.snapshot(customer);
    expect(data.tickets.find((t) => t.ticket_id === id)?.reply).toBeUndefined();
    await expect(
      api.review(agent, id, "send", edited + " altered"),
    ).rejects.toThrow("Approve");
    await api.review(agent, id, "send", edited);
    data = await api.snapshot(customer);
    expect(data.tickets.find((t) => t.ticket_id === id)?.reply).toBe(edited);
    expect(data.events).toHaveLength(1);
    await expect(api.review(agent, id, "send", edited)).rejects.toThrow(
      "already",
    );
    const after = await api.snapshot(agent);
    expect(after.orders).toEqual(before.orders);
    expect(after.events.length).toBe(before.events.length + 2);
  });
  it("validates new requests, persists them, and provides no-evidence fallback without guessing", async () => {
    let saved = "";
    const storage = {
      getItem: () => saved || null,
      setItem: (_: string, v: string) => {
        saved = v;
      },
    };
    const api = createMockApi(storage);
    await expect(
      api.createTicket(customer, { ...input, subject: "Hi" }),
    ).rejects.toThrow("subject");
    const id = await api.createTicket(customer, input);
    const reloaded = createMockApi(storage);
    expect(
      (await reloaded.snapshot(customer)).tickets.some(
        (t) => t.ticket_id === id,
      ),
    ).toBe(true);
    await reloaded.process(agent, id);
    const proposal = (await reloaded.snapshot(agent)).proposals.find(
      (p) => p.ticket_id === id,
    )!;
    expect(proposal.citations).toEqual([]);
    expect(proposal.action).toContain("Manual review");
  });
  it("allows only a manager to decide once, records the reason, and never mutates an order", async () => {
    const api = createMockApi();
    const before = await api.snapshot(manager);
    const a = before.approvals[0];
    await expect(
      api.decide(agent, a.id, "approved", "Reviewed all evidence"),
    ).rejects.toThrow("Manager");
    await expect(api.decide(manager, a.id, "approved", "yes")).rejects.toThrow(
      "8 characters",
    );
    await api.decide(
      manager,
      a.id,
      "approved",
      "Evidence reviewed; follow up manually",
    );
    const after = await api.snapshot(manager);
    expect(after.orders).toEqual(before.orders);
    expect(after.approvals[0].decision).toBe("approved");
    expect(after.events.at(-1)?.outcome).toContain("simulation only");
    await expect(
      api.decide(manager, a.id, "rejected", "Changed my decision"),
    ).rejects.toThrow("already");
  });
  it("records rejection and escalation without exposing internal events to customers", async () => {
    const api = createMockApi();
    await api.review(agent, "T-HISTORY-0004", "reject", "Needs revision");
    expect(
      (await api.snapshot(agent)).tickets.find(
        (t) => t.ticket_id === "T-HISTORY-0004",
      )?.status,
    ).toBe("triaged");
    await api.review(agent, "T-HISTORY-0004", "escalate", "");
    expect(
      (await api.snapshot(agent)).tickets.find(
        (t) => t.ticket_id === "T-HISTORY-0004",
      )?.status,
    ).toBe("escalated");
    expect((await api.snapshot(customer)).events).toHaveLength(0);
  });
});
