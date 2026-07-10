import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  NotAllowlistedError,
  UnauthorizedError,
  requireAuthenticatedChw,
} from "@/lib/auth/requireAuthenticatedChw";
import { createMockSupabaseClient } from "../../../helpers/mockSupabaseClient";

const chwRow = {
  id: "chw_1",
  stellar_public_key: "GABC123",
  full_name: "Fatima Bello",
  license_number: "NG-CHW-0042",
  allowlisted: true,
};

function clientWithUser(user: unknown, chwResult: { data: unknown; error: unknown }) {
  const { client: base } = createMockSupabaseClient(
    chwResult as { data: unknown; error: { message: string } | null },
  );
  return {
    ...base,
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
  } as unknown as SupabaseClient;
}

describe("requireAuthenticatedChw", () => {
  it("returns the CHW when the session is valid and they're allowlisted", async () => {
    const client = clientWithUser(
      { id: "u1", user_metadata: { stellar_public_key: "GABC123" } },
      { data: chwRow, error: null },
    );

    const chw = await requireAuthenticatedChw(client, "valid-token");
    expect(chw).toEqual({
      id: "chw_1",
      stellarPublicKey: "GABC123",
      fullName: "Fatima Bello",
      licenseNumber: "NG-CHW-0042",
      allowlisted: true,
    });
  });

  it("throws UnauthorizedError when the token is invalid", async () => {
    const client = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: { message: "bad token" } }),
      },
    } as unknown as SupabaseClient;

    await expect(requireAuthenticatedChw(client, "bad-token")).rejects.toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when the user has no linked Stellar key", async () => {
    const client = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "u1", user_metadata: {} } }, error: null }),
      },
    } as unknown as SupabaseClient;

    await expect(requireAuthenticatedChw(client, "token")).rejects.toThrow(UnauthorizedError);
  });

  it("throws NotAllowlistedError when the CHW is not allowlisted", async () => {
    const client = clientWithUser(
      { id: "u1", user_metadata: { stellar_public_key: "GABC123" } },
      { data: { ...chwRow, allowlisted: false }, error: null },
    );

    await expect(requireAuthenticatedChw(client, "token")).rejects.toThrow(NotAllowlistedError);
  });

  it("throws NotAllowlistedError when no CHW record exists for the key", async () => {
    const client = clientWithUser(
      { id: "u1", user_metadata: { stellar_public_key: "GUNKNOWN" } },
      { data: null, error: null },
    );

    await expect(requireAuthenticatedChw(client, "token")).rejects.toThrow(NotAllowlistedError);
  });
});
