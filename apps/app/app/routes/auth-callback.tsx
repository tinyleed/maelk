import { Link, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button";
import { getClientSafeRedirectPath } from "~/lib/client-safe-redirect";

export function meta() {
  return [{ title: "Auth callback · Mælk" }];
}

export default function AuthCallbackRoute() {
  const [searchParams] = useSearchParams();
  const next = getClientSafeRedirectPath(searchParams.get("next"));

  return (
    <main className="shell narrow-shell">
      <section className="panel">
        <p className="eyebrow">Retired auth callback</p>
        <h1>Email OTP now completes through the same-origin API</h1>
        <p>
          Browser magic-link exchange has been retired so refresh credentials stay server-owned. Use the
          email OTP form instead.
        </p>
        <Button asChild>
          <Link to={`/login?next=${encodeURIComponent(next)}`}>Back to login</Link>
        </Button>
      </section>
    </main>
  );
}
