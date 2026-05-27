import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Appointments } from "@/components/openmind/Appointments";
import { usePageNav } from "@/hooks/use-page-nav";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/appointments")({
  component: Page,
  head: () => ({ meta: [{ title: "Agendamentos — OpenMind" }] }),
});

function Page() {
  const onNavigate = usePageNav();
  const navigate = useNavigate();
  const { role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando…</div>;
  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };
  return <Appointments userType={role} onNavigate={onNavigate} onLogout={logout} />;
}
