"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type Empresa = {
  id: string;
  nome: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  cpf: string | null;
  inscricao_estadual: string | null;
  endereco: string | null;
  cep: string | null;
  codigo: string | null;
  nome_responsavel: string | null;
  cpf_responsavel: string | null;
  email_contato: string | null;
  email_login: string | null;
};

const vazio = {
  nome: "",
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  cpf: "",
  inscricao_estadual: "",
  endereco: "",
  cep: "",
  codigo: "",
  nome_responsavel: "",
  cpf_responsavel: "",
  email_contato: "",
};

export default function EmpresasPage() {
  const [admin, setAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

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

    let data: Empresa[] | null = null;
    if (ehAdmin) {
      const res = await supabase.from("empresas").select("*").order("nome");
      data = res.data;
    } else {
      const res = await supabase.from("empresas").select("*").eq("email_login", email);
      data = res.data;
    }
    setEmpresas(data ?? []);
    setCarregando(false);
  }

  function abrirEdicao(emp: Empresa) {
    setEditando(emp);
    setForm({
      nome: emp.nome ?? "",
      razao_social: emp.razao_social ?? "",
      nome_fantasia: emp.nome_fantasia ?? "",
      cnpj: emp.cnpj ?? "",
      cpf: emp.cpf ?? "",
      inscricao_estadual: emp.inscricao_estadual ?? "",
      endereco: emp.endereco ?? "",
      cep: emp.cep ?? "",
      codigo: emp.codigo ?? "",
      nome_responsavel: emp.nome_responsavel ?? "",
      cpf_responsavel: emp.cpf_responsavel ?? "",
      email_contato: emp.email_contato ?? "",
    });
    setMensagem(null);
    setModalAberto(true);
  }

  async function buscarCep(cep: string) {
    const soNumeros = cep.replace(/\D/g, "");
    if (soNumeros.length !== 8) return;

    setMensagem(null);
    const resposta = await fetch(`https://viacep.com.br/ws/${soNumeros}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      setMensagem({ tipo: "erro", texto: "CEP não encontrado. Preencha o endereço manualmente." });
      return;
    }

    const enderecoCompleto = `${dados.logradouro}, ${dados.bairro}, ${dados.localidade}/${dados.uf}`;
    atualizar("endereco", enderecoCompleto);
    setMensagem({ tipo: "sucesso", texto: "Endereço preenchido pelo CEP. Confira e adicione o número." });
  }

  function atualizar(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setSalvando(true);
    setMensagem(null);

    const { error } = await supabase
      .from("empresas")
      .update({
        nome: form.nome,
        razao_social: form.razao_social || null,
        nome_fantasia: form.nome_fantasia || null,
        cnpj: form.cnpj.replace(/\D/g, "") || null,
        cpf: form.cpf.replace(/\D/g, "") || null,
        inscricao_estadual: form.inscricao_estadual || null,
        endereco: form.endereco || null,
        cep: form.cep.replace(/\D/g, "") || null,
        codigo: form.codigo || null,
        nome_responsavel: form.nome_responsavel || null,
        cpf_responsavel: form.cpf_responsavel.replace(/\D/g, "") || null,
        email_contato: form.email_contato || null,
      })
      .eq("id", editando.id);

    setSalvando(false);

    if (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao salvar: " + error.message });
      return;
    }

    setMensagem({ tipo: "sucesso", texto: "Empresa atualizada com sucesso!" });
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
          {admin && (
            <a
              href="/admin/clientes"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 transition"
            >
              Cadastrar Nova Empresa
            </a>
          )}
        </div>

        {mensagem && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
            mensagem.tipo === "sucesso"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {mensagem.texto}
          </div>
        )}

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
                  {admin && <th className="text-left px-4 py-3">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {empresas.map((emp) => (
                  <tr key={emp.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{emp.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.cnpj || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.nome_responsavel || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{emp.email_contato || "-"}</td>
                    {admin && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => abrirEdicao(emp)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalAberto && editando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={salvar}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Editar Empresa</h2>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campo("Nome da empresa", "nome", "Nome da empresa")}
                {campo("Razão social", "razao_social", "Razão social")}
                {campo("Nome fantasia", "nome_fantasia", "Nome fantasia")}
                {campo("CNPJ", "cnpj", "00.000.000/0000-00")}
                {campo("CPF", "cpf", "000.000.000-00")}
                {campo("Código", "codigo", "Código da empresa")}
                {campo("Inscrição estadual", "inscricao_estadual", "Inscrição estadual")}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">CEP</label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => atualizar("cep", e.target.value)}
                    onBlur={(e) => buscarCep(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Digite o CEP e saia do campo para preencher o endereço automaticamente.
                  </p>
                </div>
                <div className="md:col-span-2">
                  {campo("Endereço", "endereco", "Rua, número, bairro, cidade, UF")}
                </div>
                {campo("Nome do responsável", "nome_responsavel", "Nome do responsável")}
                {campo("CPF do responsável", "cpf_responsavel", "000.000.000-00")}
                <div className="md:col-span-2">
                  {campo("E-mail de contato", "email_contato", "contato@empresa.com.br")}
                </div>
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition"
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
