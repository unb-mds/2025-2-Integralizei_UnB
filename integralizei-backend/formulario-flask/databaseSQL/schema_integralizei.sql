-- =========================
-- TABELA: alunos
-- =========================
CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    matricula TEXT UNIQUE NOT NULL,
    nome TEXT,
    curso TEXT,
    ch_exigida INTEGER DEFAULT 3480,
    ira REAL,
    mp REAL,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- TABELA: disciplinas_cursadas
-- =========================
CREATE TABLE IF NOT EXISTS disciplinas_cursadas (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL,
    periodo TEXT,
    codigo TEXT,
    nome TEXT,
    creditos INTEGER,
    mencao TEXT,
    status TEXT,
    professor TEXT,
    criado_em TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: integralizacoes_semestre
-- =========================
CREATE TABLE IF NOT EXISTS integralizacoes_semestre (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL,
    periodo TEXT NOT NULL,
    ch_acumulada INTEGER,
    integralizacao REAL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- =========================
-- TABELA: estatisticas_disciplinas
-- =========================
CREATE TABLE IF NOT EXISTS estatisticas_disciplinas (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome TEXT,
    media_integralizacao REAL,
    mediana_integralizacao REAL,
    desvio_padrao REAL,
    total_alunos INTEGER
);

-- =========================
-- TABELA: estatisticas_disciplinas_agregadas
-- (usada pelo gerar_estatisticas_agregadas.py)
-- =========================
CREATE TABLE IF NOT EXISTS estatisticas_disciplinas_agregadas (
    codigo TEXT PRIMARY KEY,
    nome TEXT,
    media REAL,
    min_integralizacao REAL,
    max_integralizacao REAL,
    total_alunos INTEGER,
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- TABELA: estatisticas_disciplinas_professor
-- =========================
CREATE TABLE IF NOT EXISTS estatisticas_disciplinas_professor (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome TEXT,
    professor TEXT,
    media_integralizacao REAL,
    mediana_integralizacao REAL,
    desvio_padrao REAL,
    total_alunos INTEGER
);

-- =========================
-- TABELA: estatisticas_agregadas_professor
-- (usada pelo gerar_estatisticas_agregadas_professor.py)
-- =========================
CREATE TABLE IF NOT EXISTS estatisticas_agregadas_professor (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome_disciplina TEXT,
    professor TEXT NOT NULL,
    media_integralizacao REAL,
    min_integralizacao REAL,
    max_integralizacao REAL,
    total_alunos INTEGER,
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- =========================
-- VIEW: disciplinas_com_integralizacao
-- (disciplina + integralização no semestre)
-- =========================
CREATE OR REPLACE VIEW disciplinas_com_integralizacao AS
SELECT
    d.id             AS disciplina_id,
    d.aluno_id       AS aluno_id,
    d.periodo        AS periodo,
    d.codigo         AS codigo,
    d.nome           AS nome,
    d.creditos       AS creditos,
    d.mencao         AS mencao,
    d.status         AS status,
    d.professor      AS professor,
    d.criado_em      AS criado_em,
    i.ch_acumulada   AS ch_acumulada,
    i.integralizacao AS integralizacao_no_periodo
FROM disciplinas_cursadas d
JOIN integralizacoes_semestre i
    ON i.aluno_id = d.aluno_id
   AND i.periodo = d.periodo;
