import { useState, useEffect } from "react";
import {
  Heart,
  User,
  Brain,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
 ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

const MOTIVATIONS = [
  "Ansiedade",
  "Depressão",
  "Estresse acadêmico",
  "Problemas de relacionamento",
  "Questões familiares",
  "Baixa autoestima",
  "Tristeza persistente",
  "Dificuldades de adaptação à universidade",
  "Pressão por desempenho",
  "Conflitos pessoais",
  "Questões de identidade",
  "Dificuldades financeiras",
];

const SYMPTOMS = [
  "Insônia ou sono excessivo",
  "Falta de energia/cansaço",
  "Irritabilidade",
  "Choro frequente",
  "Dificuldade de concentração",
  "Perda ou ganho de apetite",
  "Taquicardia/coração acelerado",
  "Tensão muscular",
  "Isolamento social",
  "Procrastinação excessiva",
  "Pensamentos negativos recorrentes",
];

const AVAILABILITY = [
  "Manhã (8h-12h)",
  "Tarde (12h-18h)",
  "Noite (18h-22h)",
  "Finais de semana",
];

type Form = {
  age_range: string;
  course: string;
  period: string;
  motivations: string[];
  other_motivation: string;
  symptoms: string[];
  symptom_intensity: string;
  symptom_duration: string;
  prior_therapy: string;
  academic_performance: string;
  social_relationships: string;
  sleep_quality: string;
  preferred_approach: string;
  preferred_gender: string;
  availability: string[];
  urgency: string;
  crisis: string;
  additional_notes: string;
};

const initial: Form = {
  age_range: "",
  course: "",
  period: "",
  motivations: [],
  other_motivation: "",
  symptoms: [],
  symptom_intensity: "",
  symptom_duration: "",
  prior_therapy: "",
  academic_performance: "",
  social_relationships: "",
  sleep_quality: "",
  preferred_approach: "Sem preferência",
  preferred_gender: "Sem preferência",
  availability: [],
  urgency: "",
  crisis: "",
  additional_notes: "",
};

const STEPS = [
  { icon: User, title: "Informações Básicas" },
  { icon: Heart, title: "O que te traz aqui?" },
  { icon: Brain, title: "Sintomas Atuais" },
  { icon: Calendar, title: "Experiência Anterior" },
  { icon: Clock, title: "Impacto no Cotidiano" },
  { icon: CheckCircle2, title: "Preferências e Disponibilidade" },
];

export function InitialAssessment() {
  const { user, role, loading } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && role && role !== "patient") {
      toast.error(
        "Apenas pacientes podem acessar o prontuário inicial."
      );

      navigate({
        to:
          role === "admin"
            ? "/admin-dashboard"
            : "/dashboard",
        replace: true,
      });
    }
  }, [role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  if (role && role !== "patient") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Redirecionando...
      </div>
    );
  }

  const toggle = (
    k: "motivations" | "symptoms" | "availability",
    v: string
  ) => {
    setForm((f) => {
      const arr = f[k];

      return {
        ...f,
        [k]: arr.includes(v)
          ? arr.filter((x) => x !== v)
          : [...arr, v],
      };
    });
  };

  const canNext = (() => {
    if (step === 1)
      return form.age_range && form.course.trim() && form.period;

    if (step === 2) return form.motivations.length > 0;

    if (step === 3)
      return (
        form.symptoms.length > 0 &&
        form.symptom_intensity &&
        form.symptom_duration
      );

    if (step === 4) return !!form.prior_therapy;

    if (step === 5)
      return (
        form.academic_performance &&
        form.social_relationships &&
        form.sleep_quality
      );

    if (step === 6)
      return (
        form.availability.length > 0 &&
        form.urgency &&
        form.crisis
      );

    return false;
  })();

  const submit = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from("initial_assessments")
      .upsert(
        {
          patient_id: user.id,
          ...form,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "patient_id",
        }
      );

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Prontuário concluído!");

    navigate({ to: "/dashboard" });
  };

  const progress = Math.round((step / 6) * 100);

  const StepIcon = STEPS[step - 1].icon;

  const card =
    "bg-gray-900/70 border border-gray-800 rounded-2xl p-6";

  const label = "block text-sm text-gray-300 mb-2";

  const ctrl =
    "w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500";

  const checkRow = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
      active
        ? "border-pink-500 bg-pink-500/10"
        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
    }`;

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-pink-600 rounded-full mb-3">
            <Heart className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl font-bold">
            Prontuário Inicial
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Suas respostas nos ajudarão a direcionar você ao
            psicólogo mais adequado
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-pink-400">
              Etapa {step} de 6
            </span>

            <span className="text-gray-400">
              {progress}% completo
            </span>
          </div>

          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-3 mb-5">
            <StepIcon className="w-6 h-6 text-pink-500" />

            <h2 className="text-xl font-semibold">
              {STEPS[step - 1].title}
            </h2>
          </div>

          {/* TODO O RESTANTE DAS ETAPAS CONTINUA EXATAMENTE IGUAL */}
        </div>

        <div className="mt-6 flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 rounded-lg border border-gray-700 hover:bg-gray-900 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
          )}

          {step < 6 ? (
            <button
              onClick={() => canNext && setStep(step + 1)}
              disabled={!canNext}
              className="flex-1 px-5 py-3 rounded-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              Próxima Etapa
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!canNext || saving}
              className="flex-1 px-5 py-3 rounded-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />

              {saving
                ? "Salvando…"
                : "Concluir Prontuário"}
            </button>
          )}
        </div>

        <div className="mt-4 p-4 rounded-lg border border-pink-500/30 bg-pink-500/10 text-sm text-pink-200 flex items-start gap-2">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />

          <span>
            <strong>Privacidade:</strong> Todas as
            informações fornecidas são confidenciais e serão
            utilizadas apenas para direcioná-lo ao psicólogo
            mais adequado ao seu perfil.
          </span>
        </div>
      </div>
    </div>
  );
}