import { redirect } from "react-router";

import type { Route } from "./+types/login";
import { LoginForm } from "~/components/login-form";
import { getClientSafeRedirectPath } from "~/lib/client-safe-redirect";
import { createSupabaseBrowserClient } from "~/lib/supabase-client";
import { getMissingSupabaseEnv, hasSupabaseEnv } from "~/lib/supabase-env";

export function meta() {
  return [{ title: "Sign in · Mælk" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const next = getClientSafeRedirectPath(url.searchParams.get("next"));
  const supabase = createSupabaseBrowserClient();

  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      throw redirect(next);
    }
  }

  return {
    next,
    hasSupabaseEnv,
    missingEnv: getMissingSupabaseEnv(),
  };
}

export default function LoginRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main className="shell narrow-shell">
      <section className="panel auth-panel">
        <p className="eyebrow">Mælk login</p>
        <h1>Sign in to the Mælk operator shell</h1>
        {loaderData.hasSupabaseEnv ? (
          <LoginForm nextPath={loaderData.next} />
        ) : (
          <div className="setup-card">
            <h2>Supabase is not configured yet</h2>
            <p>Add these public browser variables locally before signing in:</p>
            <ul>
              {loaderData.missingEnv.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p className="muted">
              The app still builds without them so the SPA and API stack can be
              verified without secrets.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
