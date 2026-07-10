import { BASE_FEE, Contract, type Keypair, TransactionBuilder, nativeToScVal } from "@stellar/stellar-sdk";
import { getEnv } from "@/config/env";
import type { Attestation } from "@/types";
import { getNetworkPassphrase, getSorobanServer } from "./network";
import { pollTransactionUntilComplete } from "./pollTransaction";

const SUBMIT_ATTESTATION_METHOD = "submit_attestation";

export interface SubmitAttestationParams {
  recordId: string;
  recordHash: string;
  attesterPublicKey: string;
}

/**
 * Builds, signs, and submits the `submit_attestation` invocation against the
 * Soroban attestation registry, then waits for it to confirm. The contract
 * enforces the attester allowlist on-chain; callers should still run
 * `isChwAllowlisted` first to fail fast with a clear error before spending
 * a transaction fee on a submission the contract will reject anyway.
 */
export async function submitAttestation(
  params: SubmitAttestationParams,
  signer: Keypair,
): Promise<Attestation> {
  const env = getEnv();
  const server = getSorobanServer();
  const contract = new Contract(env.ATTESTATION_CONTRACT_ID);

  const sourceAccount = await server.getAccount(signer.publicKey());

  const operation = contract.call(
    SUBMIT_ATTESTATION_METHOD,
    nativeToScVal(params.recordId, { type: "string" }),
    nativeToScVal(params.recordHash, { type: "string" }),
    nativeToScVal(params.attesterPublicKey, { type: "address" }),
  );

  const builtTransaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const preparedTransaction = await server.prepareTransaction(builtTransaction);
  preparedTransaction.sign(signer);

  const sendResult = await server.sendTransaction(preparedTransaction);
  if (sendResult.status === "ERROR") {
    throw new Error(
      `Soroban rejected the attestation transaction for record ${params.recordId}`,
    );
  }

  await pollTransactionUntilComplete(server, sendResult.hash);

  return {
    recordId: params.recordId,
    recordHash: params.recordHash,
    attesterPublicKey: params.attesterPublicKey,
    timestamp: Date.now(),
    transactionHash: sendResult.hash,
  };
}
