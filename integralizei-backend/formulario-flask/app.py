import os
import sqlite3
import sys
import traceback
from datetime import datetime

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

# Importações internas
from parsers.unb_historico import parse_basico
from scripts.calcular_integralizacoes_semestre import recalcular_tudo
from werkzeug.utils import secure_filename

# Ajuste de path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# ==========================
# Configuração inicial
# ==========================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
DB_PATH = os.path.join(BASE_DIR, "instance", "integralizei.db")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)

app = Flask(__name__)
CORS(app)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# ==========================
# Banco de dados
# ==========================
def get_db():
    """Abre conexão com SQLite configurada."""
    conn = sqlite3.connect(DB_PATH, timeout=10, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout = 8000;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA foreign_keys = ON;")

    # Criação das tabelas
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS alunos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            matricula TEXT UNIQUE,
            nome TEXT,
            curso TEXT,
            ch_exigida INTEGER DEFAULT 3480,
            ira REAL,
            mp REAL,
            criado_em TEXT DEFAULT (datetime('now')),
            atualizado_em TEXT DEFAULT (datetime('now'))
        )
    """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS disciplinas_cursadas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aluno_id INTEGER,
            periodo TEXT,
            codigo TEXT,
            nome TEXT,
            creditos INTEGER,
            mencao TEXT,
            status TEXT,
            criado_em TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (aluno_id) REFERENCES alunos(id)
        )
    """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS integralizacoes_semestre (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aluno_id INTEGER NOT NULL,
            periodo TEXT NOT NULL,
            ch_acumulada INTEGER,
            integralizacao REAL,
            FOREIGN KEY (aluno_id) REFERENCES alunos(id)
        )
    """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS estatisticas_disciplinas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aluno_id INTEGER NOT NULL,
            codigo TEXT,
            nome TEXT,
            mencao TEXT,
            creditos INTEGER,
            periodo TEXT,
            media_integralizacao REAL,
            FOREIGN KEY (aluno_id) REFERENCES alunos(id)
        )
    """
    )

    # VIEW: disciplinas + integralização no período
    conn.execute(
        """
        CREATE VIEW IF NOT EXISTS disciplinas_com_integralizacao AS
        SELECT
            d.id             AS disciplina_id,
            d.aluno_id       AS aluno_id,
            d.periodo        AS periodo,
            d.codigo         AS codigo,
            d.nome           AS nome,
            d.creditos       AS creditos,
            d.mencao         AS mencao,
            d.status         AS status,
            d.criado_em      AS criado_em,
            i.ch_acumulada   AS ch_acumulada,
            i.integralizacao AS integralizacao_no_periodo
        FROM disciplinas_cursadas d
        JOIN integralizacoes_semestre i
             ON i.aluno_id = d.aluno_id
            AND i.periodo  = d.periodo
        """
    )

    conn.execute(
        """
    CREATE TABLE IF NOT EXISTS estatisticas_disciplinas_agregadas (
        codigo TEXT PRIMARY KEY,
        nome TEXT,
        media REAL,
        min_integralizacao REAL,
        max_integralizacao REAL,
        total_alunos INTEGER,
        atualizado_em TEXT DEFAULT (datetime('now'))
    )
    """
    )

    conn.commit()
    return conn


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

    # Inserção ou atualização do aluno
    conn.execute(
        """
        INSERT INTO alunos (matricula, nome, curso, ira, mp)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(matricula) DO UPDATE SET
            nome = excluded.nome,
            curso = excluded.curso,
            ira = excluded.ira,
            mp = excluded.mp,
            atualizado_em = datetime('now')
    """,
        (matricula, nome, curso, ira, mp),
    )

    aluno_id = conn.execute(
        "SELECT id FROM alunos WHERE matricula = ?", (matricula,)
    ).fetchone()[0]

    # Remove disciplinas antigas
    conn.execute("DELETE FROM disciplinas_cursadas WHERE aluno_id = ?", (aluno_id,))

    # Insere novas
    for m in materias:
        conn.execute(
            """
            INSERT INTO disciplinas_cursadas
                (aluno_id, periodo, codigo, nome, creditos, mencao, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            (
                aluno_id,
                m.get("periodo"),
                m.get("codigo"),
                m.get("nome"),
                m.get("creditos") or m.get("ch"),
                m.get("situacao") or m.get("mencao"),
                m.get("status"),
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
        upsert(conn, dados, save_path)
        conn.close()

        recalcular_tudo(DB_PATH)
        from scripts.preencher_estatisticas_disciplinas import (
            preencher_estatisticas_disciplinas,
        )

        preencher_estatisticas_disciplinas(DB_PATH)

        from scripts.gerar_estatisticas_agregadas import gerar_estatisticas_agregadas

        gerar_estatisticas_agregadas(DB_PATH)

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
    cur = conn.cursor()

    row = cur.execute(
        """
        SELECT codigo, nome, media, min_integralizacao, max_integralizacao, total_alunos
        FROM estatisticas_disciplinas_agregadas
        WHERE codigo = ?
        """,
        (codigo,),
    ).fetchone()

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


# ==========================
# Início do servidor
# ==========================
if __name__ == "__main__":  # pragma: no cover
    app.run(debug=True, host="0.0.0.0", port=8000)
