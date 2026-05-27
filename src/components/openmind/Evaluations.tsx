import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Star, User, MessageSquare } from "lucide-react";
import type { UserType, Page } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  userType: UserType;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Appointment {
  id: string;
  patient_id: string;
  psychologist_id: string;
  scheduled_at: string;
  status: string;
  psychologist?: {
    full_name: string;
    specialty: string | null;
  } | null;
}

interface Evaluation {
  id: string;
  appointment_id: string;
  patient_id: string;
  psychologist_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  patient?: { full_name: string } | null;
  psychologist?: { full_name: string } | null;
}

function Stars({
  value,
  onChange,
  size = 5,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`w-${size} h-${size} ${
              n <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function Evaluations({
  userType,
  onNavigate,
  onLogout,
}: Props) {
  const { user } = useAuth();

  const [pending, setPending] = useState<Appointment[]>([]);
  const [done, setDone] = useState<Evaluation[]>([]);
  const [received, setReceived] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<{
    appointment: Appointment | null;
    rating: number;
    comment: string;
  }>({
    appointment: null,
    rating: 5,
    comment: "",
  });

  const loadPatient = async () => {
    if (!user) return;

    setLoading(true);

    const { data: appointmentsData, error: appointmentsError } =
      await supabase
        .from("appointments")
        .select("*")
        .in("status", ["scheduled", "completed"])
        .eq("patient_id", user.id)
        .order("scheduled_at", { ascending: false });

    if (appointmentsError) {
      toast.error(appointmentsError.message);
      setLoading(false);
      return;
    }

    const appointments =
      (appointmentsData as Appointment[]) || [];

    const psychologistIds = Array.from(
      new Set(
        appointments.map((a) => a.psychologist_id)
      )
    );

    if (psychologistIds.length > 0) {
      const { data: psychologists } = await supabase
        .from("profiles")
        .select("id, full_name, specialty")
        .in("id", psychologistIds);

      const map = new Map(
        (psychologists || []).map((p: any) => [
          p.id,
          p,
        ])
      );

      appointments.forEach((appointment) => {
        appointment.psychologist = map.get(
          appointment.psychologist_id
        );
      });
    }

    const { data: evaluationsData, error: evalError } =
      await supabase
        .from("evaluations")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    if (evalError) {
      toast.error(evalError.message);
      setLoading(false);
      return;
    }

    const evaluations =
      (evaluationsData as Evaluation[]) || [];

    const evaluatedAppointmentIds = new Set(
      evaluations.map((e) => e.appointment_id)
    );

    const evalPsychologistIds = Array.from(
      new Set(
        evaluations.map((e) => e.psychologist_id)
      )
    );

    if (evalPsychologistIds.length > 0) {
      const { data: psychologists } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", evalPsychologistIds);

      const map = new Map(
        (psychologists || []).map((p: any) => [
          p.id,
          p,
        ])
      );

      evaluations.forEach((evaluation) => {
        evaluation.psychologist = map.get(
          evaluation.psychologist_id
        );
      });
    }

    setPending(
      appointments.filter(
        (appointment) =>
          !evaluatedAppointmentIds.has(
            appointment.id
          )
      )
    );

    setDone(evaluations);

    setLoading(false);
  };

  const loadPsychologist = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .eq("psychologist_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const evaluations = (data as Evaluation[]) || [];

    const patientIds = Array.from(
      new Set(
        evaluations.map((e) => e.patient_id)
      )
    );

    if (patientIds.length > 0) {
      const { data: patients } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", patientIds);

      const map = new Map(
        (patients || []).map((p: any) => [
          p.id,
          p,
        ])
      );

      evaluations.forEach((evaluation) => {
        evaluation.patient = map.get(
          evaluation.patient_id
        );
      });
    }

    setReceived(evaluations);

    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    if (userType === "patient") {
      loadPatient();
    }

    if (userType === "psychologist") {
      loadPsychologist();
    }
  }, [user?.id, userType]);

  const submitEvaluation = async () => {
    if (!user || !form.appointment) return;

    const { error } = await supabase
      .from("evaluations")
      .insert({
        appointment_id: form.appointment.id,
        patient_id: user.id,
        psychologist_id:
          form.appointment.psychologist_id,
        rating: form.rating,
        comment:
          form.comment.trim() || null,
      });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Avaliação enviada.");

    setForm({
      appointment: null,
      rating: 5,
      comment: "",
    });

    loadPatient();
  };

  const average =
    received.length > 0
      ? (
          received.reduce(
            (sum, item) => sum + item.rating,
            0
          ) / received.length
        ).toFixed(1)
      : "—";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        onNavigate={onNavigate}
        showAuthButtons={false}
        onLogout={onLogout}
        userType={userType}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl text-gray-900 dark:text-white">
            Avaliações
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userType === "patient"
              ? "Avalie suas sessões."
              : "Feedback recebido dos pacientes."}
          </p>
        </div>

        {loading ? (
          <div className="text-gray-500">
            Carregando...
          </div>
        ) : userType === "patient" ? (
          <>
            <section className="mb-8">
              <h2 className="mb-3 text-gray-900 dark:text-white">
                Aguardando avaliação
              </h2>

              {pending.length === 0 ? (
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-500">
                  Nenhuma sessão concluída pendente de avaliação.
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>

                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {
                              appointment.psychologist
                                ?.full_name
                            }
                          </div>

                          <div className="text-xs text-gray-500">
                            {new Date(
                              appointment.scheduled_at
                            ).toLocaleString("pt-BR")}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setForm({
                            appointment,
                            rating: 5,
                            comment: "",
                          })
                        }
                        className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm hover:bg-pink-700"
                      >
                        Avaliar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-gray-900 dark:text-white">
                Suas avaliações
              </h2>

              {done.length === 0 ? (
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-500">
                  Você ainda não enviou avaliações.
                </div>
              ) : (
                <div className="space-y-3">
                  {done.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {
                            evaluation.psychologist
                              ?.full_name
                          }
                        </div>

                        <Stars
                          value={evaluation.rating}
                        />
                      </div>

                      {evaluation.comment && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {evaluation.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-500 mb-1">
                  Média
                </div>

                <div className="text-3xl text-gray-900 dark:text-white flex items-center gap-2">
                  {average}

                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-500 mb-1">
                  Total
                </div>

                <div className="text-3xl text-gray-900 dark:text-white">
                  {received.length}
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-500 mb-1">
                  Comentários
                </div>

                <div className="text-3xl text-gray-900 dark:text-white">
                  {
                    received.filter(
                      (r) => r.comment
                    ).length
                  }
                </div>
              </div>
            </div>

            <h2 className="mb-3 text-gray-900 dark:text-white">
              Feedback recebido
            </h2>

            {received.length === 0 ? (
              <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-500">
                Você ainda não recebeu avaliações.
              </div>
            ) : (
              <div className="space-y-3">
                {received.map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        Avaliação anônima
                      </div>

                      <Stars
                        value={evaluation.rating}
                      />
                    </div>

                    {evaluation.comment && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {evaluation.comment}
                      </p>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(
                        evaluation.created_at
                      ).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {form.appointment && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() =>
            setForm({
              appointment: null,
              rating: 5,
              comment: "",
            })
          }
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6"
          >
            <h3 className="text-lg text-gray-900 dark:text-white mb-2">
              Avaliar sessão
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              {
                form.appointment.psychologist
                  ?.full_name
              }
            </p>

            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Nota
            </label>

            <Stars
              value={form.rating}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  rating: v,
                }))
              }
            />

            <label className="block text-sm text-gray-700 dark:text-gray-300 mt-4 mb-2">
              Comentário
            </label>

            <textarea
              rows={4}
              value={form.comment}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  comment: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              placeholder="Conte como foi sua experiência..."
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() =>
                  setForm({
                    appointment: null,
                    rating: 5,
                    comment: "",
                  })
                }
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm"
              >
                Cancelar
              </button>

              <button
                onClick={submitEvaluation}
                className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm"
              >
                Enviar avaliação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}