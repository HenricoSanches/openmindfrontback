import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import RegisterPsychologist from "@/components/openmind/RegisterPsychologist";
import { usePageNav } from "@/hooks/use-page-nav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/register-psychologist")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Page,
  head: () => ({ meta: [{ title: "Cadastro de Psicólogo — OpenMind" }] }),
});

function Page() {
  const onNavigate = usePageNav();
  const navigate = useNavigate();
  return (
    <RegisterPsychologist
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
              crp: d.crp,
              crp_region: d.crpRegion,
              specialty: d.specialization,
              approach: d.approach,
              bio: d.bio,
              role: "psychologist",
            },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Cadastro realizado! Bem-vindo(a) ao OpenMind.");
        navigate({ to: "/dashboard" });
      }}
    />
  );
}
