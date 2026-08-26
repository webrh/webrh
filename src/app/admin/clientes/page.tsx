"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Itens do menu lateral — ajuste as rotas para as do seu projeto
const MENU = [
  { nome: "Empresas", rota: "/admin" },
  { nome: "Funcionários", rota: "/admin/funcionarios" },
  { nome: "Cargos", rota: "/admin/cargos" },
  { nome: "Horas", rota: "/admin/horas" },
];

export default function CadastrarEmpresa() {
  const router = useRouter();
  const pathname = usePathname();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  // Dados do formulário
  const [form, setForm] = useState({
    nome: "",
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    cpf: "",
    codigo: "",
    inscricao_estadual: "",
    cep: "",
    endereco: "",
    responsavel: "",
    cpf_responsavel: "",
    email_contato: "",
  });

  // Atualiza um campo do formulário
  function atualizarCampo(campo: string, valor: string) {
    setForm({ ...form, [campo]: valor });
  }

  // Busca o endereço pelo CEP (ViaCEP)
  async function buscarCep() {
    const cepLimpo = form.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        setErro("CEP não encontrado.");
        return;
      }

      const endereco = `${dados.logradouro}, ${dados.bairro}, ${dados.localidade}/${dados.uf}`;
      atualizarCampo("endereco", endereco);
      setErro("");
    } catch {
      setErro("Não foi possível buscar o CEP. Tente novamente.");
    }
  }

  // Limpa pontuação de CNPJ, CPF e CEP (guarda só números)
  function limparDados() {
    return {
      ...form,
      cnpj: form.cnpj.replace(/[^\d]/g, ""),
      cpf: form.cpf.replace(/[^\d]/g, ""),
      cep: form.cep.replace(/\D/g, ""),
    };
  }

  // Salva a nova empresa no banco
  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nome.trim()) {
      setErro("O campo Nome é obrigatório.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const dadosLimpos = limparDados();
      const { error } = await supabase.from("empresas").insert([dadosLimpos]);

      if (error) {
        setErro(error.message);
        setCarregando(false);
        return;
      }

      setSucesso(true);
      setCarregando(false);
    } catch (e: any) {
      setErro(e.message || "Erro ao salvar a empresa.");
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Barra lateral */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold">Gestão de Ponto</h1>
          <p className="text-xs text-gray-400">Painel Administrativo</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {MENU.map((item) => {
            const ativo = pathname === item.rota;
            return (
              <Link
                key={item.rota}
                href={item.rota}
                className={`block px-4 py-2 rounded text-sm transition ${
                  ativo
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                {item.nome}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6">
        {sucesso ? (
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-lg shadow text-center">
            <h2 className="text-2xl font-bold mb-4">
              Empresa cadastrada com sucesso!
            </h2>
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Voltar para Empresas
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-2">Cadastrar Nova Empresa</h1>
            <p className="text-gray-600 mb-6">
              Preencha os dados da empresa abaixo.
            </p>

            {erro && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {erro}
              </div>
            )}

            <form onSubmit={salvar} className="grid grid-cols-1 gap-4">
              <Campo
                label="Nome *"
                valor={form.nome}
                aoMudar={(v) => atualizarCampo("nome", v)}
                obrigatorio
              />
              <Campo
                label="Razão Social"
                valor={form.razao_social}
                aoMudar={(v) => atualizarCampo("razao_social", v)}
              />
              <Campo
                label="Nome Fantasia"
                valor={form.nome_fantasia}
                aoMudar={(v) => atualizarCampo("nome_fantasia", v)}
              />
              <Campo
                label="CNPJ"
                valor={form.cnpj}
                aoMudar={(v) => atualizarCampo("cnpj", v)}
              />
              <Campo
                label="CPF"
                valor={form.cpf}
                aoMudar={(v) => atualizarCampo("cpf", v)}
              />
              <Campo
                label="Código"
                valor={form.codigo}
                aoMudar={(v) => atualizarCampo("codigo", v)}
              />
              <Campo
                label="Inscrição Estadual"
                valor={form.inscricao_estadual}
                aoMudar={(v) => atualizarCampo("inscricao_estadual", v)}
              />
              <Campo
                label="CEP"
                valor={form.cep}
                aoMudar={(v) => atualizarCampo("cep", v)}
                aoSair={buscarCep}
              />
              <Campo
                label="Endereço"
                valor={form.endereco}
                aoMudar={(v) => atualizarCampo("endereco", v)}
              />
              <Campo
                label="Responsável"
                valor={form.responsavel}
                aoMudar={(v) => atualizarCampo("responsavel", v)}
              />
              <Campo
                label="CPF do Responsável"
                valor={form.cpf_responsavel}
                aoMudar={(v) => atualizarCampo("cpf_responsavel", v)}
              />
              <Campo
                label="E-mail de Contato"
                valor={form.email_contato}
                aoMudar={(v) => atualizarCampo("email_contato", v)}
              />

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={carregando}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {carregando ? "Salvando..." : "Cadastrar"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/admin")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

// Componente reutilizável de campo do formulário
function Campo({
  label,
  valor,
  aoMudar,
  aoSair,
  obrigatorio,
}: {
  label: string;
  valor: string;
  aoMudar: (v: string) => void;
  aoSair?: () => void;
  obrigatorio?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        onBlur={aoSair}
        required={obrigatorio}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
