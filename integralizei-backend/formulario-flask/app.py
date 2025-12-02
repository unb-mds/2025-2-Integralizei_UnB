import os
import sys
import traceback
from datetime import datetime

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Importações internas
from parsers.unb_historico import parse_basico
from scripts.calcular_integralizacoes_semestre import recalcular_tudo
from db import get_pg_conn

# Ajuste de path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# ==========================
# Configuração inicial
# ==========================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# ==========================
# Banco de dados
# ==========================
def get_db():
    """
    Abre conexão com o PostgreSQL usando o helper centralizado.
    A criação de tabelas e migrações agora deve ser feita em scripts separados.
    """
    return get_pg_conn()


# ==========================
# Inserção/atualização de dados
# ==========================
def upsert(conn, dados, arquivo):
    aluno_data = dados.get("aluno", {})
    indices = dados.get("indices", {})
    curr = dados.get("curriculo", {})
    materias = curr.get("materias", [])

    matricula = aluno_data.get("matricula")
    nome = aluno_data.get("nome")
    curso = aluno_data.get("curso")
    ira = indices.get("ira")
    mp = indices.get("mp")

    cur = conn.cursor()

    # Upsert Aluno
    cur.execute(
        """
        INSERT INTO alunos (matricula, nome, curso, ira, mp)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (matricula) DO UPDATE SET
            nome = EXCLUDED.nome,
            curso = EXCLUDED.curso,
            ira = EXCLUDED.ira,
            mp = EXCLUDED.mp,
            atualizado_em = NOW()
        RETURNING id
        """,
        (matricula, nome, curso, ira, mp),
    )
    # Pega o ID (seguro tanto para insert quanto update)
    aluno_id = cur.fetchone()[0]

    # Limpa disciplinas antigas desse aluno para inserir as novas
    cur.execute("DELETE FROM disciplinas_cursadas WHERE aluno_id = %s", (aluno_id,))

    # Insere novas disciplinas COM PROFESSOR
    for m in materias:
        cur.execute(
            """
            INSERT INTO disciplinas_cursadas
                (aluno_id, periodo, codigo, nome, creditos, mencao, status, professor)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                aluno_id,
                m.get("periodo"),
                m.get("codigo"),
                m.get("nome"),
                m.get("creditos") or m.get("ch"),
                m.get("situacao") or m.get("mencao"),
                m.get("status"),
                m.get("professor"),
            ),
        )

    conn.commit()


# ==========================
# Rota principal
# ==========================
@app.route("/upload", methods=["POST"])
def upload_pdf():
    f = request.files.get("file")

    if not f or not f.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Envie um arquivo PDF válido."}), 400

    fname = secure_filename(f.filename)
    base, ext = os.path.splitext(fname)

    unique = f"{base}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], unique)
    f.save(save_path)

    try:
        dados = parse_basico(save_path)

        if not dados:
            raise ValueError("Erro: parse_basico retornou vazio.")

        conn = get_db()
        try:
            upsert(conn, dados, save_path)
        finally:
            conn.close()

        recalcular_tudo()

        from scripts.preencher_estatisticas_disciplinas import (
            preencher_estatisticas_disciplinas,
        )

        preencher_estatisticas_disciplinas()

        from scripts.gerar_estatisticas_agregadas import gerar_estatisticas_agregadas

        gerar_estatisticas_agregadas()

        from scripts.gerar_estatisticas_agregadas_professor import (
            gerar_estatisticas_agregadas_professor,
        )

        gerar_estatisticas_agregadas_professor()

        return jsonify(dados), 200

    except Exception:
        print("ERRO AO PROCESSAR PDF:", traceback.format_exc())
        return jsonify({"error": "Falha ao processar o PDF."}), 500


# ==========================
# Página de teste local
# ==========================
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html", status="ok")


@app.route("/api/estatisticas/<codigo>", methods=["GET"])
def estatisticas_disciplina(codigo):
    """
    Retorna as estatísticas agregadas de uma disciplina:
    - média de integralização
    - faixa (min e max)
    - total de alunos analisados
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT codigo, nome, media, min_integralizacao, max_integralizacao, total_alunos
            FROM estatisticas_disciplinas_agregadas
            WHERE codigo = %s
            """,
            (codigo,),
        )
        row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        return jsonify({"error": "Disciplina não encontrada"}), 404

    codigo, nome, media, min_v, max_v, total = row

    return (
        jsonify(
            {
                "codigo": codigo,
                "nome": nome,
                "media_integralizacao": round(media, 2) if media is not None else None,
                "faixa_integralizacao": {
                    "min": round(min_v, 2) if min_v is not None else None,
                    "max": round(max_v, 2) if max_v is not None else None,
                },
                "total_alunos": total,
            }
        ),
        200,
    )


@app.route("/api/ranking/<codigo_disciplina>", methods=["GET"])
def ranking_disciplina(codigo_disciplina):
    professor_alvo = request.args.get("professor")

    conn = get_db()
    cur = conn.cursor()

    # Query base na VIEW
    sql = """
        SELECT integralizacao_no_periodo
        FROM disciplinas_com_integralizacao
        WHERE codigo = %s
    """
    params = [codigo_disciplina]

    if professor_alvo:
        # TRUQUE DE MESTRE: ILIKE com % busca partes do nome
        # Ex: Busca '%Luiza%' encontra 'Dra. Luiza Yoko'
        sql += " AND professor ILIKE %s"
        # Pega só o primeiro nome para aumentar a chance de match, ou usa o nome todo
        # Vamos tentar usar o nome todo cercado de %
        params.append(f"%{professor_alvo}%")

    sql += " ORDER BY integralizacao_no_periodo DESC"

    try:
        cur.execute(sql, tuple(params))
        rows = cur.fetchall()

        ranking = []
        for idx, row in enumerate(rows):
            integralizacao = row[0]
            val_float = float(integralizacao) if integralizacao is not None else 0.0

            ranking.append(
                {
                    "posicao": idx + 1,
                    "integralizacao": f"{val_float:.2f}%",
                }
            )

        return jsonify(ranking), 200

    except Exception as e:
        print(f"Erro no ranking: {e}")
        traceback.print_exc()
        return jsonify({"error": "Erro ao gerar ranking"}), 500
    finally:
        cur.close()
        conn.close()


# ==========================
# Início do servidor
# ==========================
if __name__ == "__main__":  # pragma: no cover
    # Enable debug mode only if FLASK_DEBUG env var is set to "1"
    debug_mode = os.environ.get("FLASK_DEBUG") == "1"
    app.run(debug=debug_mode, host="0.0.0.0", port=5000)
