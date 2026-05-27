import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function RegisterPsychologist() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    crp: "",
    university: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (formData.password !== formData.confirmPassword) {
        alert("As senhas não coincidem");
        return;
      }

      // Criar usuário no auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      if (!data.user) {
        alert("Erro ao criar usuário");
        return;
      }

      // Criar perfil do psicólogo
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: formData.fullName,
          email: formData.email,

          // ROLE DO USUÁRIO
          role: "psychologist",

          // STATUS DE APROVAÇÃO
          status: "pending",

          approved: false,

          // DADOS BÁSICOS
          crp: formData.crp,
          university: formData.university,
        });

      if (profileError) {
        console.error(profileError);
        alert("Erro ao salvar perfil.");
        return;
      }

      alert(
        "Cadastro realizado com sucesso! Aguarde aprovação do administrador."
      );

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Erro inesperado.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          Cadastro de Psicólogo
        </h1>

        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Nome Completo"
            value={formData.fullName}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            name="crp"
            placeholder="CRP"
            value={formData.crp}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            name="university"
            placeholder="Universidade"
            value={formData.university}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar Senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-lg font-semibold"
          >
            Cadastrar Psicólogo
          </button>
        </div>
      </form>
    </div>
  );
}