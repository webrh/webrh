"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !data.user?.email) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    const { data: adm } = await supabase
      .from("administradores")
      .select("id")
      .eq("email", data.user.email)
      .maybeSingle();

    if (!adm) {
      await supabase.auth.signOut();
      setErro("Acesso restrito ao suporte Solutec.");
      setCarregando(false);
      return;
    }

    router.push("/admin/clientes");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={entrar} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-1 text-slate-800">WebRH</h1>
        <p className="text-center text-sm text-slate-500 mb-6">Painel do Suporte Solutec</p>

        {erro && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            {erro}
          </div>
        )}

        <label className="block text-sm font-medium text-slate-600 mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-3 outline-none focus:border-blue-500"
          placeholder="suporte@solutec.com.br"
          required
        />

        <label className="block text-sm font-medium text-slate-600 mb-1">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-6 outline-none focus:border-blue-500"
          placeholder="Senha do suporte"
          required
        />

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition"
        >
          {carregando ? "Entrando..." : "Acessar Painel"}
        </button>
      </form>
    </main>
  );
}
