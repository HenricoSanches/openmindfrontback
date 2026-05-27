import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Calendar, Clock, Bell, BellOff, User, Plus, X, CalendarDays, ArrowLeft, Trash2 } from "lucide-react";
import type { UserType, Page } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  userType: UserType;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Row {
  id: string;
  patient_id: string;
  psychologist_id: string;
  scheduled_at: string;
  status: "scheduled" | "completed" | "cancelled";
  reminder_enabled: boolean;
  notes: string | null;
  patient?: { full_name: string } | null;
  psychologist?: { full_name: string; specialty: string | null } | null;
}

interface Psy {
  id: string;
  full_name: string;
  specialty: string | null;
}

export function Appointments({ userType, onNavigate, onLogout }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [psys, setPsys] = useState<Psy[]>([]);
  const [form, setForm] = useState({ psychologist_id: "", date: "", time: "", reminder_enabled: true });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("scheduled_at", { ascending: false });
    if (error) toast.error(error.message);
    // Fetch names
    const list = (data ?? []) as Row[];
    const ids = Array.from(new Set(list.flatMap((r) => [r.patient_id, r.psychologist_id])));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, specialty")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      list.forEach((r) => {
        r.patient = map.get(r.patient_id) as any;
        r.psychologist = map.get(r.psychologist_id) as any;
      });
    }
    setRows(list);
    setLoading(false);
  };

 const loadPsys = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, specialty")
    .eq("role", "psychologist")
    .eq("approved", true);

  if (error) {
    toast.error(error.message);
    return;
  }

  setPsys((data ?? []) as Psy[]);
};

  useEffect(() => {
    load();
    if (userType === "patient") loadPsys();
  }, [userType]);

  const toggleReminder = async (r: Row) => {
    const { error } = await supabase
      .from("appointments")
      .update({ reminder_enabled: !r.reminder_enabled })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, reminder_enabled: !x.reminder_enabled } : x)));
  };

  const cancelAppt = async (r: Row) => {
    if (!confirm("Cancelar este agendamento?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Agendamento cancelado");
    setRows((rs) => rs.filter((x) => x.id !== r.id));
  };

  const markCompleted = async (r: Row) => {
    const { error } = await supabase.from("appointments").update({ status: "completed" }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Sessão marcada como concluída");
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "completed" } : x)));
  };

  const createAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id;
    if (!uid) return toast.error("Sessão inválida");
    const scheduled_at = new Date(`${form.date}T${form.time}:00`).toISOString();
    const { error } = await supabase.from("appointments").insert({
      patient_id: uid,
      psychologist_id: form.psychologist_id,
      scheduled_at,
      reminder_enabled: form.reminder_enabled,
    });
    if (error) return toast.error(error.message);
    toast.success("Agendamento criado!");
    setShowNew(false);
    setForm({ psychologist_id: "", date: "", time: "", reminder_enabled: true });
    load();
  };

  const scheduled = rows.filter((r) => r.status === "scheduled");
  const past = rows.filter((r) => r.status !== "scheduled");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header onNavigate={onNavigate} showAuthButtons={false} onLogout={onLogout} userType={userType} />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Dashboard</span>
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {userType === "patient" ? "Meus Agendamentos" : "Pacientes Agendados"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {userType === "patient"
                ? "Gerencie suas sessões e configure lembretes"
                : "Visualize e gerencie suas sessões"}
            </p>
          </div>

          {userType === "patient" && (
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 dark:bg-pink-700 text-white rounded-lg hover:bg-pink-700 dark:hover:bg-pink-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Agendamento
            </button>
          )}
        </div>

        {showNew && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novo Agendamento</h2>
                <button onClick={() => setShowNew(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={createAppt} className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700 dark:text-gray-300">Psicólogo</label>
                  <select
                    required
                    value={form.psychologist_id}
                    onChange={(e) => setForm({ ...form, psychologist_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Selecione…</option>
                    {psys.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                        {p.specialty ? ` — ${p.specialty}` : ""}
                      </option>
                    ))}
                  </select>
                  {!psys.length && (
                    <p className="mt-1 text-xs text-gray-500">
                      Nenhum psicólogo cadastrado ainda. Convide um para se cadastrar.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-2 text-gray-700 dark:text-gray-300">Data</label>
                    <input
                      required
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 dark:text-gray-300">Hora</label>
                    <input
                      required
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.reminder_enabled}
                    onChange={(e) => setForm({ ...form, reminder_enabled: e.target.checked })}
                    className="w-5 h-5 text-pink-600 rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Ativar lembrete</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                    Agendar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Próximas Sessões</h2>
          {loading ? (
            <p className="text-gray-500">Carregando…</p>
          ) : scheduled.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Nenhuma sessão agendada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduled.map((r) => {
                const dt = new Date(r.scheduled_at);
                const name = userType === "patient" ? r.psychologist?.full_name : r.patient?.full_name;
                return (
                  <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-gray-900 dark:text-white font-medium">{name ?? "—"}</h3>
                            {userType === "patient" && r.psychologist?.specialty && (
                              <p className="text-sm text-gray-500">{r.psychologist.specialty}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {dt.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleReminder(r)}
                          className={`p-2 rounded-lg ${r.reminder_enabled ? "bg-pink-100 dark:bg-pink-900/30 text-pink-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}
                          title="Lembrete"
                        >
                          {r.reminder_enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                        </button>
                        {userType === "psychologist" && (
                          <button
                            onClick={() => markCompleted(r)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          >
                            Concluir
                          </button>
                        )}
                        {userType === "patient" && (
                          <button
                            onClick={() => cancelAppt(r)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            title="Cancelar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {past.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Histórico</h2>
            <div className="space-y-3">
              {past.map((r) => {
                const dt = new Date(r.scheduled_at);
                const name = userType === "patient" ? r.psychologist?.full_name : r.patient?.full_name;
                return (
                  <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 opacity-75 flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{name ?? "—"}</p>
                      <p className="text-sm text-gray-500">
                        {dt.toLocaleDateString("pt-BR")} às {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 capitalize">
                      {r.status === "completed" ? "Concluída" : "Cancelada"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
