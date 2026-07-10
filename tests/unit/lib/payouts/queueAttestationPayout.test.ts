import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { queueAttestationPayout } from "@/lib/payouts/queueAttestationPayout";
import { createMockSupabaseClient } from "../../../helpers/mockSupabaseClient";
import type { Attestation } from "@/types";

const attestation: Attestation = {
  recordId: "rec_123",
  recordHash: "0xdeadbeef",
  attesterPublicKey: "GABC123",
  timestamp: Date.now(),
  transactionHash: "tx-hash-1",
};

const row = {
  id: "payout_1",
  chw_id: "chw_1",
  attestation_record_id: "rec_123",
  amount_usdc: 3.5,
  status: "queued" as const,
  created_at: "2026-07-10T00:00:00.000Z",
};

const requiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SOROBAN_RPC_URL: "https://soroban-testnet.stellar.org",
  STELLAR_NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
  ATTESTATION_CONTRACT_ID: "CADQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQP5KR",
};

describe("queueAttestationPayout", () => {
  beforeEach(() => {
    for (const [key, value] of Object.entries(requiredEnv)) {
      process.env[key] = value;
    }
    process.env.CHW_PAYOUT_AMOUNT_USDC = "3.5";
  });

  afterEach(() => {
    for (const key of Object.keys(requiredEnv)) {
      delete process.env[key];
    }
    delete process.env.CHW_PAYOUT_AMOUNT_USDC;
  });

  it("queues a payout using the configured CHW_PAYOUT_AMOUNT_USDC", async () => {
    const { client, from } = createMockSupabaseClient({ data: row, error: null });

    const result = await queueAttestationPayout(client, "chw_1", attestation);

    expect(from).toHaveBeenCalledWith("payout_records");
    expect(result).toMatchObject({
      chwId: "chw_1",
      attestationRecordId: "rec_123",
      amountUsdc: 3.5,
      status: "queued",
    });
  });
});
