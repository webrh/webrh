-- WEBRH - SCHEMA INICIAL PORTARIA 671

-- Tabela de Empresas (Clientes SaaS)
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  plano VARCHAR(50) DEFAULT 'mensal',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  email VARCHAR(200),
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Jornadas de Trabalho
CREATE TABLE IF NOT EXISTS jornadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  entrada TIME,
  saida TIME,
  entrada_intervalo TIME,
  saida_intervalo TIME,
  dias_semana INT[] DEFAULT '{1,2,3,4,5}',
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Marcações de Ponto
CREATE TABLE IF NOT EXISTS marcacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL DEFAULT 'entrada',
  metodo VARCHAR(20) NOT NULL DEFAULT 'manual',
  foto_url TEXT,
  marcado_em TIMESTAMPTZ DEFAULT now(),
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Horas Extras
CREATE TABLE IF NOT EXISTS horas_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  quantidade_minutos INT NOT NULL,
  percentual NUMERIC(5,2) DEFAULT 50,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Banco de Horas
CREATE TABLE IF NOT EXISTS banco_horas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  saldo_minutos INT DEFAULT 0,
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Faltas e Justificativas
CREATE TABLE IF NOT EXISTS faltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  justificada BOOLEAN DEFAULT false,
  observacao TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_marcacoes_func ON marcacoes(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_marcacoes_data ON marcacoes(marcado_em);
CREATE INDEX IF NOT EXISTS idx_func_empresa ON funcionarios(empresa_id);
