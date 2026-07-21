import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import { getServerAuthSession, logoutServerSession } from "~/lib/auth-api";

export function LogoutButton() {
  const navigate = useNavigate();

  async function handleLogout() {
    const session = await getServerAuthSession();
    if (session.authConfigured && session.authenticated) {
      await logoutServerSession(session.csrfToken);
    }
    navigate("/login", { replace: true });
  }

  return (
    <Button onClick={handleLogout} type="button">
      Sign out
    </Button>
  );
}
