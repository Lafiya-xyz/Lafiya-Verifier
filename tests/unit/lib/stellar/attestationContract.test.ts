import { describe, expect, it, vi } from "vitest";
import { Account, Keypair, rpc } from "@stellar/stellar-sdk";
import { submitAttestation } from "@/lib/stellar/attestationContract";

describe("submitAttestation", () => {
  it("signs and submits a transaction, then returns the confirmed attestation", async () => {
    const signer = Keypair.random();
    const sourceAccount = new Account(signer.publicKey(), "1");

    const getAccount = vi.fn().mockResolvedValue(sourceAccount);
    const prepareTransaction = vi.fn().mockImplementation(async (tx) => tx);
    const sendTransaction = vi
      .fn()
      .mockResolvedValue({ status: "PENDING", hash: "tx-hash-123" });
    const getTransaction = vi
      .fn()
      .mockResolvedValue({ status: rpc.Api.GetTransactionStatus.SUCCESS });

    const fakeServer = {
      getAccount,
      prepareTransaction,
      sendTransaction,
      getTransaction,
    } as unknown as rpc.Server;

    const attestation = await submitAttestation(
      { recordId: "rec_123", recordHash: "0xdeadbeef", attesterPublicKey: signer.publicKey() },
      signer,
      {
        server: fakeServer,
        contractId: "CADQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQP5KR",
        networkPassphrase: "Test SDF Network ; September 2015",
      },
    );

    expect(getAccount).toHaveBeenCalledWith(signer.publicKey());
    expect(prepareTransaction).toHaveBeenCalledTimes(1);
    expect(sendTransaction).toHaveBeenCalledTimes(1);
    expect(attestation).toMatchObject({
      recordId: "rec_123",
      recordHash: "0xdeadbeef",
      attesterPublicKey: signer.publicKey(),
      transactionHash: "tx-hash-123",
    });
    expect(typeof attestation.timestamp).toBe("number");
  });

  it("throws when Soroban rejects the submission", async () => {
    const signer = Keypair.random();
    const sourceAccount = new Account(signer.publicKey(), "1");

    const fakeServer = {
      getAccount: vi.fn().mockResolvedValue(sourceAccount),
      prepareTransaction: vi.fn().mockImplementation(async (tx) => tx),
      sendTransaction: vi.fn().mockResolvedValue({ status: "ERROR" }),
      getTransaction: vi.fn(),
    } as unknown as rpc.Server;

    await expect(
      submitAttestation(
        { recordId: "rec_123", recordHash: "0xdeadbeef", attesterPublicKey: signer.publicKey() },
        signer,
        {
          server: fakeServer,
          contractId: "CADQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQP5KR",
          networkPassphrase: "Test SDF Network ; September 2015",
        },
      ),
    ).rejects.toThrow(/rejected the attestation transaction/);
  });
});
