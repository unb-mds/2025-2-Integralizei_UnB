from db import get_pg_conn


def create_tables():
    print("Conectando ao banco para criar tabelas e views...")
    conn = get_pg_conn()
    cur = conn.cursor()

    # 1. Tabelas Base
    print("- Criando tabela: alunos")
    cur.execute(
        """
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
    """
    )

    print("- Criando tabela: disciplinas_cursadas")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS disciplinas_cursadas (
            id SERIAL PRIMARY KEY,
            aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
            periodo TEXT,
            codigo TEXT,
            nome TEXT,
            creditos INTEGER,
            mencao TEXT,
            status TEXT,
            professor TEXT,
            criado_em TIMESTAMP DEFAULT NOW()
        );
    """
    )

    print("- Criando tabela: integralizacoes_semestre")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS integralizacoes_semestre (
            id SERIAL PRIMARY KEY,
            aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
            periodo TEXT NOT NULL,
            ch_acumulada INTEGER,
            integralizacao REAL,
            FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
        );
    """
    )

    # --- A TABELA QUE ESTAVA FALTANDO ---
    print("- Criando tabela: estatisticas_disciplinas")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS estatisticas_disciplinas (
            id SERIAL PRIMARY KEY,
            aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
            codigo TEXT,
            nome TEXT,
            professor TEXT,
            mencao TEXT,
            creditos INTEGER,
            periodo TEXT,
            media_integralizacao REAL,
            mediana_integralizacao REAL,
            desvio_padrao REAL,
            total_alunos INTEGER
        );
    """
    )
    # -------------------------------------

    print("- Criando tabelas de estatísticas agregadas")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS estatisticas_disciplinas_agregadas (
            codigo TEXT PRIMARY KEY,
            nome TEXT,
            media REAL,
            min_integralizacao REAL,
            max_integralizacao REAL,
            total_alunos INTEGER,
            atualizado_em TIMESTAMP DEFAULT NOW()
        );
    """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS estatisticas_disciplinas_professor (
            id SERIAL PRIMARY KEY,
            codigo TEXT NOT NULL,
            nome TEXT,
            professor TEXT NOT NULL,
            media_integralizacao REAL,
            mediana_integralizacao REAL,
            desvio_padrao REAL,
            total_alunos INTEGER
        );
    """
    )

    print("- Criando VIEW: disciplinas_com_integralizacao")
    cur.execute(
        """
        CREATE OR REPLACE VIEW disciplinas_com_integralizacao AS
        SELECT
            d.id               AS disciplina_id,
            d.aluno_id         AS aluno_id,
            d.periodo          AS periodo,
            d.codigo           AS codigo,
            d.nome             AS nome,
            d.creditos         AS creditos,
            d.mencao           AS mencao,
            d.status           AS status,
            d.professor        AS professor,   
            d.criado_em        AS criado_em,
            i.ch_acumulada     AS ch_acumulada,
            i.integralizacao   AS integralizacao_no_periodo
        FROM disciplinas_cursadas d
        JOIN integralizacoes_semestre i
            ON i.aluno_id = d.aluno_id
           AND i.periodo = d.periodo;
    """
    )

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Sucesso! Estrutura completa criada.")


if __name__ == "__main__":
    create_tables()
