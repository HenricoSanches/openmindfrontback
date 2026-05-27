import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "@/components/openmind/Login";
import { usePageNav } from "@/hooks/use-page-nav";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — OpenMind" }] }),
});

function LoginPage() {
  const onNavigate = usePageNav();
  const navigate = useNavigate();
  return <Login onNavigate={onNavigate} onLoggedIn={() => navigate({ to: "/dashboard" })} />;
}
