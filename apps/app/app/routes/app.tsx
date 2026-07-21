import { Link, redirect } from "react-router";

import type { Route } from "./+types/app";
import { Button } from "~/components/ui/button";
import { LogoutButton } from "~/components/logout-button";
import { getServerAuthSession } from "~/lib/auth-api";
import { demoLaunches } from "~/lib/product-launches";

export function meta() {
  return [{ title: "App · Mælk" }];
}

export async function clientLoader() {
  const session = await getServerAuthSession();

  if (session.authConfigured && !session.authenticated) {
    throw redirect("/login?next=/app");
  }

  return {
    session,
    launches: demoLaunches,
  };
}

export default function AppRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main className="shell app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Protected app shell</p>
          <h1>Mælk</h1>
        </div>
        <div className="topbar-actions">
          <Button asChild>
            <Link to="/">Home</Link>
          </Button>
          {loaderData.session.authConfigured && loaderData.session.authenticated ? (
            <LogoutButton />
          ) : (
            <Button asChild variant="primary">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </header>

      <section className="panel">
        <p className="eyebrow">Session</p>
        <h2>
          {loaderData.session.authConfigured && loaderData.session.authenticated
            ? `Logged in as ${loaderData.session.user.email ?? loaderData.session.user.id}`
            : "Local setup mode: server-owned auth is not configured"}
        </h2>
        <p>
          {loaderData.session.authConfigured
            ? "React Router clientLoader checks the same-origin server session before rendering this route."
            : "Required server-only Supabase auth variables are missing, so this local preview shows setup state without simulating identity."}
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Product Launch OS</p>
            <h2>Existing local workflow prototype</h2>
          </div>
          <span className="status-pill">local-only</span>
        </div>
        <div className="launch-grid">
          {loaderData.launches.map((launch) => (
            <article className="launch-card" key={launch.id}>
              <span className={`small-pill ${launch.status}`}>{launch.status}</span>
              <h3>{launch.name}</h3>
              <p>{launch.nextAction}</p>
              <small>Owner: {launch.owner}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
