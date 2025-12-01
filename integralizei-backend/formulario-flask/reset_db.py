from db import get_pg_conn


def reset_database():
    print("🗑️ Deletando tabelas antigas...")
    conn = get_pg_conn()
    cur = conn.cursor()

    # O CASCADE garante que apaga tudo que depende dessas tabelas
    tabelas = [
        "estatisticas_disciplinas_professor",
        "estatisticas_disciplinas_agregadas",
        "integralizacoes_semestre",
        "estatisticas_disciplinas",
        "disciplinas_cursadas",
        "alunos",
    ]

    for tabela in tabelas:
        cur.execute(f"DROP TABLE IF EXISTS {tabela} CASCADE;")

    # Apaga também a View
    cur.execute("DROP VIEW IF EXISTS disciplinas_com_integralizacao;")

    conn.commit()
    cur.close()
    conn.close()
    print("✨ Banco de dados limpo com sucesso!")


if __name__ == "__main__":
    reset_database()
