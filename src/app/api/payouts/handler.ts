import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractBearerToken } from "@/lib/auth/bearerToken";
import { requireAuthenticatedChw } from "@/lib/auth/requireAuthenticatedChw";
import { authErrorResponse } from "@/lib/http/authErrorResponse";
import { listPayoutsForChw } from "@/lib/supabase/payoutRepository";

/**
 * Lists the authenticated CHW's own payout records. The CHW id always
 * comes from their verified session, never from a query param — a CHW can
 * only ever see their own payouts.
 */
export async function handleListPayouts(
  request: Request,
  client: SupabaseClient,
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

  const payouts = await listPayoutsForChw(client, chw.id);
  return NextResponse.json({ payouts });
}
