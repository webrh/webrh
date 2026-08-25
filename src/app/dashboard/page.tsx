"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

const BATIDAS_MINIMAS = 4;

type Pendencia = { id: string; nome: string; batidas: number; status: string };

function formatarData(d: Date) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function calcularDiasUteis(inicio: Date, fim: Date) {
  let dias = 0;
  const atual = new Date(inicio);
  while (atual <= fim) {
    const diaSemana = atual.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) dias++;
    atual.setDate(atual.getDate() + 1);
  }
  return dias;
}

export default function DashboardPage() {
  const [funcionarios, setFuncionarios] = useState<number | null>(null);
  const [marcacoesHoje, setMarcacoesHoje] = useState<number | null>(null);
  const [bancoHoras, setBancoHoras] = useState<number | null>(null);
  const [absenteismo, setAbsenteismo] = useState<number | null>(null);
  const [turnover, setTurnover] = useState<number | null>(null);
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);

  useEffect(() => {
    async function carregarDados() {      const { count: totalFunc } = await supabase
        .from("funcionarios")
        .select("*", { count: "exact", head: true })
        .eq("ativo", true);

      const inicioHoje = new Date();
      inicioHoje.setHours(0, 0, 0, 0);
      const { count: totalMarcacoes } = await supabase
        .from("marcacoes")
        .select("*", { count: "exact", head: true })
        .gte("marcado_em", inicioHoje.toISOString());

      const { data: banco } = await supabase
        .from("banco_horas")
        .select("saldo_minutos");
      const totalBanco = (banco ?? []).reduce(
        (soma, item) => soma + (item.saldo_minutos ?? 0),
        0
      );

      const agora = new Date();
      const mesInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const mesFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

      const { count: faltasMes } = await supabase
        .from("faltas")
        .select("*", { count: "exact", head: true })
        .gte("data", formatarData(mesInicio))
        .lte("data", formatarData(mesFim));

      const totalValido = totalFunc ?? 0;
      const diasUteis = calcularDiasUteis(mesInicio, agora);
      const indiceAbsenteismo =
        totalValido > 0 && diasUteis > 0
          ? ((faltasMes ?? 0) / (totalValido * diasUteis)) * 100
          : 0;

      const { count: admissaoMes } = await supabase
        .from("funcionarios")
        .select("*", { count: "exact", head: true })
        .gte("data_admissao", formatarData(mesInicio))
        .lte("data_admissao", formatarData(mesFim));

      const { count: demissaoMes } = await supabase
        .from("funcionarios")
        .select("*", { count: "exact", head: true })
        .gte("data_demissao", formatarData(mesInicio))
        .lte("data_demissao", formatarData(mesFim));

      const txTurnover =
        totalValido > 0
          ? (((admissaoMes ?? 0) + (demissaoMes ?? 0)) / 2 / totalValido) * 100
          : 0;

      const { data: funcs } = await supabase
        .from("funcionarios")
        .select("id, nome")
        .eq("ativo", true);

      const ids = (funcs ?? []).map((f) => f.id);

      let marcacoesPorFunc: Record<string, number> = {};
      if (ids.length > 0) {
        const { data: marcacoes } = await supabase
          .from("marcacoes")
          .select("funcionario_id")
          .in("funcionario_id", ids)
          .gte("marcado_em", inicioHoje.toISOString());

        marcacoesPorFunc = (marcacoes ?? []).reduce((acc, m) => {
          acc[m.funcionario_id] = (acc[m.funcionario_id] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }

      const pend = (funcs ?? [])
        .map((f) => {
          const batidas = marcacoesPorFunc[f.id] ?? 0;
          if (batidas >= BATIDAS_MINIMAS) return null;
          return {
            id: f.id,
            nome: f.nome,
            batidas,
            status:
              batidas === 0
                ? "Não bateu nenhum ponto"
                : `Faltam ${BATIDAS_MINIMAS - batidas} batida(s)`,
          };
        })
        .filter((p): p is Pendencia => p !== null);

      setFuncionarios(totalValido);
      setMarcacoesHoje(totalMarcacoes ?? 0);
      setBancoHoras(totalBanco);
      setAbsenteismo(Number(indiceAbsenteismo.toFixed(1)));
      setTurnover(Number(txTurnover.toFixed(1)));
      setPendencias(pend);
    }

    carregarDados();
  }, []);  const cards = [
    { titulo: "Funcionários", valor: funcionarios === null ? "-" : String(funcionarios) },
    { titulo: "Marcações de hoje", valor: marcacoesHoje === null ? "-" : String(marcacoesHoje) },
    { titulo: "Banco de horas", valor: bancoHoras === null ? "-" : `${bancoHoras} min` },
    { titulo: "Índice de absenteísmo", valor: absenteismo === null ? "-" : `${absenteismo}%` },
    { titulo: "Turnover", valor: turnover === null ? "-" : `${turnover}%` },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.titulo} className="bg-white rounded-2xl shadow p-6">
              <p className="text-sm text-slate-500">{card.titulo}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{card.valor}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Funcionários com pendências de ponto hoje
          </h2>

          {pendencias.length === 0 ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              ✅ Todos os funcionários completaram as {BATIDAS_MINIMAS} batidas de hoje.
            </p>
          ) : (
            <ul className="space-y-3">
              {pendencias.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <span className="font-medium text-slate-800">{p.nome}</span>
                  <span
                    className={`text-sm rounded-full px-3 py-1 font-medium ${
                      p.batidas === 0
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
