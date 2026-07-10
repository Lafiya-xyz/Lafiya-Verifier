import { describe, expect, it } from "vitest";
import { hashPatientRecord } from "@/lib/crypto/hash";
import type { PatientRecord } from "@/types";

const baseRecord: PatientRecord = {
  id: "rec_123",
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

describe("hashPatientRecord", () => {
  it("returns a 0x-prefixed 64-hex-char sha256 digest", () => {
    const hash = hashPatientRecord(baseRecord);
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("is deterministic for the same record", () => {
    expect(hashPatientRecord(baseRecord)).toBe(hashPatientRecord({ ...baseRecord }));
  });

  it("is insensitive to key ordering", () => {
    const reordered: PatientRecord = {
      language: baseRecord.language,
      id: baseRecord.id,
      emergencyContacts: baseRecord.emergencyContacts,
      chronicConditions: baseRecord.chronicConditions,
      medications: baseRecord.medications,
      allergies: baseRecord.allergies,
      genotype: baseRecord.genotype,
      bloodGroup: baseRecord.bloodGroup,
      age: baseRecord.age,
      name: baseRecord.name,
    };
    expect(hashPatientRecord(baseRecord)).toBe(hashPatientRecord(reordered));
  });

  it("changes when any field changes", () => {
    const mutated: PatientRecord = { ...baseRecord, genotype: "SS" };
    expect(hashPatientRecord(baseRecord)).not.toBe(hashPatientRecord(mutated));
  });
});
