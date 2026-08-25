"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type Cliente = {
  id: string;
  nome: string;
  cnpj: string | null;
  inscricao_estadual: string | null;
  nome_responsavel: string | null;
  email_contato: string | null;
  email_login: string | null;
  ativo: boolean;
  criado_em: string;
};

const vazio = {
  nome: "",
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  inscricao_estadual: "",
  endereco: "",
  cep: "",
  nome_responsavel: "",
  cpf_responsavel: "",
  email_contato: "",
  email_login: "",
  senha: "",
};

export default function AdminClientesPage() {
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState(vazio);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email ?? "";

    const { data: adm } = await supabase
      .from("administradores")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    setAdmin(!!adm);

    if (adm) {
      const { data: lista } = await supabase
        .from("empresas")
        .select("id, nome, cnpj, inscricao_estadual, nome_responsavel, email_contato, email_login, ativo, criado_em")
        .order("nome");
      setClientes(lista ?? []);
    }
  }

  async function alternarStatus(cliente: Cliente) {
    const novoStatus = !cliente.ativo;
    const { error } = await supabase
      .from("empresas")
      .update({ ativo: novoStatus })
      .eq("id", cliente.id);

    if (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao atualizar: " + error.message });
      return;
    }

    setMensagem({
      tipo: "sucesso",
      texto: novoStatus
        ? "Acesso liberado para " + cliente.nome + "."
        : "Acesso bloqueado para " + cliente.nome + ".",
    });
    carregar();
  }  function atualizar(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function abrirModal() {  async function buscarCep(cep: string) {
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
    setForm(vazio);
    setMensagem(null);
    setModalAberto(true);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    const emailLogin = form.email_login.trim().toLowerCase();

    const { data: { session } } = await supabase.auth.getSession();

    const resposta = await fetch("/api/criar-cliente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + (session?.access_token ?? ""),
      },
      body: JSON.stringify({
        email: emailLogin,
        senha: form.senha,
        nome: form.nome,
        razao_social: form.razao_social,
        nome_fantasia: form.nome_fantasia,
        cnpj: form.cnpj.replace(/\D/g, ""),
        inscricao_estadual: form.inscricao_estadual,
        endereco: form.endereco,
        cep: form.cep.replace(/\D/g, ""),
        nome_responsavel: form.nome_responsavel,
        cpf_responsavel: form.cpf_responsavel.replace(/\D/g, ""),
        email_contato: form.email_contato,
      }),
    });

    const resultado = await resposta.json();
    setCarregando(false);

    if (!resposta.ok || !resultado.ok) {
      setMensagem({ tipo: "erro", texto: resultado.erro || "Erro ao criar cliente." });
      return;
    }

    setMensagem({ tipo: "sucesso", texto: "Cliente criado! Login: " + emailLogin });
    setModalAberto(false);
    setForm(vazio);
    carregar();
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

  if (admin === null) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8">Carregando...</main>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
            Acesso restrito ao suporte Solutec.
          </div>
        </main>
      </div>
    );
  }  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Clientes (Solutec)</h1>
            <p className="text-sm text-slate-500">Cadastre a empresa e crie o acesso do cliente</p>
          </div>
          <button
            onClick={abrirModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 transition"
          >
            + Cadastrar Cliente
          </button>
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

        {clientes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
            Nenhum cliente cadastrado ainda.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Empresa</th>
                  <th className="text-left px-4 py-3">CNPJ</th>
                  <th className="text-left px-4 py-3">Responsável</th>
                  <th className="text-left px-4 py-3">Login</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{c.cnpj || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{c.nome_responsavel || "-"}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{c.email_login || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        c.ativo
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}>
                        {c.ativo ? "Ativo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => alternarStatus(c)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          c.ativo
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {c.ativo ? "Bloquear" : "Desbloquear"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalAberto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <form onSubmit={salvar} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Cadastrar Cliente</h2>
                <button type="button" onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campo("Nome da empresa", "nome", "Nome da empresa")}
                {campo("Razão social", "razao_social", "Razão social")}
                {campo("Nome fantasia", "nome_fantasia", "Nome fantasia")}
                {campo("CNPJ", "cnpj", "00.000.000/0000-00")}
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
                {campo("Nome do responsável", "nome_responsavel", "Nome do colaborador responsável")}
                {campo("CPF do responsável", "cpf_responsavel", "000.000.000-00")}
                {campo("E-mail de contato", "email_contato", "contato@empresa.com.br")}
                <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Acesso do cliente à plataforma</p>
                </div>
                {campo("Login (e-mail de acesso)", "email_login", "acesso@empresa.com.br")}
                {campo("Senha", "senha", "Senha inicial")}
              </div>

              <button type="submit" disabled={carregando} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition">
                {carregando ? "Criando..." : "Criar Cliente e Acesso"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
