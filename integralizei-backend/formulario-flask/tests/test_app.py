import io
import sqlite3
from pathlib import Path
from unittest.mock import patch

import pytest

import app as app_module
from app import app as flask_app, get_db


# =============================
# FIXTURE — Banco temporário
# =============================


@pytest.fixture
def temp_db(tmp_path: Path, monkeypatch):
    """
    Redireciona app.DB_PATH para um SQLite temporário
    e deixa o próprio get_db() criar o schema real.
    """
    db_file = tmp_path / "temp.db"

    # troca o DB_PATH lá dentro do módulo app
    monkeypatch.setattr(app_module, "DB_PATH", str(db_file))

    # força criação das tabelas com o schema oficial
    conn = get_db()
    conn.close()

    # devolve o caminho caso algum teste queira inspecionar direto
    yield str(db_file)


# =============================
# FIXTURE — Cliente de teste Flask
# =============================


@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    return flask_app.test_client()


# =============================
# TESTE — Rota HOME "/"
# =============================


def test_home_route(client):
    r = client.get("/")
    assert r.status_code == 200
    # verifica se veio o HTML esperado (title ou h1)
    assert b"Enviar Hist" in r.data


# =============================
# TESTE — GET /api/estatisticas/<codigo>
# =============================


def test_api_estatisticas_not_found(client, temp_db):
    """
    Se a disciplina não existir na tabela estatisticas_disciplinas_agregadas,
    deve retornar 404.
    """
    r = client.get("/api/estatisticas/FGA0001")
    assert r.status_code == 404


def test_api_estatisticas_found(client, temp_db):
    """
    Insere manualmente um registro na tabela agregada
    e verifica se o endpoint retorna corretamente.
    """
    conn = sqlite3.connect(app_module.DB_PATH)
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO estatisticas_disciplinas_agregadas
        (codigo, nome, media, min_integralizacao, max_integralizacao, total_alunos, atualizado_em)
        VALUES ('FGA0161', 'Algoritmos', 50, 20, 90, 10, '2024-01-01 00:00:00')
        """
    )
    conn.commit()
    conn.close()

    r = client.get("/api/estatisticas/FGA0161")
    assert r.status_code == 200

    data = r.get_json()
    assert data["codigo"] == "FGA0161"
    assert data["media_integralizacao"] == 50
    assert data["faixa_integralizacao"]["min"] == 20
    assert data["faixa_integralizacao"]["max"] == 90
    assert data["total_alunos"] == 10


# =============================
# TESTE — POST /upload
# =============================


def test_upload_retorna_erro_se_nao_for_pdf(client):
    r = client.post("/upload", data={"file": (io.BytesIO(b"testing"), "test.txt")})
    assert r.status_code == 400


@patch("app.parse_basico")
@patch("app.recalcular_tudo")
@patch("scripts.preencher_estatisticas_disciplinas.preencher_estatisticas_disciplinas")
@patch("scripts.gerar_estatisticas_agregadas.gerar_estatisticas_agregadas")
def test_upload_pdf_processa_fluxo(
    mock_agregado,
    mock_preencher,
    mock_recalcular,
    mock_parse,
    client,
    temp_db,
):
    """
    Testa:
    - upload de PDF válido
    - parse_basico mockado
    - chamadas subsequentes (recalcular_tudo, preencher_estatisticas, agregadas)
    - retorno JSON do parse
    """

    mock_parse.return_value = {
        "aluno": {"nome": "FULANO", "matricula": "202030001", "curso": "ENG SOFT"},
        "indices": {"ira": 3.5, "mp": 4.0},
        "curriculo": {
            "materias": [
                {
                    "periodo": "2024/1",
                    "codigo": "FGA0001",
                    "nome": "Cálculo",
                    "creditos": 60,
                    "situacao": "MS",
                    "status": "APR",
                }
            ],
            "integralizacao": 10.0,
            "ch_integralizada": 120,
            "ch_exigida": 3480,
        },
        "raw_text": "FAKE PDF",
    }

    # arquivo PDF fake
    data = {
        "file": (io.BytesIO(b"%PDF-1.4 fake"), "historico.pdf"),
    }

    r = client.post("/upload", data=data, content_type="multipart/form-data")

    assert r.status_code == 200

    # parse_basico foi chamado
    mock_parse.assert_called_once()

    # scripts subsequentes foram chamados
    mock_recalcular.assert_called_once()
    mock_preencher.assert_called_once()
    mock_agregado.assert_called_once()

    # JSON retornado é o resultado do parse
    resp = r.get_json()
    assert resp["aluno"]["nome"] == "FULANO"
    assert resp["aluno"]["matricula"] == "202030001"
