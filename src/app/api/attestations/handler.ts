import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Keypair } from "@stellar/stellar-sdk";
import { extractBearerToken } from "@/lib/auth/bearerToken";
import { requireAuthenticatedChw } from "@/lib/auth/requireAuthenticatedChw";
import { authErrorResponse } from "@/lib/http/authErrorResponse";
import { getPatientRecordById } from "@/lib/supabase/patientRecordRepository";
import { hashPatientRecord } from "@/lib/crypto/hash";
import { submitAttestation, type SubmitAttestationDeps } from "@/lib/stellar/attestationContract";
import { saveAttestation } from "@/lib/supabase/attestationRepository";
import { queueAttestationPayout } from "@/lib/payouts/queueAttestationPayout";
import type { Attestation } from "@/types";

export interface AttestationHandlerDeps {
  signer: Keypair;
  stellar?: SubmitAttestationDeps;
}

function extractRecordId(body: unknown): string | null {
  if (body !== null && typeof body === "object" && "recordId" in body) {
    const recordId = (body as { recordId: unknown }).recordId;
    if (typeof recordId === "string" && recordId.length > 0) return recordId;
  }
  return null;
}

/**
 * Attests a patient record: hashes it, submits the hash to the Soroban
 * attestation registry, records the attempt off-chain, and queues the
 * CHW's USDC payout once the attestation confirms.
 */
export async function handleSubmitAttestation(
  request: Request,
  client: SupabaseClient,
  deps: AttestationHandlerDeps,
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  let chw;
  try {
    chw = await requireAuthenticatedChw(client, token);
  } catch (error) {
    return authErrorResponse(error);
  }

  const body: unknown = await request.json().catch(() => null);
  const recordId = extractRecordId(body);
  if (!recordId) {
    return NextResponse.json({ error: "recordId is required" }, { status: 400 });
  }

  const record = await getPatientRecordById(client, recordId);
  if (!record) {
    return NextResponse.json(
      { error: `No patient record found for id ${recordId}` },
      { status: 404 },
    );
  }

  const recordHash = hashPatientRecord(record);

  let attestation: Attestation;
  try {
    attestation = await submitAttestation(
      { recordId: record.id, recordHash, attesterPublicKey: chw.stellarPublicKey },
      deps.signer,
      deps.stellar,
    );
  } catch (error) {
    await saveAttestation(
      client,
      {
        recordId: record.id,
        recordHash,
        attesterPublicKey: chw.stellarPublicKey,
        timestamp: Date.now(),
      },
      "failed",
    );
    throw error;
  }

  await saveAttestation(client, attestation, "confirmed");
  const payout = await queueAttestationPayout(client, chw.id, attestation);

  return NextResponse.json({ attestation, payout }, { status: 201 });
}
