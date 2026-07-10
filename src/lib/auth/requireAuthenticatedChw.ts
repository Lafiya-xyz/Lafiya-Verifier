import type { SupabaseClient } from "@supabase/supabase-js";
import { getChwByStellarPublicKey } from "@/lib/supabase/chwRepository";
import type { CommunityHealthWorker } from "@/types";

export class UnauthorizedError extends Error {}
export class NotAllowlistedError extends Error {}

/**
 * Resolves the CHW behind a Supabase-authenticated access token and
 * confirms they're on the attester allowlist. This is the single choke
 * point every registration/attestation API route must call before doing
 * anything else — see README § Attester allowlist enforcement.
 */
export async function requireAuthenticatedChw(
  client: SupabaseClient,
  accessToken: string,
): Promise<CommunityHealthWorker> {
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new UnauthorizedError("Invalid or expired session");
  }

  const stellarPublicKey = data.user.user_metadata?.stellar_public_key;
  if (typeof stellarPublicKey !== "string" || stellarPublicKey.length === 0) {
    throw new UnauthorizedError("Authenticated user has no linked Stellar public key");
  }

  const chw = await getChwByStellarPublicKey(client, stellarPublicKey);
  if (!chw || !chw.allowlisted) {
    throw new NotAllowlistedError("This health worker is not on the attester allowlist");
  }

  return chw;
}
