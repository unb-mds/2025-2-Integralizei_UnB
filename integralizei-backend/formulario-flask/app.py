import os
import sys
import time
import traceback
from datetime import datetime
import logging

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import psycopg2
import psycopg2.extras

# Importações internas
from parsers.unb_historico import parse_basico
from scripts.calcular_integralizacoes_semestre import recalcular_tudo
from db import get_pg_conn

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

print("--- APP SEGURO CARREGADO (DEBUG OFF) ---", flush=True)

FULL_SCHEMA_SQL = """
BEGIN;
CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    matricula TEXT UNIQUE NOT NULL,
    nome TEXT,
    curso TEXT,
    email TEXT,
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
    retries = 30
    while retries > 0:
        try:
            print(f"--- TENTANDO CONECTAR AO BANCO ({retries} tentativas) ---")
            conn = get_pg_conn()
            cur = conn.cursor()
            
            cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='alunos' AND column_name='email';")
            col_exists = cur.fetchone()

            cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'disciplinas_cursadas');")
            row = cur.fetchone()
            if isinstance(row, dict): exists = row['exists']
            else: exists = row[0]
            
            if not exists:
                print("--- RECRIANDO TABELAS... ---")
                cur.execute(FULL_SCHEMA_SQL)
                conn.commit()
            elif not col_exists:
                print("--- ADICIONANDO COLUNA EMAIL... ---")
                cur.execute("ALTER TABLE alunos ADD COLUMN IF NOT EXISTS email TEXT;")
                conn.commit()
            else:
                print("--- BANCO PRONTO ---")
            
            cur.close(); conn.close()
            return True
        except Exception as e:
            print(f"Aguardando banco... {e}")
            time.sleep(2)
            retries -= 1
    return False

wait_for_db_and_init()

def get_db():
    return get_pg_conn()

def upsert(conn, dados, arquivo, email_usuario=None):
    aluno_data = dados.get("aluno", {})
    indices = dados.get("indices", {})
    curr = dados.get("curriculo", {})
    materias = curr.get("materias", [])
    matricula = aluno_data.get("matricula")
    
    if not matricula: raise ValueError("Matrícula não encontrada.")

    cur = conn.cursor()
    try:
        sql = """
            INSERT INTO alunos (matricula, nome, curso, ira, mp, email)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (matricula) DO UPDATE SET
                nome = EXCLUDED.nome, curso = EXCLUDED.curso, ira = EXCLUDED.ira, mp = EXCLUDED.mp, atualizado_em = NOW()
        """
        params = [matricula, aluno_data.get("nome"), aluno_data.get("curso"), indices.get("ira"), indices.get("mp"), email_usuario]
        if email_usuario: sql += ", email = EXCLUDED.email"
        sql += " RETURNING id"
        
        cur.execute(sql, tuple(params))
        row = cur.fetchone()
        if row: aid = row['id'] if isinstance(row, dict) else row[0]
        else:
            cur.execute("SELECT id FROM alunos WHERE matricula=%s", (matricula,))
            row = cur.fetchone()
            aid = row['id'] if isinstance(row, dict) else row[0]

        cur.execute("DELETE FROM disciplinas_cursadas WHERE aluno_id = %s", (aid,))
        for m in materias:
            cur.execute("""
                INSERT INTO disciplinas_cursadas (aluno_id, periodo, codigo, nome, creditos, mencao, status, professor)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (aid, m.get("periodo"), m.get("codigo"), m.get("nome"), m.get("creditos") or m.get("ch"), m.get("situacao") or m.get("mencao"), m.get("status"), m.get("professor")))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e

@app.route("/api/aluno", methods=["GET"])
def get_aluno_data():
    email = request.args.get("email")
    if not email: return jsonify({"error": "Email required"}), 400
    
    conn = get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM alunos WHERE email = %s", (email,))
        aluno = cur.fetchone()
        if not aluno: return jsonify({"error": "Aluno not found"}), 404
        
        cur.execute("SELECT periodo, codigo, nome, creditos, mencao as situacao, status, professor FROM disciplinas_cursadas WHERE aluno_id = %s ORDER BY periodo DESC", (aluno['id'],))
        materias = cur.fetchall()
        
        cur.execute("SELECT integralizacao, ch_acumulada FROM integralizacoes_semestre WHERE aluno_id = %s ORDER BY periodo DESC LIMIT 1", (aluno['id'],))
        integ = cur.fetchone() or {}
        
        return jsonify({
            "aluno": {"nome": aluno['nome'], "matricula": aluno['matricula'], "curso": aluno['curso']},
            "indices": {"ira": aluno['ira'], "mp": aluno['mp']},
            "curriculo": {"materias": materias, "integralizacao": integ.get('integralizacao', 0), "ch_integralizada": integ.get('ch_acumulada', 0), "ch_exigida": aluno['ch_exigida']}
        })
    finally:
        conn.close()

@app.route("/upload", methods=["POST"])
def upload_pdf():
    f = request.files.get("file")
    email = request.form.get("email")
    if not f: return jsonify({"error": "No file"}), 400
    
    fname = secure_filename(f.filename)
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], f"{os.path.splitext(fname)[0]}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf")
    f.save(save_path)
    
    try:
        dados = parse_basico(save_path)
        conn = get_db()
        upsert(conn, dados, save_path, email)
        conn.close()
        
        try:
            recalcular_tudo()
            from scripts.preencher_estatisticas_disciplinas import preencher_estatisticas_disciplinas; preencher_estatisticas_disciplinas()
            from scripts.gerar_estatisticas_agregadas import gerar_estatisticas_agregadas; gerar_estatisticas_agregadas()
            from scripts.gerar_estatisticas_agregadas_professor import gerar_estatisticas_agregadas_professor; gerar_estatisticas_agregadas_professor()
        except: traceback.print_exc()
        
        return jsonify(dados)
    except Exception as e:
        # LOG SEGURO
        logging.error(f"Erro processamento PDF: {traceback.format_exc()}")
        return jsonify({"error": "Falha ao processar o PDF."}), 500

@app.route("/", methods=["GET"])
def home(): return render_template("index.html", status="ok")

@app.route("/api/estatisticas/<codigo>", methods=["GET"])
def estatisticas(codigo):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM estatisticas_disciplinas_agregadas WHERE codigo=%s", (codigo,))
    row = cur.fetchone()
    conn.close()
    if not row: return jsonify({"error": "Not found"}), 404
    return jsonify({"codigo": row['codigo'], "nome": row['nome'], "media_integralizacao": row['media'], "total_alunos": row['total_alunos']})

@app.route("/api/ranking/<codigo>", methods=["GET"])
def ranking(codigo):
    prof = request.args.get("professor")
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    sql = "SELECT integralizacao_no_periodo FROM disciplinas_com_integralizacao WHERE codigo=%s"
    params = [codigo]
    if prof: 
        sql += " AND professor ILIKE %s"
        params.append(f"%{prof}%")
    sql += " ORDER BY integralizacao_no_periodo DESC"
    cur.execute(sql, tuple(params))
    rows = cur.fetchall()
    conn.close()
    return jsonify([{"posicao": i+1, "integralizacao": f"{float(r['integralizacao_no_periodo'] or 0):.2f}%"} for i, r in enumerate(rows)])

@app.route("/api/chat", methods=["POST"])
def chat_unbot():
    try:
        data = request.json
        history = data.get("history", [])
        last_user_msg = history[-1]["parts"][0]["text"] if history else ""
        resposta = "Desculpe, ainda estou aprendendo sobre a UnB."
        if "IRA" in last_user_msg.upper(): resposta = "O IRA é a média ponderada das notas."
        elif "INTEGRALIZAÇÃO" in last_user_msg.upper(): resposta = "A integralização é o percentual do curso concluído."
        elif "FATO" in last_user_msg.upper(): resposta = "A UnB foi inaugurada em 1962."
        return jsonify({"text": resposta})
    except Exception as e:
        return jsonify({"error": "Erro interno"}), 500

if __name__ == "__main__":
    # --- CORREÇÃO DE SEGURANÇA: FORCE DEBUG=FALSE ---
    app.run(host="0.0.0.0", port=5000, debug=False)