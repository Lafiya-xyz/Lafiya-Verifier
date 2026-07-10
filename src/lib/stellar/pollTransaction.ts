import { rpc } from "@stellar/stellar-sdk";

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

/**
 * Polls Soroban RPC for a submitted transaction's final status.
 * `sendTransaction` only confirms the network accepted the transaction for
 * inclusion — whether it actually succeeded is only known once `getTransaction`
 * reports a terminal status, which happens asynchronously.
 */
export async function pollTransactionUntilComplete(
  server: Pick<rpc.Server, "getTransaction">,
  hash: string,
  { intervalMs = 1000, timeoutMs = 30000 }: PollOptions = {},
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result = await server.getTransaction(hash);

    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return result as rpc.Api.GetSuccessfulTransactionResponse;
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Attestation transaction ${hash} failed on-chain`);
    }

    await sleep(intervalMs);
  }

  throw new Error(`Timed out waiting for attestation transaction ${hash} to confirm`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
