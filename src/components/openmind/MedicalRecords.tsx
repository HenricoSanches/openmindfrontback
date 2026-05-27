import { useEffect, useState } from "react";
import { Header } from "./Header";
import { FileText, Plus, X, Calendar, User, Trash2, Edit2 } from "lucide-react";
import type { UserType, Page } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  userType: UserType;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Record {
  id: string;
  patient_id: string;
  psychologist_id: string;
  session_date: string;
  content: string;
  tags: string[];
  created_at: string;
  patient?: { full_name: string } | null;
  psychologist?: { full_name: string } | null;
}

interface Patient {
  id: string;
  full_name: string;
}

const emptyForm = { id: "", patient_id: "", session_date: "", content: "", tags: "" };

export function MedicalRecords({ userType, onNavigate, onLogout }: Props) {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("medical_records")
      .select("*")
      .order("session_date", { ascending: false });
    if (error) toast.error(error.message);
    const list = (data ?? []) as Record[];
    const ids = Array.from(new Set(list.flatMap((r) => [r.patient_id, r.psychologist_id])));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      list.forEach((r) => {
        r.patient = map.get(r.patient_id) as any;
        r.psychologist = map.get(r.psychologist_id) as any;
      });
    }
    setRecords(list);
    setLoading(false);
  };

  const loadPatients = async () => {
    if (!user) return;
    const { data: apts } = await supabase
      .from("appointments")
      .select("patient_id")
      .eq("psychologist_id", user.id);
    const ids = Array.from(new Set((apts ?? []).map((a: any) => a.patient_id)));
    if (!ids.length) { setPatients([]); return; }
    const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
    setPatients((profs ?? []) as Patient[]);
  };

  useEffect(() => {
    load();
    if (userType === "psychologist") loadPatients();
  }, [userType, user?.id]);

  const openCreate = () => {
    setForm({ ...emptyForm, session_date: new Date().toISOString().slice(0, 16) });
    setShowForm(true);
  };

  const openEdit = (r: Record) => {
    setForm({
      id: r.id,
      patient_id: r.patient_id,
      session_date: new Date(r.session_date).toISOString().slice(0, 16),
      content: r.content,
      tags: r.tags.join(", "),
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!user) return;
    if (!form.patient_id || !form.content.trim() || !form.session_date) {
      toast.error("Preencha paciente, data e conteúdo.");
      return;
    }
    const payload = {
      patient_id: form.patient_id,
      psychologist_id: user.id,
      session_date: new Date(form.session_date).toISOString(),
      content: form.content.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const { error } = form.id
      ? await supabase.from("medical_records").update(payload).eq("id", form.id)
      : await supabase.from("medical_records").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(form.id ? "Registro atualizado." : "Registro criado.");
    setShowForm(false);
    setForm(emptyForm);
    load();
  };

  const remove = async (r: Record) => {
    if (!confirm("Excluir este registro do prontuário?")) return;
    const { error } = await supabase.from("medical_records").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Registro removido.");
    load();
  };

  const isPsy = userType === "psychologist";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header onNavigate={onNavigate} showAuthButtons={false} onLogout={onLogout} userType={userType} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-gray-900 dark:text-white text-2xl">Prontuário</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {isPsy ? "Registros das suas sessões." : "Suas anotações de atendimento."}
            </p>
          </div>
          {isPsy && (
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors">
              <Plus className="w-4 h-4" /> Novo registro
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-gray-500">Carregando…</div>
        ) : records.length === 0 ? (
          <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-center text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            Nenhum registro encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div key={r.id} className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(r.session_date).toLocaleString("pt-BR")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      {isPsy ? r.patient?.full_name : r.psychologist?.full_name}
                    </div>
                  </div>
                  {isPsy && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)} className="p-2 text-gray-500 hover:text-pink-600 transition-colors" aria-label="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(r)} className="p-2 text-gray-500 hover:text-red-600 transition-colors" aria-label="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{r.content}</p>
                {r.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.tags.map((t) => (
                      <span key={t} className="px-2 py-1 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white">{form.id ? "Editar registro" : "Novo registro"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Paciente</label>
            <select
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white mb-3"
            >
              <option value="">Selecione</option>
              {patients.map((p) => (<option key={p.id} value={p.id}>{p.full_name}</option>))}
            </select>

            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Data da sessão</label>
            <input
              type="datetime-local"
              value={form.session_date}
              onChange={(e) => setForm({ ...form, session_date: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white mb-3"
            />

            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Anotações</label>
            <textarea
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Queixas, evolução, plano terapêutico…"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white mb-3"
            />

            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Tags (separadas por vírgula)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="ansiedade, sono, estudos"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancelar
              </button>
              <button onClick={save} className="px-4 py-2 text-sm rounded-lg bg-pink-600 text-white hover:bg-pink-700">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
