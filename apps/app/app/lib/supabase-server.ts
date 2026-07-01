import { createServerClient } from "@supabase/ssr";
import { hasSupabaseEnv, SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-env";

export function createSupabaseServerClient(request: Request) {
  if (!hasSupabaseEnv) {
    return null;
  }

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        const cookieHeader = request.headers.get("Cookie") ?? "";
        return cookieHeader
          .split(";")
          .map((cookie) => cookie.trim())
          .filter(Boolean)
          .map((cookie) => {
            const [name, ...rest] = cookie.split("=");
            return { name, value: rest.join("=") };
          });
      },
      setAll() {
        // Cookie refresh writes are intentionally deferred until the live Supabase/Vercel setup.
        // This slice proves framework/auth wiring without storing secrets or mutating external state.
      },
    },
  });
}
