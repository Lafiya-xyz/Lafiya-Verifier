import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/config/env";

let browserClient: SupabaseClient | undefined;

/** Browser-safe Supabase client, scoped to the anon key and RLS policies. */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const env = getEnv();
  browserClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return browserClient;
}
