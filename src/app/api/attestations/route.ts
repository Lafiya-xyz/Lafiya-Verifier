import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getVerifierServiceKeypair } from "@/lib/stellar/keypair";
import { handleSubmitAttestation } from "./handler";

export const runtime = "nodejs";
// Reads the caller's Supabase session; must never be statically prerendered.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleSubmitAttestation(request, getSupabaseAdminClient(), {
    signer: getVerifierServiceKeypair(),
  });
}
