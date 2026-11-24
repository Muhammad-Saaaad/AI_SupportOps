import { afterEach, expect, it, vi } from "vitest";
import { createHttpApi } from "../src/api/http";
const s = {
  role: "customer" as const,
  customer_id: "C0009",
  actor_id: "C0009",
};
afterEach(() => vi.unstubAllGlobals());
it("denies unauthenticated API requests without falling back to demo data", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("{}", { status: 403 })),
  );
  await expect(
    createHttpApi("https://example.test").snapshot(s),
  ).rejects.toThrow("Access denied");
});
it("reports network failures and does not pass demo role as authorization", async () => {
  const fetch = vi.fn().mockRejectedValue(new Error("offline"));
  vi.stubGlobal("fetch", fetch);
  await expect(
    createHttpApi("https://example.test").process(s, "id/with spaces"),
  ).rejects.toThrow("could not be reached");
  expect(fetch).toHaveBeenCalledWith(
    "https://example.test/tickets/id%2Fwith%20spaces/process",
    expect.objectContaining({ credentials: "include", body: "{}" }),
  );
  expect(JSON.stringify(fetch.mock.calls)).not.toContain("C0009");
});
