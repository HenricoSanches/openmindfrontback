import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/openmind/AdminDashboard";
import { usePageNav } from "@/hooks/use-page-nav";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin-dashboard")({
  component: Page,
  head: () => ({ meta: [{ title: "Admin — OpenMind" }] }),
});

function Page() {
  const onNavigate = usePageNav();
  const navigate = useNavigate();
  const { role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando…</div>;
  if (role !== "admin") throw redirect({ to: "/dashboard" });
  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };
  return <AdminDashboard userType={role} onNavigate={onNavigate} onLogout={logout} />;
}
