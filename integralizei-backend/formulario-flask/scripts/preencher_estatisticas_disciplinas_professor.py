
import psycopg2
from psycopg2.extensions import connection


def preencher_estatisticas_disciplinas_professor(conn: connection) -> None:
    """
    Recalcula as estatísticas de integralização por (disciplina, professor)
    e grava na tabela estatisticas_disciplinas_professor.

    Usa a view disciplinas_com_integralizacao, que já junta:
      - disciplinas_cursadas (incluindo professor)
      - integralizacoes_semestre (incluindo integralizacao_no_periodo)
    """
    with conn.cursor() as cur:
        cur.execute("DELETE FROM estatisticas_disciplinas_professor;")

        cur.execute(
            """
            INSERT INTO estatisticas_disciplinas_professor (
                codigo,
                nome,
                professor,
                media_integralizacao,
                mediana_integralizacao,
                desvio_padrao,
                total_alunos
            )
            SELECT
                d.codigo,
                d.nome,
                d.professor,
                AVG(d.integralizacao_no_periodo) AS media_integralizacao,
                PERCENTILE_DISC(0.5) WITHIN GROUP (ORDER BY d.integralizacao_no_periodo)
                    AS mediana_integralizacao,
                COALESCE(STDDEV_POP(d.integralizacao_no_periodo), 0) AS desvio_padrao,
                COUNT(DISTINCT d.aluno_id) AS total_alunos
            FROM disciplinas_com_integralizacao d
            WHERE d.integralizacao_no_periodo IS NOT NULL
              AND d.professor IS NOT NULL
            GROUP BY
                d.codigo,
                d.nome,
                d.professor
            ;
            """
        )

    conn.commit()


if __name__ == "__main__":
    conn = psycopg2.connect(
        dbname="integralizei_db",
        user="integralizei_usuario",
        password="intgr2501",
        host="localhost",
        port=5432,
    )
    try:
        preencher_estatisticas_disciplinas_professor(conn)
        print("✅ Estatísticas por professor recalculadas com sucesso.")
    finally:
        conn.close()
