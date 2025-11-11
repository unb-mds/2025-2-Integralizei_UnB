import sys, os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

import sqlite3, json, traceback
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from parsers.unb_historico import parse_basico
from scripts.calcular_integralizacoes_semestre import recalcular_tudo

# ==========================
# Configuração inicial
# ==========================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
DB_PATH = os.path.join(BASE_DIR, "instance", "integralizei.db")

app = Flask(__name__)
CORS(app)  # permite que o Next.js acesse o Flask
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)


# ==========================
# Banco de dados
# ==========================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")

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
            nome=excluded.nome,
            curso=excluded.curso,
            ira=excluded.ira,
            mp=excluded.mp,
            atualizado_em=datetime('now')
    """,
        (matricula, nome, curso, ira, mp),
    )

    aluno_id = conn.execute(
        "SELECT id FROM alunos WHERE matricula = ?", (matricula,)
    ).fetchone()[0]

    # Substitui disciplinas antigas por novas
    conn.execute("DELETE FROM disciplinas_cursadas WHERE aluno_id = ?", (aluno_id,))
    for m in materias:
        conn.execute(
            """
            INSERT INTO disciplinas_cursadas (aluno_id, periodo, codigo, nome, creditos, mencao, status)
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
# Rota API principal (para o front)
# ==========================
@app.route("/upload", methods=["POST"])
def upload_pdf():
    """Recebe o PDF, processa e devolve os dados em JSON."""
    f = request.files.get("file")
    if not f or not f.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Envie um arquivo PDF válido."}), 400

    from werkzeug.utils import secure_filename
    from datetime import datetime

    fname = secure_filename(f.filename)
    base, ext = os.path.splitext(fname)
    unique = f"{base}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], unique)
    f.save(save_path)

    try:
        # Extrai os dados do histórico
        dados = parse_basico(save_path)
        if not dados:
            raise ValueError("Erro: parse_basico retornou vazio.")

        # Salva no banco
        conn = get_db()
        upsert(conn, dados, save_path)
        conn.close()

        # Atualiza integralização e retorna dados completos
        recalcular_tudo(DB_PATH)
        return jsonify(dados), 200

    except Exception as e:
        print("ERRO AO PROCESSAR PDF:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ==========================
# Rota local opcional (teste HTML)
# ==========================
@app.route("/", methods=["GET"])
def home():
    """Página simples para teste local."""
    return render_template("index.html", status="ok")


# ==========================
# Início do servidor
# ==========================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
