import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminDashboardProps {
  userType: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AdminDashboard({
  onLogout,
}: AdminDashboardProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [pendingPsychologists, setPendingPsychologists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      // PACIENTES
      const { data: patientsData, error: patientsError } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("role", "patient")
          .order("created_at", { ascending: false });

      // PSICÓLOGOS APROVADOS
      const {
        data: psychologistsData,
        error: psychologistsError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "psychologist")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      // PSICÓLOGOS PENDENTES
      const {
        data: pendingData,
        error: pendingError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "psychologist")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (patientsError) {
        console.error("Erro pacientes:", patientsError);
      }

      if (psychologistsError) {
        console.error(
          "Erro psicólogos:",
          psychologistsError
        );
      }

      if (pendingError) {
        console.error("Erro pendentes:", pendingError);
      }

      if (patientsData) {
        setPatients(patientsData);
      }

      if (psychologistsData) {
        setPsychologists(psychologistsData);
      }

      if (pendingData) {
        setPendingPsychologists(pendingData);
      }

    } catch (error) {
      console.error("Erro dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function approvePsychologist(id: string) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: "approved",
        })
        .eq("id", id);

      if (error) {
        console.error(error);
        alert("Erro ao aprovar psicólogo.");
        return;
      }

      alert("Psicólogo aprovado com sucesso!");

      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteUser(id: string) {
    const confirmDelete = confirm(
      "Tem certeza que deseja excluir este usuário?"
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(error);
        alert("Erro ao excluir usuário.");
        return;
      }

      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function editUser(user: any) {
    const newName = prompt(
      "Novo nome:",
      user.full_name || user.name
    );

    if (!newName) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: newName,
        })
        .eq("id", user.id);

      if (error) {
        console.error(error);
        alert("Erro ao editar usuário.");
        return;
      }

      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl font-bold">
          Carregando dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-pink-600">
          OpenMind Admin
        </h1>

        <button
          onClick={onLogout}
          className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-xl"
        >
          Sair
        </button>
      </header>

      <main className="p-6">
        {/* HERO */}
        <div className="bg-pink-600 text-white rounded-3xl p-8 mb-8">
          <h2 className="text-3xl font-bold">
            Painel Administrativo
          </h2>

          <p className="mt-2 text-pink-100">
            Gerencie usuários, aprove psicólogos e monitore a plataforma.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-gray-500 text-sm">
              Pacientes
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {patients.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-gray-500 text-sm">
              Psicólogos
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {psychologists.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-gray-500 text-sm">
              Pendentes
            </p>

            <h3 className="text-4xl font-bold mt-2 text-yellow-500">
              {pendingPsychologists.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-gray-500 text-sm">
              Total
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {patients.length +
                psychologists.length +
                pendingPsychologists.length}
            </h3>
          </div>
        </div>

        {/* PENDENTES */}
        <div className="bg-white rounded-2xl p-6 shadow mb-10">
          <h2 className="text-2xl font-bold mb-6">
            Solicitações Pendentes
          </h2>

          <div className="space-y-4">
            {pendingPsychologists.length === 0 ? (
              <p className="text-gray-500">
                Nenhuma solicitação pendente.
              </p>
            ) : (
              pendingPsychologists.map((psychologist) => (
                <div
                  key={psychologist.id}
                  className="border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {psychologist.full_name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {psychologist.email}
                    </p>

                    <p className="text-sm text-gray-500">
                      CRP: {psychologist.crp}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        approvePsychologist(
                          psychologist.id
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Aprovar
                    </button>

                    <button
                      onClick={() =>
                        deleteUser(psychologist.id)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PACIENTES */}
        <div className="bg-white rounded-2xl p-6 shadow mb-10">
          <h2 className="text-2xl font-bold mb-6">
            Pacientes
          </h2>

          <div className="space-y-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {patient.full_name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {patient.email}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => editUser(patient)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      deleteUser(patient.id)
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PSICÓLOGOS APROVADOS */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-6">
            Psicólogos Aprovados
          </h2>

          <div className="space-y-4">
            {psychologists.map((psychologist) => (
              <div
                key={psychologist.id}
                className="border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {psychologist.full_name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {psychologist.email}
                  </p>

                  <p className="text-sm text-gray-500">
                    CRP: {psychologist.crp}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      editUser(psychologist)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      deleteUser(psychologist.id)
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}