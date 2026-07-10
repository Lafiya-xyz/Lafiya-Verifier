"use client";

import { useState } from "react";
import { Button } from "./ui/Button";

interface AttestationPanelProps {
  recordId: string;
  accessToken: string;
}

type AttestationState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "confirmed"; transactionHash?: string }
  | { status: "error"; message: string };

/**
 * Lets a CHW submit the on-chain attestation for a record they just saved.
 * Kept separate from the record form so a saved-but-not-yet-attested
 * record is a distinct, resumable state — see README § Attests.
 */
export function AttestationPanel({ recordId, accessToken }: AttestationPanelProps) {
  const [state, setState] = useState<AttestationState>({ status: "idle" });

  async function handleAttest() {
    setState({ status: "submitting" });
    try {
      const response = await fetch("/api/attestations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ recordId }),
      });

      const body = await response.json();
      if (!response.ok) {
        setState({
          status: "error",
          message: typeof body.error === "string" ? body.error : "Attestation failed",
        });
        return;
      }

      setState({ status: "confirmed", transactionHash: body.attestation?.transactionHash });
    } catch {
      setState({ status: "error", message: "Network error — check your connection and try again" });
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-slate-200 p-4 dark:border-slate-700">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Record <span className="font-mono">{recordId}</span> is saved. Submit an attestation to
        put a hash of it on-chain and queue your USDC payout.
      </p>
      <Button
        type="button"
        onClick={handleAttest}
        disabled={state.status === "submitting" || state.status === "confirmed"}
        className="w-fit"
      >
        {state.status === "submitting" ? "Submitting…" : "Attest on-chain"}
      </Button>
      {state.status === "confirmed" ? (
        <p role="status" className="text-sm font-medium text-lafiya-teal">
          Attestation confirmed{state.transactionHash ? ` (tx ${state.transactionHash})` : ""}.
        </p>
      ) : null}
      {state.status === "error" ? (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
