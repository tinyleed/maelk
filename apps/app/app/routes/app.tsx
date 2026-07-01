import { Link, redirect } from "react-router";

import type { Route } from "./+types/app";
import { Button } from "~/components/button";
import { LogoutButton } from "~/components/logout-button";
import { demoLaunches } from "~/lib/product-launches";
import { createSupabaseServerClient } from "~/lib/supabase-server";
import { hasSupabaseEnv } from "~/lib/supabase-env";

export function meta() {
  return [{ title: "App · Mælk" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createSupabaseServerClient(request);
  let email: string | null = null;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect("/login?next=/app");
    }

    email = user.email ?? null;
  }

  return {
    email,
    hasSupabaseEnv,
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
          {loaderData.email ? (
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
          {loaderData.email
            ? `Logged in as ${loaderData.email}`
            : "Login required once Supabase env is configured"}
        </h2>
        <p>
          {loaderData.hasSupabaseEnv
            ? "React Router loader checks Supabase Auth before rendering this route."
            : "Supabase variables are missing, so this local preview shows setup state instead of blocking development."}
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Product Launch OS</p>
            <h2>First protected workflow surface</h2>
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
