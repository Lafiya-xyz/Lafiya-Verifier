import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleListPayouts } from "./handler";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleListPayouts(request, getSupabaseAdminClient());
}
