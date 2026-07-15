import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { hasSupabaseEnv, SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-env";

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  if (!hasSupabaseEnv) {
    return null;
  }

  browserClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return browserClient;
}
