import type { SupabaseClient } from "@supabase/supabase-js";
import type { Attestation, AttestationStatus } from "@/types";

const TABLE = "attestations";

interface AttestationRow {
  record_id: string;
  record_hash: string;
  attester_public_key: string;
  timestamp: string;
  transaction_hash: string | null;
  status: AttestationStatus;
}

function rowToAttestation(row: AttestationRow): Attestation {
  return {
    recordId: row.record_id,
    recordHash: row.record_hash,
    attesterPublicKey: row.attester_public_key,
    timestamp: new Date(row.timestamp).getTime(),
    transactionHash: row.transaction_hash ?? undefined,
  };
}

/**
 * Upserts the attestation attempt for a record, keyed by recordId, so a
 * retry overwrites the prior attempt rather than creating a duplicate.
 */
export async function saveAttestation(
  client: SupabaseClient,
  attestation: Attestation,
  status: AttestationStatus,
): Promise<Attestation> {
  const { data, error } = await client
    .from(TABLE)
    .upsert(
      {
        record_id: attestation.recordId,
        record_hash: attestation.recordHash,
        attester_public_key: attestation.attesterPublicKey,
        timestamp: new Date(attestation.timestamp).toISOString(),
        transaction_hash: attestation.transactionHash ?? null,
        status,
      },
      { onConflict: "record_id" },
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to save attestation for record ${attestation.recordId}: ${error.message}`,
    );
  }

  return rowToAttestation(data as AttestationRow);
}
