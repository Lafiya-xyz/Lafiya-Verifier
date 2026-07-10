import { describe, expect, it } from "vitest";
import { listPayoutsForChw, queuePayoutRecord } from "@/lib/supabase/payoutRepository";
import { createMockSupabaseClient } from "../../../helpers/mockSupabaseClient";

const row = {
  id: "payout_1",
  chw_id: "chw_1",
  attestation_record_id: "rec_123",
  amount_usdc: 2,
  status: "queued" as const,
  created_at: "2026-07-10T00:00:00.000Z",
};

describe("queuePayoutRecord", () => {
  it("maps the inserted row to the PayoutRecord domain shape", async () => {
    const { client } = createMockSupabaseClient({ data: row, error: null });
    const result = await queuePayoutRecord(client, {
      chwId: "chw_1",
      attestationRecordId: "rec_123",
      amountUsdc: 2,
    });

    expect(result).toEqual({
      id: "payout_1",
      chwId: "chw_1",
      attestationRecordId: "rec_123",
      amountUsdc: 2,
      status: "queued",
      createdAt: Date.parse("2026-07-10T00:00:00.000Z"),
    });
  });

  it("throws a readable error when Supabase returns an error", async () => {
    const { client } = createMockSupabaseClient({
      data: null,
      error: { message: "insert failed" },
    });

    await expect(
      queuePayoutRecord(client, {
        chwId: "chw_1",
        attestationRecordId: "rec_123",
        amountUsdc: 2,
      }),
    ).rejects.toThrow(/insert failed/);
  });
});

describe("listPayoutsForChw", () => {
  it("maps each row to a PayoutRecord, most recent first", async () => {
    const secondRow = { ...row, id: "payout_2", created_at: "2026-07-09T00:00:00.000Z" };
    const { client, from } = createMockSupabaseClient({ data: [row, secondRow], error: null });

    const result = await listPayoutsForChw(client, "chw_1");

    expect(from).toHaveBeenCalledWith("payout_records");
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("payout_1");
    expect(result[1]?.id).toBe("payout_2");
  });

  it("throws a readable error when Supabase returns an error", async () => {
    const { client } = createMockSupabaseClient({
      data: null,
      error: { message: "query failed" },
    });

    await expect(listPayoutsForChw(client, "chw_1")).rejects.toThrow(/query failed/);
  });
});
