import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Account, Keypair, rpc } from "@stellar/stellar-sdk";
import { handleSubmitAttestation } from "@/app/api/attestations/handler";

const requiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SOROBAN_RPC_URL: "https://soroban-testnet.stellar.org",
  STELLAR_NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
  ATTESTATION_CONTRACT_ID: "CADQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQP5KR",
};

const chwRow = {
  id: "chw_1",
  stellar_public_key: "GD6W4JI4OSSRPA2EVAVBMOBB5BJAP5U2OOI7OGKYKOB7MIVPRKLE5Z3A",
  full_name: "Fatima Bello",
  license_number: "NG-CHW-0042",
  allowlisted: true,
};

const recordRow = {
  id: "rec_123",
  name: "Amina Yusuf",
  age: 29,
  photo_url: null,
  blood_group: "O+",
  genotype: "AS",
  allergies: [],
  medications: [],
  chronic_conditions: [],
  emergency_contacts: [{ name: "Musa Yusuf", phone: "+2348012345678", relationship: "Spouse" }],
  language: "Hausa",
};

const attestationRow = {
  record_id: "rec_123",
  record_hash: "0xhash",
  attester_public_key: "GD6W4JI4OSSRPA2EVAVBMOBB5BJAP5U2OOI7OGKYKOB7MIVPRKLE5Z3A",
  timestamp: "2026-07-10T00:00:00.000Z",
  transaction_hash: "tx-hash-1",
  status: "confirmed" as const,
};

const payoutRow = {
  id: "payout_1",
  chw_id: "chw_1",
  attestation_record_id: "rec_123",
  amount_usdc: 2,
  status: "queued" as const,
  created_at: "2026-07-10T00:00:00.000Z",
};

function chainResolving(result: { data: unknown; error: unknown }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.upsert = vi.fn(() => chain);
  chain.insert = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  chain.single = vi.fn(() => Promise.resolve(result));
  return chain;
}

function buildClient(recordExists = true) {
  const tables: Record<string, ReturnType<typeof chainResolving>> = {
    community_health_workers: chainResolving({ data: chwRow, error: null }),
    patient_records: chainResolving({ data: recordExists ? recordRow : null, error: null }),
    attestations: chainResolving({ data: attestationRow, error: null }),
    payout_records: chainResolving({ data: payoutRow, error: null }),
  };
  const from = vi.fn((table: string) => tables[table]);

  return {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "u1", user_metadata: { stellar_public_key: "GD6W4JI4OSSRPA2EVAVBMOBB5BJAP5U2OOI7OGKYKOB7MIVPRKLE5Z3A" } } }, error: null }),
    },
    from,
  } as unknown as SupabaseClient;
}

function jsonRequest(body: unknown): Request {
  return new Request("https://example.com/api/attestations", {
    method: "POST",
    headers: { authorization: "Bearer valid-token", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function buildFakeStellarDeps() {
  const signer = Keypair.random();
  const sourceAccount = new Account(signer.publicKey(), "1");
  const server = {
    getAccount: vi.fn().mockResolvedValue(sourceAccount),
    prepareTransaction: vi.fn().mockImplementation(async (tx) => tx),
    sendTransaction: vi.fn().mockResolvedValue({ status: "PENDING", hash: "tx-hash-1" }),
    getTransaction: vi.fn().mockResolvedValue({ status: rpc.Api.GetTransactionStatus.SUCCESS }),
  } as unknown as rpc.Server;

  return {
    signer,
    stellar: {
      server,
      contractId: "CADQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQP5KR",
      networkPassphrase: "Test SDF Network ; September 2015",
    },
  };
}

describe("handleSubmitAttestation", () => {
  beforeEach(() => {
    for (const [key, value] of Object.entries(requiredEnv)) {
      process.env[key] = value;
    }
  });

  afterEach(() => {
    for (const key of Object.keys(requiredEnv)) {
      delete process.env[key];
    }
  });

  it("returns 400 when recordId is missing", async () => {
    const response = await handleSubmitAttestation(
      jsonRequest({}),
      buildClient(),
      buildFakeStellarDeps(),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when the patient record does not exist", async () => {
    const response = await handleSubmitAttestation(
      jsonRequest({ recordId: "rec_missing" }),
      buildClient(false),
      buildFakeStellarDeps(),
    );
    expect(response.status).toBe(404);
  });

  it("submits the attestation, saves it, and queues the payout on success", async () => {
    const deps = buildFakeStellarDeps();
    const response = await handleSubmitAttestation(
      jsonRequest({ recordId: "rec_123" }),
      buildClient(),
      deps,
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.attestation.recordId).toBe("rec_123");
    expect(body.payout.status).toBe("queued");
    expect(deps.stellar.server.sendTransaction).toHaveBeenCalledTimes(1);
  });
});
