import { describe, expect, it } from "vitest";
import { getPatientRecordById, upsertPatientRecord } from "@/lib/supabase/patientRecordRepository";
import { createMockSupabaseClient } from "../../../helpers/mockSupabaseClient";
import type { PatientRecordInput } from "@/lib/validation/patientRecord";

const input: PatientRecordInput = {
  name: "Amina Yusuf",
  age: 29,
  bloodGroup: "O+",
  genotype: "AS",
  allergies: ["penicillin"],
  medications: [],
  chronicConditions: [],
  emergencyContacts: [{ name: "Musa Yusuf", phone: "+2348012345678", relationship: "Spouse" }],
  language: "Hausa",
};

const row = {
  id: "rec_123",
  name: "Amina Yusuf",
  age: 29,
  photo_url: null,
  blood_group: "O+",
  genotype: "AS",
  allergies: ["penicillin"],
  medications: [],
  chronic_conditions: [],
  emergency_contacts: [{ name: "Musa Yusuf", phone: "+2348012345678", relationship: "Spouse" }],
  language: "Hausa",
};

describe("upsertPatientRecord", () => {
  it("maps snake_case DB rows to the PatientRecord domain shape", async () => {
    const { client } = createMockSupabaseClient({ data: row, error: null });
    const result = await upsertPatientRecord(client, input);
    expect(result).toEqual({
      id: "rec_123",
      name: "Amina Yusuf",
      age: 29,
      photoUrl: undefined,
      bloodGroup: "O+",
      genotype: "AS",
      allergies: ["penicillin"],
      medications: [],
      chronicConditions: [],
      emergencyContacts: [{ name: "Musa Yusuf", phone: "+2348012345678", relationship: "Spouse" }],
      language: "Hausa",
    });
  });

  it("throws a readable error when Supabase returns an error", async () => {
    const { client } = createMockSupabaseClient({
      data: null,
      error: { message: "connection refused" },
    });
    await expect(upsertPatientRecord(client, input)).rejects.toThrow(/connection refused/);
  });
});

describe("getPatientRecordById", () => {
  it("returns null when no record is found", async () => {
    const { client } = createMockSupabaseClient({ data: null, error: null });
    expect(await getPatientRecordById(client, "missing")).toBeNull();
  });

  it("maps a found row to a PatientRecord", async () => {
    const { client } = createMockSupabaseClient({ data: row, error: null });
    const result = await getPatientRecordById(client, "rec_123");
    expect(result?.id).toBe("rec_123");
    expect(result?.bloodGroup).toBe("O+");
  });
});
