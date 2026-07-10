import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { handleCreateOrUpdateRecord } from "./handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleCreateOrUpdateRecord(request, getSupabaseAdminClient());
}
