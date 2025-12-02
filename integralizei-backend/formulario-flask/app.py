import os
import sys
import time
import traceback
from datetime import datetime

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import psycopg2

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
# DEFINIÇÃO COMPLETA DO BANCO (FIXADO NO CÓDIGO)
# ==========================
FULL_SCHEMA_SQL = """
BEGIN;

CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    matricula TEXT UNIQUE NOT NULL,
    nome TEXT,
    curso TEXT,
    ch_exigida INTEGER DEFAULT 3480,
    ira REAL,
    mp REAL,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disciplinas_cursadas (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL,
    periodo TEXT,
    codigo TEXT,
    nome TEXT,
    creditos INTEGER,
    mencao TEXT,
    status TEXT,
    professor TEXT,
    criado_em TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS integralizacoes_semestre (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL,
    periodo TEXT NOT NULL,
    ch_acumulada INTEGER,
    integralizacao REAL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS estatisticas_disciplinas (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome TEXT,
    media_integralizacao REAL,
    mediana_integralizacao REAL,
    desvio_padrao REAL,
    total_alunos INTEGER
);

CREATE TABLE IF NOT EXISTS estatisticas_disciplinas_agregadas (
    codigo TEXT PRIMARY KEY,
    nome TEXT,
    media REAL,
    min_integralizacao REAL,
    max_integralizacao REAL,
    total_alunos INTEGER,
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estatisticas_disciplinas_professor (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome TEXT,
    professor TEXT,
    media_integralizacao REAL,
    mediana_integralizacao REAL,
    desvio_padrao REAL,
    total_alunos INTEGER
);

CREATE TABLE IF NOT EXISTS estatisticas_agregadas_professor (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL,
    nome_disciplina TEXT,
    professor TEXT NOT NULL,
    media_integralizacao REAL,
    min_integralizacao REAL,
    max_integralizacao REAL,
    total_alunos INTEGER,
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE VIEW disciplinas_com_integralizacao AS
SELECT
    d.id             AS disciplina_id,
    d.aluno_id       AS aluno_id,
    d.periodo        AS periodo,
    d.codigo         AS codigo,
    d.nome           AS nome,
    d.creditos       AS creditos,
    d.mencao         AS mencao,
    d.status         AS status,
    d.professor      AS professor,
    d.criado_em      AS criado_em,
    i.ch_acumulada   AS ch_acumulada,
    i.integralizacao AS integralizacao_no_periodo
FROM disciplinas_cursadas d
JOIN integralizacoes_semestre i
    ON i.aluno_id = d.aluno_id
   AND i.periodo = d.periodo;

COMMIT;
"""

def wait_for_db_and_init():
    """
    Tenta conectar ao banco e garante que TODAS as tabelas existam.
    """
    retries = 30
    while retries > 0:
        try:
            print(f"--- TENTANDO CONECTAR AO BANCO ({retries} tentativas restantes) ---")
            conn = get_pg_conn()
            cur = conn.cursor()
            
            # Verifica se a tabela 'disciplinas_cursadas' existe
            cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'disciplinas_cursadas');")
            row = cur.fetchone()
            
            if isinstance(row, dict):
                exists = row['exists']
            else:
                exists = row[0]
            
            if not exists:
                print("--- TABELAS FALTANDO. EXECUTANDO SCHEMA COMPLETO... ---")
                cur.execute(FULL_SCHEMA_SQL)
                conn.commit()
                print("--- TODAS AS TABELAS FORAM CRIADAS COM SUCESSO ---")
            else:
                print("--- CONEXÃO BEM SUCEDIDA E ESTRUTURA OK ---")
            
            cur.close()
            conn.close()
            return True
        except psycopg2.OperationalError as e:
            print(f"Banco ainda indisponível... aguardando. Erro: {e}")
            time.sleep(2)
            retries -= 1
        except Exception as e:
            print(f"Erro inesperado ao inicializar banco: {e}")
            traceback.print_exc()
            time.sleep(2)
            retries -= 1
            
    print("!!! FALHA CRÍTICA: NÃO FOI POSSÍVEL CONECTAR AO BANCO APÓS VÁRIAS TENTATIVAS !!!")
    return False

wait_for_db_and_init()

def get_db():
    return get_pg_conn()

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
    
    if not matricula:
        raise ValueError("Não foi possível identificar a matrícula no PDF.")

    cur = conn.cursor()

    try:
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
        row = cur.fetchone()
        
        if row:
            if isinstance(row, dict):
                aluno_id = row['id']
            else:
                aluno_id = row[0]
        else:
            cur.execute("SELECT id FROM alunos WHERE matricula = %s", (matricula,))
            row = cur.fetchone()
            if isinstance(row, dict):
                aluno_id = row['id']
            else:
                aluno_id = row[0]

        cur.execute("DELETE FROM disciplinas_cursadas WHERE aluno_id = %s", (aluno_id,))

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
    except Exception as e:
        conn.rollback()
        print(f"Erro no UPSERT: {e}")
        raise e

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

        try:
            recalcular_tudo()
            from scripts.preencher_estatisticas_disciplinas import preencher_estatisticas_disciplinas
            preencher_estatisticas_disciplinas()
            from scripts.gerar_estatisticas_agregadas import gerar_estatisticas_agregadas
            gerar_estatisticas_agregadas()
            from scripts.gerar_estatisticas_agregadas_professor import gerar_estatisticas_agregadas_professor
            gerar_estatisticas_agregadas_professor()
        except Exception as e_scripts:
            print(f"Aviso: Erro ao gerar estatísticas: {e_scripts}")
            traceback.print_exc()

        return jsonify(dados), 200

    except Exception as e:
        print("ERRO AO PROCESSAR PDF:", traceback.format_exc())
        return jsonify({"error": f"Falha ao processar o PDF: {str(e)}"}), 500

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html", status="ok")

@app.route("/api/estatisticas/<codigo>", methods=["GET"])
def estatisticas_disciplina(codigo):
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT codigo, nome, media, min_integralizacao, max_integralizacao, total_alunos FROM estatisticas_disciplinas_agregadas WHERE codigo = %s",
            (codigo,),
        )
        row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        return jsonify({"error": "Disciplina não encontrada"}), 404

    if isinstance(row, dict):
         codigo = row['codigo']
         nome = row['nome']
         media = row['media']
         min_v = row['min_integralizacao']
         max_v = row['max_integralizacao']
         total = row['total_alunos']
    else:
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
    sql = "SELECT integralizacao_no_periodo FROM disciplinas_com_integralizacao WHERE codigo = %s"
    params = [codigo_disciplina]

    if professor_alvo:
        sql += " AND professor ILIKE %s"
        params.append(f"%{professor_alvo}%")

    sql += " ORDER BY integralizacao_no_periodo DESC"

    try:
        cur.execute(sql, tuple(params))
        rows = cur.fetchall()
        ranking = []
        for idx, row in enumerate(rows):
            if isinstance(row, dict):
                val = row['integralizacao_no_periodo']
            else:
                val = row[0]
            val_float = float(val) if val is not None else 0.0
            ranking.append({"posicao": idx + 1, "integralizacao": f"{val_float:.2f}%"})
        return jsonify(ranking), 200
    except Exception as e:
        print(f"Erro no ranking: {e}")
        return jsonify({"error": "Erro ao gerar ranking"}), 500
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG") == "1"
    app.run(debug=debug_mode, host="0.0.0.0", port=5000)