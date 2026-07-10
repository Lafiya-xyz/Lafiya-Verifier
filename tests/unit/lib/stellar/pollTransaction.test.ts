import { describe, expect, it, vi } from "vitest";
import { rpc } from "@stellar/stellar-sdk";
import { pollTransactionUntilComplete } from "@/lib/stellar/pollTransaction";

describe("pollTransactionUntilComplete", () => {
  it("returns the response once status is SUCCESS", async () => {
    const getTransaction = vi
      .fn()
      .mockResolvedValueOnce({ status: rpc.Api.GetTransactionStatus.NOT_FOUND })
      .mockResolvedValueOnce({ status: rpc.Api.GetTransactionStatus.NOT_FOUND })
      .mockResolvedValueOnce({ status: rpc.Api.GetTransactionStatus.SUCCESS, latestLedger: 5 });

    const result = await pollTransactionUntilComplete({ getTransaction }, "deadbeef", {
      intervalMs: 1,
    });

    expect(result.status).toBe(rpc.Api.GetTransactionStatus.SUCCESS);
    expect(getTransaction).toHaveBeenCalledTimes(3);
  });

  it("throws when the transaction fails on-chain", async () => {
    const getTransaction = vi
      .fn()
      .mockResolvedValueOnce({ status: rpc.Api.GetTransactionStatus.FAILED });

    await expect(
      pollTransactionUntilComplete({ getTransaction }, "deadbeef", { intervalMs: 1 }),
    ).rejects.toThrow(/failed on-chain/);
  });

  it("throws when the deadline elapses while still NOT_FOUND", async () => {
    const getTransaction = vi
      .fn()
      .mockResolvedValue({ status: rpc.Api.GetTransactionStatus.NOT_FOUND });

    await expect(
      pollTransactionUntilComplete({ getTransaction }, "deadbeef", { intervalMs: 1, timeoutMs: 5 }),
    ).rejects.toThrow(/Timed out/);
  });
});
