import type { SupabaseClient } from "@supabase/supabase-js";
import type { PayoutRecord } from "@/types";

const TABLE = "payout_records";

interface PayoutRow {
  id: string;
  chw_id: string;
  attestation_record_id: string;
  amount_usdc: number;
  status: PayoutRecord["status"];
  created_at: string;
}

function rowToPayoutRecord(row: PayoutRow): PayoutRecord {
  return {
    id: row.id,
    chwId: row.chw_id,
    attestationRecordId: row.attestation_record_id,
    amountUsdc: row.amount_usdc,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export interface QueuePayoutParams {
  chwId: string;
  attestationRecordId: string;
  amountUsdc: number;
}

/** Inserts a queued USDC payout owed to a CHW for a confirmed attestation. */
export async function queuePayoutRecord(
  client: SupabaseClient,
  params: QueuePayoutParams,
): Promise<PayoutRecord> {
  const { data, error } = await client
    .from(TABLE)
    .insert({
      chw_id: params.chwId,
      attestation_record_id: params.attestationRecordId,
      amount_usdc: params.amountUsdc,
      status: "queued",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to queue payout: ${error.message}`);
  }

  return rowToPayoutRecord(data as PayoutRow);
}
