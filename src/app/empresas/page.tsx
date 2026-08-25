"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type Empresa = {
  id: string;
  nome: string;
  cnpj: string | null;
  inscricao_estadual: string | null;
  nome_responsavel: string | null;
  email_contato: string | null;
  endereco: string | null;
};

export default function EmpresasPage() {
  const [admin, setAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    setCarregando(true);
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email ?? "";

    const { data: adm } = await supabase
      .from("administradores")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    const ehAdmin = !!adm;
    setAdmin(ehAdmin);

    if (ehAdmin) {
      const { data } = await supabase.from("empresas").select("*").order("nome");
      setEmpresas(data ?? []);
    } else {
      const { data } = await supabase
        .from("empresas")
        .select("*")
        .eq("email_login", email);
      setEmpresas(data ?? []);
    }
    setCarregando(false);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Empresas</h1>
          {admin && (
            <a
              href="/admin/clientes"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 transition"
            >
              Cadastrar Nova Empresa
            </a>
          )}
        </div>

        {carregando ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">Carregando...</div>
        ) : empresas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
            {admin
              ? "Nenhuma empresa cadastrada ainda."
              : "Sua empresa ainda não foi configurada. Entre em contato com o suporte Solutec."}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3">CNPJ</th>
                  <th className="text-left px-4 py-3">Responsável</th>
                  <th className="text-left px-4 py-3">Contato</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((emp) => (
                  <tr key={emp.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{emp.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.cnpj || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.nome_responsavel || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.email_contato || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
