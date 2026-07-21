import { redirect } from "react-router";

import type { Route } from "./+types/login";
import { LoginForm } from "~/components/login-form";
import { getServerAuthSession } from "~/lib/auth-api";
import { getClientSafeRedirectPath } from "~/lib/client-safe-redirect";

export function meta() {
  return [{ title: "Sign in · Mælk" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const next = getClientSafeRedirectPath(url.searchParams.get("next"));
  const session = await getServerAuthSession();

  if (session.authConfigured && session.authenticated) {
    throw redirect(next);
  }

  return {
    next,
    session,
  };
}

export default function LoginRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main className="shell narrow-shell">
      <section className="panel auth-panel">
        <p className="eyebrow">Mælk login</p>
        <h1>Sign in to the Mælk operator shell</h1>
        {loaderData.session.authConfigured ? (
          <LoginForm nextPath={loaderData.next} />
        ) : (
          <div className="setup-card">
            <h2>Server-owned Supabase auth is not configured yet</h2>
            <p>Add these server-only variables locally before signing in:</p>
            <ul>
              {loaderData.session.missingConfiguration.map((name: string) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p className="muted">
              The app still builds without secrets, but it does not simulate a logged-in identity.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
