"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const menu: any[] = [
  { tipo: "link", nome: "Dashboard", href: "/dashboard" },
  { tipo: "link", nome: "Registrar Ponto", href: "/ponto" },
  {
    tipo: "grupo",
    nome: "Cadastros",
    itens: [
      { nome: "Funcionários", href: "/funcionarios" },
      { nome: "Empresas", href: "/empresas" },
      { nome: "Cargos", href: "/cargos" },
      { nome: "Departamentos", href: "/departamentos" },
      { nome: "Setores", href: "/setores" },
      { nome: "Horários", href: "/horarios" },
      { nome: "Horários Detalhados", href: "/horarios-detalhados" },
      { nome: "Relógios de Ponto", href: "/relogios" },
    ],
  },
  {
    tipo: "grupo",
    nome: "Ajustes",
    itens: [
      { nome: "Abono e Falta", href: "/abonos-faltas" },
      { nome: "Feriados", href: "/feriados" },
      { nome: "Férias", href: "/ferias" },
      { nome: "Motivos de Falta", href: "/motivos-falta" },
      { nome: "Motivo de Ponto Manual", href: "/motivos-ponto-manual" },
    ],
  },
  {
    tipo: "grupo",
    nome: "Jornada",
    itens: [
      { nome: "Jornadas de Trabalho", href: "/jornadas" },
      { nome: "Escalas", href: "/escalas" },
      { nome: "Banco de Horas", href: "/banco-horas" },
      { nome: "Horas Extras", href: "/horas-extras" },
      { nome: "Faltas", href: "/faltas" },
    ],
  },
  {
    tipo: "grupo",
    nome: "Relatórios",
    itens: [
      { nome: "Apuração de Ponto", href: "/relatorios/apuracao" },
      { nome: "Espelho de Ponto", href: "/relatorios/espelho" },
      { nome: "Impressão em PDF", href: "/relatorios/pdf" },
    ],
  },
  { tipo: "link", nome: "Parâmetros", href: "/parametros" },
  { tipo: "link", nome: "Uso do Aplicativo", href: "/aplicativo" },
  { tipo: "link", nome: "Ação em Massa", href: "/acoes-em-massa" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [abertos, setAbertos] = useState<string[]>(["Cadastros"]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setEmail(data.user.email);
    });
  }, []);

  // Abre automaticamente o grupo da página ativa
  useEffect(() => {
    const grupoAtivo = menu.find(
      (item) =>
        item.tipo === "grupo" &&
        item.itens.some(
          (sub: any) => pathname === sub.href || pathname.startsWith(sub.href + "/")
        )
    );
    if (grupoAtivo && !abertos.includes(grupoAtivo.nome)) {
      setAbertos((prev) => [...prev, grupoAtivo.nome]);
    }
  }, [pathname]);

  function alternarGrupo(nome: string) {
    setAbertos((prev) =>
      prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]
    );
  }

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
        {menu.map((item) => {
          if (item.tipo === "link") {
            const ativo =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-6 py-2.5 text-sm transition ${
                  ativo
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.nome}
              </Link>
            );
          }

          const aberto = abertos.includes(item.nome);
          const grupoAtivo = item.itens.some(
            (sub: any) =>
              pathname === sub.href || pathname.startsWith(sub.href + "/")
          );

          return (
            <div key={item.nome} className="mb-1">
              <button
                onClick={() => alternarGrupo(item.nome)}
                className={`w-full flex items-center justify-between px-6 py-2.5 text-sm transition ${
                  grupoAtivo
                    ? "bg-slate-800 text-white font-medium"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{item.nome}</span>
                <span
                  className={`text-xs text-slate-500 transition-transform ${
                    aberto ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
              </button>

              {aberto && (
                <ul className="ml-4 border-l border-slate-700/50">
                  {item.itens.map((sub: any) => {
                    const subAtivo =
                      pathname === sub.href ||
                      pathname.startsWith(sub.href + "/");
                    return (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          className={`block pl-6 pr-4 py-2 text-sm transition ${
                            subAtivo
                              ? "bg-blue-600 text-white font-medium"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          {sub.nome}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="text-sm">
          <p className="text-slate-300 truncate">
            {email || "Usuário logado"}
          </p>
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
