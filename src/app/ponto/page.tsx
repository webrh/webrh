"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function PontoPage() {
  const [funcionarioId, setFuncionarioId] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [marcacoesHoje, setMarcacoesHoje] = useState<any[]>([]);

  useEffect(() => {
    carregarFuncionario();
  }, []);

  async function carregarFuncionario() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { data: func } = await supabase
      .from("funcionarios")
      .select("id, empresa_id")
      .eq("email", user.email)
      .single();

    if (func) {
      setFuncionarioId(func.id);
      setEmpresaId(func.empresa_id);
      carregarMarcacoes(func.id);
    }
  }

  async function carregarMarcacoes(funcId: string) {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("marcacoes")
      .select("tipo, marcado_em")
      .eq("funcionario_id", funcId)
      .gte("marcado_em", inicio.toISOString())
      .order("marcado_em", { ascending: true });

    setMarcacoesHoje(data ?? []);
  }

  async function registrarPonto() {
    if (!funcionarioId || !empresaId) {
      setMensagem({ tipo: "erro", texto: "Funcionário não encontrado. Verifique o e-mail cadastrado." });
      return;
    }

    setCarregando(true);
    setMensagem(null);

    const ultima = marcacoesHoje[marcacoesHoje.length - 1];
    const tipo = !ultima || ultima.tipo === "saida" ? "entrada" : "saida";

    const { error } = await supabase.from("marcacoes").insert({
      funcionario_id: funcionarioId,
      empresa_id: empresaId,
      tipo,
      metodo: "web",
    });

    setCarregando(false);

    if (error) {
      setMensagem({ tipo: "erro", texto: "Não foi possível registrar. Tente novamente." });
      return;
    }

    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setMensagem({ tipo: "sucesso", texto: `Marcação de ${tipo} confirmada às ${hora}!` });
    carregarMarcacoes(funcionarioId);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Registrar Ponto</h1>

        {mensagem && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
            mensagem.tipo === "sucesso"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {mensagem.texto}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-8 max-w-md">
          <p className="text-sm text-slate-500 mb-4">Clique no botão para registrar seu ponto</p>
          <button
            onClick={registrarPonto}
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-4 text-lg transition"
          >
            {carregando ? "Registrando..." : "Bater Ponto"}
          </button>
        </div>

        {marcacoesHoje.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow p-6 max-w-md">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Marcações de hoje</h2>
            <ul className="space-y-2">
              {marcacoesHoje.map((m, i) => (
                <li key={i} className="flex justify-between text-sm text-slate-600 border-b border-slate-100 pb-2">
                  <span className="capitalize">{m.tipo}</span>
                  <span>
                    {new Date(m.marcado_em).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
