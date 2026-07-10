import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractBearerToken } from "@/lib/auth/bearerToken";
import { requireAuthenticatedChw } from "@/lib/auth/requireAuthenticatedChw";
import { authErrorResponse } from "@/lib/http/authErrorResponse";
import { parsePatientRecordInput } from "@/lib/validation/patientRecord";
import { upsertPatientRecord } from "@/lib/supabase/patientRecordRepository";

function extractOptionalId(body: unknown): string | undefined {
  if (body !== null && typeof body === "object" && "id" in body) {
    const id = (body as { id: unknown }).id;
    if (typeof id === "string" && id.length > 0) return id;
  }
  return undefined;
}

/**
 * Creates or updates a patient's emergency profile. Requires a bearer token
 * for an allowlisted CHW — split out from the route file so it can be unit
 * tested with an injected Supabase client instead of the real network.
 */
export async function handleCreateOrUpdateRecord(
  request: Request,
  client: SupabaseClient,
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  try {
    await requireAuthenticatedChw(client, token);
  } catch (error) {
    return authErrorResponse(error);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = parsePatientRecordInput(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const record = await upsertPatientRecord(client, parsed.data, extractOptionalId(body));
  return NextResponse.json({ record }, { status: 201 });
}
