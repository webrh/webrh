"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type Empresa = {
  id: string;
  nome: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  cpf: string | null;
  endereco: string | null;
  codigo: string | null;
  inscricao_estadual: string | null;
};

const vazio = {
  nome: "",
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  cpf: "",
  endereco: "",
  codigo: "",
  inscricao_estadual: "",
};

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(vazio);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    const { data } = await supabase.from("empresas").select("*").order("nome");
    setEmpresas(data ?? []);
  }

  function atualizar(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function abrirModal() {
    setForm(vazio);
    setMensagem(null);
    setModalAberto(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    const { error } = await supabase.from("empresas").insert({
      nome: form.nome,
      razao_social: form.razao_social || null,
      nome_fantasia: form.nome_fantasia || null,
      cnpj: form.cnpj.replace(/\D/g, "") || null,
      cpf: form.cpf.replace(/\D/g, "") || null,
      endereco: form.endereco || null,
      codigo: form.codigo || null,
      inscricao_estadual: form.inscricao_estadual || null,
    });

    setCarregando(false);

    if (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao salvar: " + error.message });
      return;
    }

    setMensagem({ tipo: "sucesso", texto: "Empresa cadastrada com sucesso!" });
    setModalAberto(false);
    carregarEmpresas();
  }

  const campo = (label: string, chave: string, placeholder = "", tipo = "text") => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={tipo}
        placeholder={placeholder}
        value={form[chave as keyof typeof form]}
        onChange={(e) => atualizar(chave, e.target.value)}
        className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Empresas</h1>
          <button
            onClick={abrirModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 transition"
          >
            + Cadastrar Nova Empresa
          </button>
        </div>

        {empresas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
            Nenhuma empresa cadastrada ainda. Clique em "Cadastrar Nova Empresa" para começar.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3">CNPJ / CPF</th>
                  <th className="text-left px-4 py-3">Cidade / Endereço</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((emp) => (
                  <tr key={emp.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{emp.nome}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {emp.cnpj || emp.cpf || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{emp.endereco || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalAberto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={salvar}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Cadastrar Nova Empresa</h2>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {mensagem && (
                <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                  mensagem.tipo === "sucesso"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {mensagem.texto}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campo("Nome da empresa", "nome", "Nome da empresa")}
                {campo("Razão social", "razao_social", "Razão social")}
                {campo("Nome fantasia", "nome_fantasia", "Nome fantasia")}
                {campo("CNPJ", "cnpj", "00.000.000/0000-00")}
                {campo("CPF", "cpf", "000.000.000-00")}
                {campo("Código", "codigo", "Código da empresa")}
                {campo("Inscrição estadual", "inscricao_estadual", "Inscrição estadual")}
                <div className="md:col-span-2">
                  {campo("Endereço", "endereco", "Rua, número, bairro, cidade, UF")}
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition"
              >
                {carregando ? "Salvando..." : "Salvar Empresa"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
