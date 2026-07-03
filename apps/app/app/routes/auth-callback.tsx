import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { Button } from "~/components/button";
import { createSupabaseBrowserClient } from "~/lib/supabase-client";

export function meta() {
  return [{ title: "Auth callback · Mælk" }];
}

export default function AuthCallbackRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    let cancelled = false;

    async function completeSignIn() {
      const supabase = createSupabaseBrowserClient();
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/app";

      if (!supabase || !code) {
        setMessage("Supabase is not configured or the callback is missing a code.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (cancelled) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      navigate(next, { replace: true });
    }

    void completeSignIn();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <main className="shell narrow-shell">
      <section className="panel">
        <p className="eyebrow">Supabase callback</p>
        <h1>{message}</h1>
        <Button asChild>
          <Link to="/login">Back to login</Link>
        </Button>
      </section>
    </main>
  );
}
