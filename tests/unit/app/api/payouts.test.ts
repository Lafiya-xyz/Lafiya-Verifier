import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleListPayouts } from "@/app/api/payouts/handler";

const chwRow = {
  id: "chw_1",
  stellar_public_key: "GABC123",
  full_name: "Fatima Bello",
  license_number: "NG-CHW-0042",
  allowlisted: true,
};

const payoutRows = [
  {
    id: "payout_1",
    chw_id: "chw_1",
    attestation_record_id: "rec_123",
    amount_usdc: 2,
    status: "queued" as const,
    created_at: "2026-07-10T00:00:00.000Z",
  },
];

function chainResolving(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  // Lets `.order()` (no `.single()`/`.maybeSingle()`) be awaited directly,
  // since Supabase's real query builder is itself thenable.
  chain.then = (
    onFulfilled: (value: typeof result) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return chain;
}

function buildClient() {
  const tables: Record<string, ReturnType<typeof chainResolving>> = {
    community_health_workers: chainResolving({ data: chwRow, error: null }),
    payout_records: chainResolving({ data: payoutRows, error: null }),
  };
  const from = vi.fn((table: string) => tables[table]);

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "u1", user_metadata: { stellar_public_key: "GABC123" } } },
        error: null,
      }),
    },
    from,
  } as unknown as SupabaseClient;
}

function authedRequest(token: string | null): Request {
  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);
  return new Request("https://example.com/api/payouts", { headers });
}

describe("handleListPayouts", () => {
  it("returns 401 without a bearer token", async () => {
    const response = await handleListPayouts(authedRequest(null), buildClient());
    expect(response.status).toBe(401);
  });

  it("returns the authenticated CHW's payouts, ignoring any other id", async () => {
    const client = buildClient();
    const response = await handleListPayouts(authedRequest("valid-token"), client);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.payouts).toHaveLength(1);
    expect(body.payouts[0].chwId).toBe("chw_1");
  });
});
