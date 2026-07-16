import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import { createSupabaseBrowserClient } from "~/lib/supabase-client";

export function LogoutButton() {
  const navigate = useNavigate();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate("/login", { replace: true });
  }

  return (
    <Button onClick={handleLogout} type="button">
      Sign out
    </Button>
  );
}
