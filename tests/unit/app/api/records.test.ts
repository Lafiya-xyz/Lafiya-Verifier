import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleCreateOrUpdateRecord } from "@/app/api/records/handler";

const chwRow = {
  id: "chw_1",
  stellar_public_key: "GABC123",
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

const validInput = {
  name: "Amina Yusuf",
  age: 29,
  bloodGroup: "O+",
  genotype: "AS",
  emergencyContacts: [{ name: "Musa Yusuf", phone: "+2348012345678", relationship: "Spouse" }],
  language: "Hausa",
};

function chainResolving(result: { data: unknown; error: unknown }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.upsert = vi.fn(() => chain);
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  chain.single = vi.fn(() => Promise.resolve(result));
  return chain;
}

function buildClient(userMetadata: Record<string, unknown> | null) {
  const chwChain = chainResolving({ data: chwRow, error: null });
  const recordChain = chainResolving({ data: recordRow, error: null });
  const from = vi.fn((table: string) =>
    table === "community_health_workers" ? chwChain : recordChain,
  );

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userMetadata ? { id: "u1", user_metadata: userMetadata } : null },
        error: userMetadata ? null : { message: "invalid" },
      }),
    },
    from,
  } as unknown as SupabaseClient;
}

function jsonRequest(body: unknown, token = "valid-token"): Request {
  return new Request("https://example.com/api/records", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("handleCreateOrUpdateRecord", () => {
  it("returns 401 when no bearer token is present", async () => {
    const request = new Request("https://example.com/api/records", { method: "POST" });
    const response = await handleCreateOrUpdateRecord(
      request,
      buildClient({ stellar_public_key: "GABC123" }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 401 when the session is invalid", async () => {
    const response = await handleCreateOrUpdateRecord(jsonRequest(validInput), buildClient(null));
    expect(response.status).toBe(401);
  });

  it("returns 400 when the body fails validation", async () => {
    const response = await handleCreateOrUpdateRecord(
      jsonRequest({ name: "" }),
      buildClient({ stellar_public_key: "GABC123" }),
    );
    expect(response.status).toBe(400);
  });

  it("creates the record and returns 201 for a valid request", async () => {
    const response = await handleCreateOrUpdateRecord(
      jsonRequest(validInput),
      buildClient({ stellar_public_key: "GABC123" }),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.record.id).toBe("rec_123");
  });
});
