import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleListPayouts } from "./handler";

export const runtime = "nodejs";
// Reads the caller's Supabase session; must never be statically prerendered.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleListPayouts(request, getSupabaseAdminClient());
}
