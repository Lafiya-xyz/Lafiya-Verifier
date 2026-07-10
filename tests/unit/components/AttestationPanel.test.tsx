// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AttestationPanel } from "@/components/AttestationPanel";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AttestationPanel", () => {
  it("submits the attestation and shows the confirmed transaction hash", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ attestation: { transactionHash: "tx-hash-1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AttestationPanel recordId="rec_123" accessToken="token-abc" />);
    fireEvent.click(screen.getByRole("button", { name: /attest on-chain/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("tx-hash-1");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/attestations",
      expect.objectContaining({ method: "POST" }),
    );
    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(requestInit.body as string)).toEqual({ recordId: "rec_123" });
  });

  it("shows an error message when the API rejects the attestation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "This health worker is not on the attester allowlist" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AttestationPanel recordId="rec_123" accessToken="token-abc" />);
    fireEvent.click(screen.getByRole("button", { name: /attest on-chain/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/not on the attester allowlist/i);
  });
});
