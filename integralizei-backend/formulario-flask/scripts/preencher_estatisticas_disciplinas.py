# scripts/preencher_estatisticas_disciplinas.py
# -*- coding: utf-8 -*-

from db import get_pg_conn
from scripts.calcular_integralizacoes_semestre import calcular_estatisticas_disciplinas


def preencher_estatisticas_disciplinas(min_n: int = 1) -> None:
    """
    Versão nova: em vez de popular estatisticas_disciplinas usando a view
    disciplinas_com_integralizacao (uma linha por aluno/disciplina/período),
    delega o cálculo diretamente para calcular_estatisticas_disciplinas,
    que já grava a tabela no formato agregado:

        codigo, nome,
        media_integralizacao,
        mediana_integralizacao,
        desvio_padrao,
        total_alunos
    """

    conn = get_pg_conn()
    try:
        calcular_estatisticas_disciplinas(conn, min_n=min_n)
    finally:
        conn.close()


if __name__ == "__main__":  # pragma: no cover
    print("Preenchendo estatisticas_disciplinas (PostgreSQL)...")
    preencher_estatisticas_disciplinas()
    print("Tabela estatisticas_disciplinas preenchida com sucesso.")
