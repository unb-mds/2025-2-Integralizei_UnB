# scripts/gerar_estatisticas_agregadas.py
from datetime import datetime

from db import get_pg_conn


def gerar_estatisticas_agregadas():
    """
    Lê estatisticas_disciplinas (já agregada por disciplina) e
    gera estatísticas ainda mais agregadas em estatisticas_disciplinas_agregadas.
    """
    conn = get_pg_conn()
    try:
        cur = conn.cursor()

        # Buscar dados brutos (integralização por disciplina)
        cur.execute(
            """
            SELECT codigo, nome, media_integralizacao
            FROM estatisticas_disciplinas
            WHERE media_integralizacao IS NOT NULL
            """
        )
        registros = cur.fetchall()

        materias = {}

        for row in registros:
            # Suporta tanto tupla (cursor normal) quanto dict (RealDictCursor)
            if isinstance(row, dict):
                codigo = row["codigo"]
                nome = row["nome"]
                integr = row["media_integralizacao"]
            else:
                codigo, nome, integr = row

            if codigo not in materias:
                materias[codigo] = {"nome": nome, "valores": []}
            materias[codigo]["valores"].append(float(integr))

        # Limpar tabela agregada
        cur.execute("DELETE FROM estatisticas_disciplinas_agregadas")

        # Gerar valores agregados
        for codigo, dados in materias.items():
            valores = dados["valores"]
            nome = dados["nome"]

            media = int(round(sum(valores) / len(valores)))
            min_v = int(round(min(valores)))
            max_v = int(round(max(valores)))
            total = len(valores)
            atualizado_em = datetime.now()  # psycopg2 converte pra timestamp

            cur.execute(
                """
                INSERT INTO estatisticas_disciplinas_agregadas
                    (codigo, nome, media,
                     min_integralizacao, max_integralizacao,
                     total_alunos, atualizado_em)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (codigo, nome, media, min_v, max_v, total, atualizado_em),
            )

        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":  # pragma: no cover
    print("Gerando estatísticas agregadas (PostgreSQL)...")
    gerar_estatisticas_agregadas()
    print("Estatísticas agregadas geradas com sucesso.")
