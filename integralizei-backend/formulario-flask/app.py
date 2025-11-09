import sys, os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import os, sqlite3, json
from flask import Flask, render_template, request, redirect, url_for
from parsers.unb_historico import parse_basico
from scripts.calcular_integralizacoes_semestre import recalcular_tudo


BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
DB_PATH = os.path.join(BASE_DIR, "instance", "integralizei.db")

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")

    # ------------------------
    # 1. Tabela de alunos
    # ------------------------
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

    # ------------------------
    # 2. Disciplinas cursadas
    # ------------------------
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

    # ------------------------
    # 3. Integralização semestre a semestre
    # ------------------------
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

    # ------------------------
    # 4. Estatísticas agregadas por disciplina
    # ------------------------
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS estatisticas_disciplinas (
            codigo TEXT PRIMARY KEY,
            nome TEXT,
            media_integralizacao REAL,
            mediana_integralizacao REAL,
            desvio_padrao REAL,
            total_alunos INTEGER
        )
    """
    )

    # ------------------------
    # 5. Log de importações (opcional)
    # ------------------------
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS importacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            matricula TEXT,
            arquivo TEXT,
            payload_json TEXT,
            criado_em TEXT DEFAULT (datetime('now'))
        )
    """
    )

    # Índices de performance
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_disc_aluno ON disciplinas_cursadas(aluno_id)"
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_int_aluno ON integralizacoes_semestre(aluno_id)"
    )
    conn.commit()
    return conn


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

    # ------------------------
    # 1. Upsert do aluno
    # ------------------------
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

    # Recupera o aluno_id
    aluno_id = conn.execute(
        "SELECT id FROM alunos WHERE matricula = ?", (matricula,)
    ).fetchone()[0]

    # ------------------------
    # 2. Limpa disciplinas antigas e insere novas
    # ------------------------
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

    # ------------------------
    # 3. Log da importação
    # ------------------------
    conn.execute(
        """
        INSERT INTO importacoes (matricula, arquivo, payload_json)
        VALUES (?, ?, ?)
    """,
        (matricula, os.path.basename(arquivo), json.dumps(dados, ensure_ascii=False)),
    )

    conn.commit()


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        f = request.files.get("file")
        if not f or not f.filename.lower().endswith(".pdf"):
            return render_template(
                "index.html", status="erro", msg="Envie um PDF em formato .pdf"
            )

        from werkzeug.utils import secure_filename
        from datetime import datetime

        fname = secure_filename(f.filename)
        base, ext = os.path.splitext(fname)
        unique = f"{base}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], unique)
        f.save(save_path)
        with open(save_path, "rb") as fh:
            if fh.read(5) != b"%PDF-":
                os.remove(save_path)
                return render_template(
                    "index.html", status="erro", msg="Arquivo não é um PDF válido."
                )

        try:
            dados = parse_basico(save_path)
            conn = get_db()
            try:
                upsert(conn, dados, save_path)
                conn.commit()
            finally:
                conn.close()
            from scripts.calcular_integralizacoes_semestre import recalcular_tudo

            recalcular_tudo(DB_PATH)

            return render_template(
                "index.html",
                status="ok",
                arquivo=os.path.basename(save_path),
                nome=dados["aluno"].get("nome") or "",
                matricula=dados["aluno"].get("matricula") or "",
            )
        except Exception as e:
            return render_template("index.html", status="erro", msg=str(e))
    return render_template("index.html")
