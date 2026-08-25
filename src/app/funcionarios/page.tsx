"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type Empresa = { id: string; nome: string };

export default function CadastroFuncionarioPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const inputFoto = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nome: "",
    data_nascimento: "",
    pis: "",
    cpf: "",
    rg: "",
    ctps: "",
    data_admissao: "",
    data_demissao: "",
    matricula: "",
    cidade: "",
    empresa_id: "",
    cargo: "",
    horario: "",
    sexo: "",
    departamento: "",
    escala: "",
    setor: "",
    grau_escolaridade: "",
  });

  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    const { data } = await supabase.from("empresas").select("id, nome").order("nome");
    setEmpresas(data ?? []);
  }

  function atualizar(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setFoto(arquivo);
    setFotoPreview(URL.createObjectURL(arquivo));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    let fotoUrl: string | null = null;

    if (foto) {
      const nomeArquivo = `${Date.now()}-${foto.name}`;
      const { error: erroUpload } = await supabase.storage
        .from("fotos-funcionarios")
        .upload(nomeArquivo, foto);

      if (erroUpload) {
        setCarregando(false);
        setMensagem({ tipo: "erro", texto: "Erro ao enviar a foto: " + erroUpload.message });
        return;
      }

      const { data: urlPublica } = supabase.storage
        .from("fotos-funcionarios")
        .getPublicUrl(nomeArquivo);
      fotoUrl = urlPublica.publicUrl;
    }

    const { error } = await supabase.from("funcionarios").insert({
      nome: form.nome,
      data_nascimento: form.data_nascimento || null,
      pis: form.pis,
      cpf: form.cpf.replace(/\D/g, ""),
      rg: form.rg,
      ctps: form.ctps,
      data_admissao: form.data_admissao || null,
      data_demissao: form.data_demissao || null,
      matricula: form.matricula,
      cidade: form.cidade,
      empresa_id: form.empresa_id || null,
      cargo: form.cargo,
      horario: form.horario,
      sexo: form.sexo,
      departamento: form.departamento,
      escala: form.escala,
      setor: form.setor,
      grau_escolaridade: form.grau_escolaridade,
      foto_url: fotoUrl,
    });

    setCarregando(false);

    if (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao salvar: " + error.message });
      return;
    }

    setMensagem({ tipo: "sucesso", texto: "Funcionário cadastrado com sucesso!" });
    setForm({
      nome: "", data_nascimento: "", pis: "", cpf: "", rg: "", ctps: "",
      data_admissao: "", data_demissao: "", matricula: "", cidade: "",
      empresa_id: "", cargo: "", horario: "", sexo: "", departamento: "",
      escala: "", setor: "", grau_escolaridade: "",
    });
    setFoto(null);
    setFotoPreview("");
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
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Cadastro de Funcionário</h1>

        {mensagem && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
            mensagem.tipo === "sucesso"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={enviar} className="bg-white rounded-2xl shadow p-8 max-w-3xl">
          <div className="flex items-start gap-6 mb-6">
            <button
              type="button"
              onClick={() => inputFoto.current?.click()}
              className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 hover:border-blue-400 transition"
            >
              {fotoPreview ? (
                <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-sm text-center px-2">Adicionar foto</span>
              )}
            </button>
            <input ref={inputFoto} type="file" accept="image/*" onChange={escolherFoto} className="hidden" />
            <div className="text-sm text-slate-500">
              <p className="font-medium text-slate-700 mb-1">Foto do funcionário</p>
              <p>Clique no quadrado para enviar a foto.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campo("Nome completo", "nome", "Nome do funcionário")}
            {campo("Data de nascimento", "data_nascimento", "", "date")}
            {campo("PIS", "pis", "000.00000.00-0")}
            {campo("CPF", "cpf", "000.000.000-00")}
            {campo("RG", "rg", "00.000.000-0")}
            {campo("CTPS", "ctps", "Número da CTPS")}
            {campo("Data de admissão", "data_admissao", "", "date")}
            {campo("Data de demissão", "data_demissao", "", "date")}
            {campo("Matrícula", "matricula", "Nº da matrícula")}
            {campo("Cidade de trabalho", "cidade", "Cidade")}
            {campo("Cargo", "cargo", "Cargo do funcionário")}
            {campo("Horário", "horario", "Ex.: 08:00 - 17:00")}
            {campo("Departamento", "departamento", "Departamento")}
            {campo("Escala", "escala", "Ex.: 6x1, 5x2")}
            {campo("Setor", "setor", "Setor")}
            {campo("Grau de escolaridade", "grau_escolaridade", "Ex.: Ensino Médio")}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Empresa</label>
              <select
                value={form.empresa_id}
                onChange={(e) => atualizar("empresa_id", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Selecione a empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Sexo</label>
              <select
                value={form.sexo}
                onChange={(e) => atualizar("sexo", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition"
          >
            {carregando ? "Salvando..." : "Salvar Funcionário"}
          </button>
        </form>
      </main>
    </div>
  );
}
