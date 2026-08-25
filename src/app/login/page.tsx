"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [supEmail, setSupEmail] = useState("");
  const [supSenha, setSupSenha] = useState("");
  const [supErro, setSupErro] = useState("");
  const [supCarregando, setSupCarregando] = useState(false);

  async function entrarCliente(e: FormEvent) {
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

  async function entrarSuporte(e: FormEvent) {
    e.preventDefault();
    setSupCarregando(true);
    setSupErro("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: supEmail,
      password: supSenha,
    });

    if (error || !data.user?.email) {
      setSupErro("E-mail ou senha incorretos.");
      setSupCarregando(false);
      return;
    }

    const { data: adm } = await supabase
      .from("administradores")
      .select("id")
      .eq("email", data.user.email)
      .maybeSingle();

    if (!adm) {
      await supabase.auth.signOut();
      setSupErro("Acesso restrito ao suporte Solutec.");
      setSupCarregando(false);
      return;
    }

    router.push("/admin/clientes");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative">      <form
        onSubmit={entrarCliente}
        autoComplete="off"
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
          autoComplete="off"
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
          autoComplete="new-password"
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
      </form>      <form
        onSubmit={entrarSuporte}
        autoComplete="off"
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xs fixed bottom-4 right-4"
      >
        <h2 className="text-sm font-bold text-slate-800 mb-3">
          Acesso do Suporte Solutec
        </h2>

        {supErro && (
          <div className="mb-3 rounded-xl px-3 py-2 text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            {supErro}
          </div>
        )}

        <label className="block text-xs font-medium text-slate-600 mb-1">
          E-mail
        </label>
        <input
          type="email"
          placeholder="E-mail"
          value={supEmail}
          onChange={(e) => setSupEmail(e.target.value)}
          autoComplete="off"
          className="w-full border rounded-lg px-3 py-2 mb-2 outline-none focus:border-blue-500 text-sm"
          required
        />

        <label className="block text-xs font-medium text-slate-600 mb-1">
          Senha
        </label>
        <input
          type="password"
          placeholder="Senha"
          value={supSenha}
          onChange={(e) => setSupSenha(e.target.value)}
          autoComplete="new-password"
          className="w-full border rounded-lg px-3 py-2 mb-3 outline-none focus:border-blue-500 text-sm"
          required
        />

        <button
          type="submit"
          disabled={supCarregando}
          className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition"
        >
          {supCarregando ? "Entrando..." : "Acessar Painel"}
        </button>
      </form>
    </main>
  );
}
