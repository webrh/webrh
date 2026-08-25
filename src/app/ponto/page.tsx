"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type Funcionario = { id: string; empresa_id: string; nome: string; cpf: string };
type Marcacao = { tipo: string; marcado_em: string };

export default function PontoPage() {
  const [cpf, setCpf] = useState("");
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [marcacoesHoje, setMarcacoesHoje] = useState<Marcacao[]>([]);

  async function buscarFuncionario() {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setMensagem({ tipo: "erro", texto: "Digite um CPF válido (11 dígitos)." });
      return;
    }

    setMensagem(null);
    setFuncionario(null);
    setMarcacoesHoje([]);

    const { data, error } = await supabase
      .from("funcionarios")
      .select("id, empresa_id, nome, cpf")
      .eq("cpf", cpfLimpo)
      .maybeSingle();

    if (error || !data) {
      setMensagem({ tipo: "erro", texto: "Funcionário não encontrado. Confira o CPF." });
      return;
    }

    setFuncionario(data);
    setMensagem({ tipo: "sucesso", texto: `Funcionário identificado: ${data.nome}` });
    carregarMarcacoes(data.id);
  }

  async function carregarMarcacoes(funcionarioId: string) {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("marcacoes")
      .select("tipo, marcado_em")
      .eq("funcionario_id", funcionarioId)
      .gte("marcado_em", inicio.toISOString())
      .order("marcado_em", { ascending: true });

    setMarcacoesHoje(data ?? []);
  }

  async function registrarPonto() {
    if (!funcionario) return;

    setCarregando(true);
    setMensagem(null);

    const ultima = marcacoesHoje[marcacoesHoje.length - 1];
    const tipo = !ultima || ultima.tipo === "saida" ? "entrada" : "saida";

    const { error } = await supabase.from("marcacoes").insert({
      funcionario_id: funcionario.id,
      empresa_id: funcionario.empresa_id,
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
    setMensagem({ tipo: "sucesso", texto: `Marcação de ${tipo} confirmada para ${funcionario.nome} às ${hora}!` });
    carregarMarcacoes(funcionario.id);
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

        <div className="bg-white rounded-2xl shadow p-6 max-w-md mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            CPF do funcionário
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-lg tracking-wide"
            />
            <button
              onClick={buscarFuncionario}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl px-5 transition"
            >
              Identificar
            </button>
          </div>
        </div>

        {funcionario && (
          <div className="bg-white rounded-2xl shadow p-8 max-w-md">
            <p className="text-sm text-slate-500 mb-1">Funcionário</p>
            <p className="text-xl font-bold text-slate-800 mb-4">{funcionario.nome}</p>
            <button
              onClick={registrarPonto}
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-4 text-lg transition"
            >
              {carregando ? "Registrando..." : "Bater Ponto"}
            </button>
          </div>
        )}

        {marcacoesHoje.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow p-6 max-w-md">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Marcações de hoje</h2>
            <ul className="space-y-2">
              {marcacoesHoje.map((m, i) => (
                <li key={i} className="flex justify-between text-sm text-slate-600 border-b border-slate-100 pb-2">
                  <span className="capitalize">{m.tipo}</span>
                  <span>
                    {new Date(m.marcado_em).toLocaleTimeString("pt-BR", {
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
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
