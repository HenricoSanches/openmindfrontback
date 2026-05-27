import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/openmind/Dashboard";
import { usePageNav } from "@/hooks/use-page-nav";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Page,
  head: () => ({ meta: [{ title: "Painel — OpenMind" }] }),
});

function Page() {
  const onNavigate = usePageNav();
  const navigate = useNavigate();
  const { role, user, loading } = useAuth();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/" });
      return;
    }

    // ADMIN
    if (role === "admin") {
      navigate({ to: "/admin-dashboard" });
      return;
    }

    // PSICÓLOGO
    if (role === "psychologist") {
      setChecking(false);
      return;
    }

    // PACIENTE
    if (role === "patient") {
      (async () => {
        const { data } = await supabase
          .from("initial_assessments")
          .select("id")
          .eq("patient_id", user.id)
          .maybeSingle();

        if (!data) {
          navigate({ to: "/initial-assessment" });
        } else {
          setChecking(false);
        }
      })();

      return;
    }

    setChecking(false);
  }, [loading, role, user, navigate]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando...
      </div>
    );
  }

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <Dashboard
      userType={role}
      onNavigate={onNavigate}
      onLogout={logout}
    />
  );
}