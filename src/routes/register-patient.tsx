import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { RegisterPatient } from "@/components/openmind/RegisterPatient";
import { usePageNav } from "@/hooks/use-page-nav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/register-patient")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Page,
  head: () => ({ meta: [{ title: "Cadastro de Paciente — OpenMind" }] }),
});

function Page() {
  const onNavigate = usePageNav();
  const navigate = useNavigate();
  return (
    <RegisterPatient
      onNavigate={onNavigate}
      onRegister={async (d) => {
        const { error } = await supabase.auth.signUp({
          email: d.email,
          password: d.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: d.fullName,
              phone: d.phone,
              cpf: d.cpf,
              university: d.university,
              role: "patient",
            },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Conta criada! Vamos fazer seu prontuário inicial.");
        navigate({ to: "/initial-assessment" });
      }}
    />
  );
}
