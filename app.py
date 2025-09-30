import os
import json
import hashlib
import google.generativeai as genai
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB

load_dotenv(".env.local")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Chave da API Gemini não encontrada. Verifique o .env.local")

genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///dados.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


UPLOADS_FOLDER = os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER'])
os.makedirs(UPLOADS_FOLDER, exist_ok=True)

class History(db.Model):
    __tablename__ = "histories"
    id = db.Column(db.Integer, primary_key=True)
    file_hash = db.Column(db.String(64), unique=True, nullable=False, index=True)
    semestre_ingresso = db.Column(db.String(50))
    curso = db.Column(db.String(200))
    raw_json = db.Column(db.JSON().with_variant(JSONB, "postgresql"))  # JSONB no Postgres
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    disciplines = db.relationship("Discipline", backref="history", cascade="all, delete-orphan")

class Discipline(db.Model):
    __tablename__ = "disciplines"
    id = db.Column(db.Integer, primary_key=True)
    history_id = db.Column(db.Integer, db.ForeignKey("histories.id"), nullable=False)
    codigo = db.Column(db.String(50))
    nome = db.Column(db.String(255))
    mencao = db.Column(db.String(10))
    horas = db.Column(db.String(20))

with app.app_context():
    db.create_all()

def calculate_file_hash(file_path):
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

PROMPT = """
Analise o PDF de historico academico da UnB e extraia: semestre de ingresso, curso e uma lista de disciplinas.

Para cada disciplina, extraia:
- codigo
- nome
- mencao (SS, MS, MM, II, MI, SR, TR, TJ, DP)
- horas

Os nomes das disciplinas e do curso devem ser sem acentos.
Ignore notas numericas e dados pessoais. Retorne apenas JSON.

Estrutura do JSON:
{
  "semestre_ingresso": "SEMESTRE DE INGRESSO",
  "curso": "NOME DO CURSO SEM ACENTO",
  "disciplinas": [
    {
      "codigo": "CODIGO",
      "nome": "NOME DA DISCIPLINA SEM ACENTO",
      "mencao": "MENCAO",
      "horas": "HORAS"
    }
  ]
}
"""

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Processa o upload do arquivo, extrai dados e armazena no banco."""
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOADS_FOLDER, filename)
    file.save(filepath)

    try:
        file_hash = calculate_file_hash(filepath)
        existente = History.query.filter_by(file_hash=file_hash).first()
        if existente:
            os.remove(filepath)
            return jsonify({
                'message': 'Arquivo duplicado. Os dados ja foram armazenados.',
                'history_id': existente.id
            }), 200

        print(f"Uploading file {filename} to Gemini...")
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content([PROMPT, genai.upload_file(filepath)])

        raw_json_text = response.text.strip('`').strip()
        if raw_json_text.startswith('json'):
            raw_json_text = raw_json_text[4:].strip()

        extracted_data = json.loads(raw_json_text)

        hist = History(
            file_hash=file_hash,
            semestre_ingresso=extracted_data.get("semestre_ingresso"),
            curso=extracted_data.get("curso"),
            raw_json=extracted_data
        )
        db.session.add(hist)
        db.session.flush()  # pega hist.id

        for d in (extracted_data.get("disciplinas") or []):
            db.session.add(Discipline(
                history_id=hist.id,
                codigo=d.get("codigo"),
                nome=d.get("nome"),
                mencao=d.get("mencao"),
                horas=d.get("horas"),
            ))

        db.session.commit()

        os.remove(filepath)

        return jsonify({
            'message': 'Agradecemos sua contribuicao! Seu historico academico foi recebido com seguranca.',
            'history_id': hist.id
        }), 200

    except json.JSONDecodeError:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({
            'error': 'O arquivo enviado nao e um historico academico valido ou o formato nao pode ser lido. Por favor, envie um historico academico em formato PDF.'
        }), 500

    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)

        error_message = str(e)
        try:
            error_json = json.loads(error_message)
            if 'quota' in error_message or '429' in error_message:
                error_message = 'O limite de uso da API foi atingido. Por favor, tente novamente em alguns minutos.'
            else:
                error_message = error_json.get("error", error_message)
        except json.JSONDecodeError:
            pass

        return jsonify({'error': f"Erro interno do servidor: {error_message}"}), 500

@app.get('/histories')
def list_histories():
    rows = History.query.order_by(History.created_at.desc()).all()
    return jsonify([{
        "id": h.id,
        "file_hash": h.file_hash,
        "semestre_ingresso": h.semestre_ingresso,
        "curso": h.curso,
        "disciplinas_count": len(h.disciplines),
        "created_at": h.created_at.isoformat()
    } for h in rows])

@app.get('/histories/<int:hid>')
def get_history(hid):
    h = History.query.get_or_404(hid)
    return jsonify({
        "id": h.id,
        "file_hash": h.file_hash,
        "semestre_ingresso": h.semestre_ingresso,
        "curso": h.curso,
        "created_at": h.created_at.isoformat(),
        "disciplinas": [{
            "id": d.id, "codigo": d.codigo, "nome": d.nome, "mencao": d.mencao, "horas": d.horas
        } for d in h.disciplines],
        "raw_json": h.raw_json
    })

if __name__ == '__main__':
    app.run(debug=True, port=8080)
