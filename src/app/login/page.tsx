"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={entrar}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
          WebRH
        </h1>

        {erro && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            {erro}
          </div>
        )}

        <label className="block text-sm font-medium text-slate-600 mb-1">
          E-mail
        </label>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-3 outline-none focus:border-blue-500"
          required
        />

        <label className="block text-sm font-medium text-slate-600 mb-1">
          Senha
        </label>
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-3 outline-none focus:border-blue-500"
          required
        />

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center mt-4 text-sm text-slate-400">
        <a href="/admin/login" className="hover:text-slate-600 underline">
          Acesso do suporte Solutec
        </a>
      </p>
    </main>
  );
}
