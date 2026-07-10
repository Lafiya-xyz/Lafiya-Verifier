import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getVerifierServiceKeypair } from "@/lib/stellar/keypair";
import { handleSubmitAttestation } from "./handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleSubmitAttestation(request, getSupabaseAdminClient(), {
    signer: getVerifierServiceKeypair(),
  });
}
