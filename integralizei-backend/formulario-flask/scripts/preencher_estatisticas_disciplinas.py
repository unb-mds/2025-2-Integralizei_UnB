import os
import sqlite3


def preencher_estatisticas_disciplinas(db_path: str) -> None:
    """
    Preenche a tabela estatisticas_disciplinas associando,
    para cada disciplina cursada, a integralização que o aluno
    tinha naquele período.
    """

    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    cur = conn.cursor()

    # 1) Buscar todas as disciplinas com integralização do período
    cur.execute(
        """
        SELECT
            d.aluno_id,
            d.codigo,
            d.nome,
            d.mencao,
            d.creditos,
            d.periodo,
            v.integralizacao_no_periodo
        FROM disciplinas_cursadas d
        JOIN disciplinas_com_integralizacao v
              ON v.disciplina_id = d.id
        WHERE v.integralizacao_no_periodo IS NOT NULL
        """
    )

    registros = cur.fetchall()

    # 2) Limpar dados antigos (vamos recomputar tudo do zero)
    cur.execute("DELETE FROM estatisticas_disciplinas")

    # 3) Inserir uma linha por (aluno, disciplina, período)
    for aluno_id, codigo, nome, mencao, creditos, periodo, integr in registros:
        cur.execute(
            """
            INSERT INTO estatisticas_disciplinas (
                aluno_id,
                codigo,
                nome,
                mencao,
                creditos,
                periodo,
                media_integralizacao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                aluno_id,
                codigo,
                nome,
                mencao,
                creditos,
                periodo,
                float(integr) if integr is not None else None,
            ),
        )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    # Permite rodar direto: python -m scripts.preencher_estatisticas_disciplinas
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    DB_PATH = os.path.join(BASE_DIR, "instance", "integralizei.db")

    preencher_estatisticas_disciplinas(DB_PATH)
    print("Tabela estatisticas_disciplinas preenchida com sucesso.")
