"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function DashboardPage() {
  const [funcionarios, setFuncionarios] = useState<number | null>(null);
  const [marcacoesHoje, setMarcacoesHoje] = useState<number | null>(null);
  const [bancoHoras, setBancoHoras] = useState<number | null>(null);

  useEffect(() => {
    async function carregarDados() {
      const { count: totalFunc } = await supabase
        .from("funcionarios")
        .select("*", { count: "exact", head: true });

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

      setFuncionarios(totalFunc ?? 0);
      setMarcacoesHoje(totalMarcacoes ?? 0);
      setBancoHoras(totalBanco);
    }
    carregarDados();
  }, []);

  const cards = [
    { titulo: "Funcionários", valor: funcionarios === null ? "-" : String(funcionarios) },
    { titulo: "Marcações de hoje", valor: marcacoesHoje === null ? "-" : String(marcacoesHoje) },
    { titulo: "Banco de horas", valor: bancoHoras === null ? "-" : `${bancoHoras} min` },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.titulo} className="bg-white rounded-2xl shadow p-6">
              <p className="text-sm text-slate-500">{card.titulo}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{card.valor}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
