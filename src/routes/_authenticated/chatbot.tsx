import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Chatbot } from "@/components/openmind/Chatbot";
import { usePageNav } from "@/hooks/use-page-nav";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/chatbot")({
  component: Page,
  head: () => ({ meta: [{ title: "Assistente — OpenMind" }] }),
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
  return <Chatbot userType={role} onNavigate={onNavigate} onLogout={logout} />;
}
