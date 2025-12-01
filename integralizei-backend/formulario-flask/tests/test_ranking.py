import os
from unittest.mock import MagicMock, patch
import pytest


os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_PORT", "5432")
os.environ.setdefault("DB_NAME", "teste_db")
os.environ.setdefault("DB_USER", "teste_user")
os.environ.setdefault("DB_PASSWORD", "teste_pass")

# O # noqa: E402 desativa o erro de "import não está no topo"
from app import app  # noqa: E402


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@patch("app.get_db")
def test_ranking_geral_retorna_200(mock_get_db, client):

    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [(0.85,), (0.70,)]

    response = client.get("/api/ranking/FGA0163")

    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 2
    assert data[0]["posicao"] == 1
    assert data[0]["integralizacao"] == "0.85%"


@patch("app.get_db")
def test_ranking_com_professor(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = []

    client.get("/api/ranking/FGA0163?professor=Luiza")

    args, _ = mock_cursor.execute.call_args
    sql_executado = args[0]

    assert "ILIKE %s" in sql_executado or "ilike %s" in sql_executado
