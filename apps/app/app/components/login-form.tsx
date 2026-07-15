import { useState } from "react";

import { Button } from "~/components/ui/button";
import { createSupabaseBrowserClient } from "~/lib/supabase-client";

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath = "/app" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured. Add env vars before signing in.");
      return;
    }

    const origin = window.location.origin;
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Magic link sent. Check your email and return here after login.");
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="mads@example.com"
      />
      <Button disabled={status === "loading"} type="submit" variant="primary">
        {status === "loading" ? "Sending…" : "Send magic link"}
      </Button>
      {message ? <p className={status === "error" ? "error-text" : "success-text"}>{message}</p> : null}
    </form>
  );
}
