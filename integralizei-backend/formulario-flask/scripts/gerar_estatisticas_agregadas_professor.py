# scripts/gerar_estatisticas_agregadas_professor.py

from db import get_pg_conn  # mesmo helper que você usa no app.py


def gerar_estatisticas_agregadas_professor():
    """
    Gera estatísticas de integralização por disciplina + professor.

    Usa:
      - disciplinas_cursadas (aluno_id, periodo, codigo, nome, professor)
      - integralizacoes_semestre (aluno_id, periodo, integralizacao)

    Preenche:
      - estatisticas_agregadas_professor
    """
    conn = get_pg_conn()
    cur = conn.cursor()

    # Limpa a tabela antes de preencher
    cur.execute("DELETE FROM estatisticas_agregadas_professor")

    # Insere os agregados
    cur.execute(
        """
        INSERT INTO estatisticas_agregadas_professor
            (codigo, nome, professor,
             media_integralizacao,
             min_integralizacao,
             max_integralizacao,
             total_alunos)
        SELECT
            d.codigo,
            d.nome,
            d.professor,
            AVG(i.integralizacao) AS media_integralizacao,
            MIN(i.integralizacao) AS min_integralizacao,
            MAX(i.integralizacao) AS max_integralizacao,
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


if __name__ == "__main__":  # pragma: no cover
    gerar_estatisticas_agregadas_professor()
    print("Estatísticas agregadas por professor geradas com sucesso!")
