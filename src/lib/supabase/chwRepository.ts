import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommunityHealthWorker } from "@/types";

const TABLE = "community_health_workers";

interface ChwRow {
  id: string;
  stellar_public_key: string;
  full_name: string;
  license_number: string;
  allowlisted: boolean;
}

function rowToChw(row: ChwRow): CommunityHealthWorker {
  return {
    id: row.id,
    stellarPublicKey: row.stellar_public_key,
    fullName: row.full_name,
    licenseNumber: row.license_number,
    allowlisted: row.allowlisted,
  };
}

/** Looks up a CHW by the Stellar public key they sign attestations with. */
export async function getChwByStellarPublicKey(
  client: SupabaseClient,
  stellarPublicKey: string,
): Promise<CommunityHealthWorker | null> {
  const { data, error } = await client
    .from(TABLE)
    .select()
    .eq("stellar_public_key", stellarPublicKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to look up CHW ${stellarPublicKey}: ${error.message}`);
  }

  return data ? rowToChw(data as ChwRow) : null;
}

/**
 * True only if a CHW exists for this public key *and* is currently
 * allowlisted. Every attestation submission must pass this check first —
 * see README § Attester allowlist enforcement.
 */
export async function isChwAllowlisted(
  client: SupabaseClient,
  stellarPublicKey: string,
): Promise<boolean> {
  const chw = await getChwByStellarPublicKey(client, stellarPublicKey);
  return chw?.allowlisted ?? false;
}
