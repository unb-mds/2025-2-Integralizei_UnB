# scripts/gerar_estatisticas_agregadas_professor.py

from db import get_pg_conn

def gerar_estatisticas_agregadas_professor():
    """
    Gera estatísticas de integralização por disciplina + professor.
    
    CORREÇÃO: Nome da tabela ajustado para estatisticas_disciplinas_professor
    """
    conn = get_pg_conn()
    cur = conn.cursor()

    # 1. Limpa a tabela correta
    cur.execute("DELETE FROM estatisticas_disciplinas_professor")

    # 2. Insere na tabela correta
    cur.execute(
        """
        INSERT INTO estatisticas_disciplinas_professor
            (codigo, nome, professor,
             media_integralizacao,
             mediana_integralizacao,
             desvio_padrao,
             total_alunos)
        SELECT
            d.codigo,
            d.nome,
            d.professor,
            AVG(i.integralizacao) AS media_integralizacao,
            PERCENTILE_DISC(0.5) WITHIN GROUP (ORDER BY i.integralizacao) AS mediana_integralizacao,
            COALESCE(STDDEV_POP(i.integralizacao), 0) AS desvio_padrao,
            COUNT(*) AS total_alunos
        FROM disciplinas_cursadas d
        JOIN integralizacoes_semestre i
          ON i.aluno_id = d.aluno_id
         AND i.periodo = d.periodo
        WHERE d.professor IS NOT NULL
        GROUP BY d.codigo, d.nome, d.professor
        """
    )

    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    gerar_estatisticas_agregadas_professor()
    print("Estatísticas agregadas por professor geradas com sucesso!")