import { rpc } from "@stellar/stellar-sdk";
import { getEnv } from "@/config/env";

let sorobanServer: rpc.Server | undefined;

/** The Soroban RPC server for the network configured via env (testnet by default). */
export function getSorobanServer(): rpc.Server {
  if (sorobanServer) return sorobanServer;

  const env = getEnv();
  sorobanServer = new rpc.Server(env.SOROBAN_RPC_URL);
  return sorobanServer;
}

export function getNetworkPassphrase(): string {
  return getEnv().STELLAR_NETWORK_PASSPHRASE;
}
