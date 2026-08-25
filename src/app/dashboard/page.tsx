"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

const BATIDAS_MINIMAS = 4; // entrada, saída almoço, retorno almoço, saída expediente

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
    async function carregarDados() {
      // Total de funcionários ativos
      const { count: totalFunc } = await supabase
        .from("funcionarios")
        .select("*", { count: "exact", head: true })
        .eq("ativo", true);

      // Marcações de hoje
      const
