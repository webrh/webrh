"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const menu = [
  {
    secao: "Principal",
    itens: [
      { nome: "Dashboard", href: "/dashboard" },
      { nome: "Registrar Ponto", href: "/ponto" },
    ],
  },
  {
    secao: "Cadastros",
    itens: [
      { nome: "Funcionários", href: "/funcionarios" },
      { nome: "Empresas", href: "/empresas" },
      { nome: "Cargos", href: "/cargos" },
      { nome: "Departamentos", href: "/departamentos" },
      { nome: "Setores", href: "/setores" },
      { nome: "Horários", href: "/horarios" },
      { nome: "Horários Detalhados", href: "/horarios-detalhados" },
      { nome: "Exame Periódico", href: "/exames-periodicos" },
      { nome: "Abono e Falta", href: "/abonos-faltas" },
      { nome: "Feriados", href: "/feriados" },
      { nome: "Férias", href: "/ferias" },
      { nome: "Motivo de Falta", href: "/motivos-falta" },
      { nome: "Motivo de Ponto Manual", href: "/motivos-ponto-manual" },
      { nome: "Parâmetros", href: "/parametros" },
      { nome: "Uso de Aplicativo", href: "/aplicativo" },
    ],
  },
  {
    secao: "Jornada",
    itens: [
      { nome: "Jornadas de Trabalho", href: "/jornadas" },
      { nome: "Escalas", href: "/escalas" },
      { nome: "Banco de Horas", href: "/banco-horas" },
      { nome: "Horas Extras", href: "/horas-extras" },
      { nome: "Faltas", href: "/faltas" },
    ],
  },
  {
    secao: "Relatórios",
    itens: [
      { nome: "Apuração de Ponto", href: "/relatorios/apuracao" },
      { nome: "Espelho de Ponto", href: "/relatorios/espelho" },
      { nome: "Impressão em PDF", href: "/relatorios/pdf" },
    ],
  },
  {
    secao: "Ações",
    itens: [{ nome: "Ação em Massa", href: "/acoes-em-massa" }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email);
    });
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">WebRH</h1>
        <p className="text-xs text-slate-400">Gestão de Ponto Eletrônico</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menu.map((grupo) => (
          <div key={grupo.secao} className="mb-5">
            <p className="px-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {grupo.secao}
            </p>
            <ul className="space-y-1">
              {grupo.itens.map((item) => {
                const ativo =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-6 py-2 text-sm transition ${
                        ativo
                          ? "bg-blue-600 text-white font-medium"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {item.nome}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="text-sm">
          <p className="text-slate-300 truncate">{email || "Usuário logado"}</p>
          <p className="text-xs text-slate-500">Solutec</p>
        </div>
        <button
          onClick={sair}
          className="w-full bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white text-sm font-medium rounded-lg py-2.5 transition"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
