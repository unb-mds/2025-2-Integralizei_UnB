import sqlite3
from datetime import datetime
import os


def gerar_estatisticas_agregadas(db_path):
    conn = sqlite3.connect(db_path)
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

    # Agrupar
    materias = {}

    for codigo, nome, integr in registros:
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
        atualizado_em = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cur.execute(
            """
            INSERT INTO estatisticas_disciplinas_agregadas
            (codigo, nome, media, min_integralizacao, max_integralizacao, total_alunos, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (codigo, nome, media, min_v, max_v, total, atualizado_em),
        )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    DB_PATH = os.path.join(BASE_DIR, "instance", "integralizei.db")

    gerar_estatisticas_agregadas(DB_PATH)
    print("Estatísticas agregadas geradas com sucesso.")
