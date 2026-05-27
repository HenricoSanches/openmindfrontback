import { useState } from "react";
import { Header } from "./Header";
import { Brain, Mail, Lock } from "lucide-react";
import type { Page } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LoginProps {
  onNavigate: (page: Page) => void;
  onLoggedIn: () => void;
}

export function Login({ onNavigate, onLoggedIn }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos" : error.message);
      return;
    }
    toast.success("Bem-vindo de volta!");
    onLoggedIn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-700 dark:to-pink-900 transition-colors duration-300">
      <Header onNavigate={onNavigate} showAuthButtons={false} />

      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-2xl p-8 transition-colors duration-300">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Brain className="w-16 h-16 text-pink-600 dark:text-pink-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">OpenMind</h2>
            <p className="text-gray-600 dark:text-gray-400">Entre na sua conta</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 dark:text-gray-300">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-gray-700 dark:text-gray-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pink-600 dark:bg-pink-700 text-white rounded-xl hover:bg-pink-700 dark:hover:bg-pink-800 transition-colors mb-4 disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Não tem uma conta?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate("register-patient")}
                  className="flex-1 py-2 px-4 border-2 border-pink-600 dark:border-pink-700 text-pink-600 dark:text-pink-500 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors text-sm font-medium"
                >
                  Como Paciente
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("register-psychologist")}
                  className="flex-1 py-2 px-4 border-2 border-pink-600 dark:border-pink-700 text-pink-600 dark:text-pink-500 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors text-sm font-medium"
                >
                  Como Psicólogo
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <button onClick={() => onNavigate("home")} className="text-pink-600 dark:text-pink-500 hover:underline">
              ← Voltar para o início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
