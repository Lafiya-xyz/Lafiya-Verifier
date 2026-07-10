import type { SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/config/env";
import { queuePayoutRecord } from "@/lib/supabase/payoutRepository";
import type { Attestation, PayoutRecord } from "@/types";

/**
 * Queues the CHW's USDC incentive payout once their attestation has
 * confirmed on-chain. The amount is a flat rate set via
 * CHW_PAYOUT_AMOUNT_USDC — see README § USDC micropayments.
 */
export async function queueAttestationPayout(
  client: SupabaseClient,
  chwId: string,
  attestation: Attestation,
): Promise<PayoutRecord> {
  const { CHW_PAYOUT_AMOUNT_USDC } = getEnv();

  return queuePayoutRecord(client, {
    chwId,
    attestationRecordId: attestation.recordId,
    amountUsdc: CHW_PAYOUT_AMOUNT_USDC,
  });
}
