import { Keypair } from "@stellar/stellar-sdk";
import { getEnv } from "@/config/env";

/**
 * The verifier service's own Stellar keypair — the account that signs and
 * submits `submit_attestation` on the CHW's behalf. Distinct from the CHW's
 * identity, which is passed in as a contract argument, not the tx signer.
 */
export function getVerifierServiceKeypair(): Keypair {
  const env = getEnv();
  if (!env.VERIFIER_SERVICE_SECRET_KEY) {
    throw new Error("VERIFIER_SERVICE_SECRET_KEY is required to sign attestation transactions");
  }
  return Keypair.fromSecret(env.VERIFIER_SERVICE_SECRET_KEY);
}
