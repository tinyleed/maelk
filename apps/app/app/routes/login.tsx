import { redirect } from "react-router";

import type { Route } from "./+types/login";
import { LoginForm } from "~/components/login-form";
import { createSupabaseServerClient } from "~/lib/supabase-server";
import { getMissingSupabaseEnv, hasSupabaseEnv } from "~/lib/supabase-env";

export function meta() {
  return [{ title: "Sign in · Mælk" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/app";
  const supabase = createSupabaseServerClient(request);

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
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
            <p>Add these environment variables locally and in Vercel:</p>
            <ul>
              {loaderData.missingEnv.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p className="muted">
              The app still builds without them so preview deployment can be prepared safely.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
