import { describe, expect, it } from "vitest";
import { saveAttestation } from "@/lib/supabase/attestationRepository";
import { createMockSupabaseClient } from "../../../helpers/mockSupabaseClient";
import type { Attestation } from "@/types";

const attestation: Attestation = {
  recordId: "rec_123",
  recordHash: "0xdeadbeef",
  attesterPublicKey: "GABC123",
  timestamp: Date.parse("2026-07-10T00:00:00.000Z"),
  transactionHash: "tx-hash-1",
};

const row = {
  record_id: "rec_123",
  record_hash: "0xdeadbeef",
  attester_public_key: "GABC123",
  timestamp: "2026-07-10T00:00:00.000Z",
  transaction_hash: "tx-hash-1",
  status: "confirmed" as const,
};

describe("saveAttestation", () => {
  it("maps the upserted row back to the Attestation domain shape", async () => {
    const { client, from } = createMockSupabaseClient({ data: row, error: null });
    const result = await saveAttestation(client, attestation, "confirmed");

    expect(from).toHaveBeenCalledWith("attestations");
    expect(result).toEqual(attestation);
  });

  it("throws a readable error when Supabase returns an error", async () => {
    const { client } = createMockSupabaseClient({
      data: null,
      error: { message: "upsert failed" },
    });

    await expect(saveAttestation(client, attestation, "failed")).rejects.toThrow(/upsert failed/);
  });
});
