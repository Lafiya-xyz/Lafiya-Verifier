import { describe, expect, it } from "vitest";
import { getChwByStellarPublicKey, isChwAllowlisted } from "@/lib/supabase/chwRepository";
import { createMockSupabaseClient } from "../../../helpers/mockSupabaseClient";

const allowlistedRow = {
  id: "chw_1",
  stellar_public_key: "GABC123",
  full_name: "Fatima Bello",
  license_number: "NG-CHW-0042",
  allowlisted: true,
};

describe("getChwByStellarPublicKey", () => {
  it("maps a found row to the CommunityHealthWorker domain shape", async () => {
    const { client } = createMockSupabaseClient({ data: allowlistedRow, error: null });
    const chw = await getChwByStellarPublicKey(client, "GABC123");
    expect(chw).toEqual({
      id: "chw_1",
      stellarPublicKey: "GABC123",
      fullName: "Fatima Bello",
      licenseNumber: "NG-CHW-0042",
      allowlisted: true,
    });
  });

  it("returns null when the CHW does not exist", async () => {
    const { client } = createMockSupabaseClient({ data: null, error: null });
    expect(await getChwByStellarPublicKey(client, "GUNKNOWN")).toBeNull();
  });
});

describe("isChwAllowlisted", () => {
  it("returns true for an allowlisted CHW", async () => {
    const { client } = createMockSupabaseClient({ data: allowlistedRow, error: null });
    expect(await isChwAllowlisted(client, "GABC123")).toBe(true);
  });

  it("returns false when the CHW is not allowlisted", async () => {
    const { client } = createMockSupabaseClient({
      data: { ...allowlistedRow, allowlisted: false },
      error: null,
    });
    expect(await isChwAllowlisted(client, "GABC123")).toBe(false);
  });

  it("returns false when the CHW does not exist", async () => {
    const { client } = createMockSupabaseClient({ data: null, error: null });
    expect(await isChwAllowlisted(client, "GUNKNOWN")).toBe(false);
  });
});
