import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { hasSupabaseEnv } from "~/lib/supabase-env";

export function meta() {
  return [
    { title: "Mælk" },
    { name: "description", content: "Mælk commerce operating system v0" },
  ];
}

export default function HomeRoute() {
  return (
    <main className="shell landing-shell">
      <section className="hero-card">
        <p className="eyebrow">Mælk v0</p>
        <h1>Commerce operating system, one safe slice at a time.</h1>
        <p className="lede">
          This React Router v8 SPA shell is prepared for Supabase Auth in the
          browser, a same-origin Express API, Tailwind styling, and shadcn/ui
          primitives. Product Launch OS remains a local prototype, not the
          platform goal.
        </p>
        <div className="action-row">
          <Button asChild variant="primary">
            <Link to="/app">Open app</Link>
          </Button>
          <Button asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="grid two">
        <article className="panel">
          <p className="eyebrow">Framework</p>
          <h2>React Router framework</h2>
          <p>
            Routes are declared in <code>app/routes.ts</code>, rendered as a
            client-first SPA, and served locally by the Express runtime after
            build.
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">Auth</p>
          <h2>{hasSupabaseEnv ? "Supabase env detected" : "Supabase env not configured"}</h2>
          <p>
            Add the public Supabase URL and anon key in local runtime env.
            No service-role key belongs in this app shell.
          </p>
        </article>
      </section>
    </main>
  );
}
