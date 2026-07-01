import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseEnv, SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-env";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseEnv) {
    return null;
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
