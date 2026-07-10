import { createHash } from "node:crypto";
import type { PatientRecord } from "@/types";
import { canonicalJsonStringify } from "./canonicalJson";

/**
 * Hashes a patient record for on-chain attestation. Only this hash — never
 * the record itself — reaches the Soroban attestation registry. See
 * README § Core Design Principle.
 */
export function hashPatientRecord(record: PatientRecord): string {
  const canonical = canonicalJsonStringify(record);
  return `0x${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
}
