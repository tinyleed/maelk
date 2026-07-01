import { Link } from "react-router";

import { Button } from "~/components/button";
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
          This React Router framework shell is prepared for Supabase Auth,
          Vercel hosting, Tailwind styling, and Radix UI primitives. Product
          Launch OS remains the first workflow wedge.
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
            Routes are declared in <code>app/routes.ts</code>, rendered by route
            modules, and deployed to Vercel with the official preset.
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">Auth</p>
          <h2>{hasSupabaseEnv ? "Supabase env detected" : "Supabase env not configured"}</h2>
          <p>
            Add the public Supabase URL and anon key in Vercel or local env.
            No service-role key belongs in this app shell.
          </p>
        </article>
      </section>
    </main>
  );
}
