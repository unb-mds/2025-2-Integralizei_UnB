import sqlite3
import pytest

# Importa o app Flask do seu app.py
from app import app as flask_app
import app as app_module


@pytest.fixture
def db_path(tmp_path):
    """
    Cria o caminho de um banco SQLite temporário para cada teste.
    """
    db_file = tmp_path / "test.db"
    return str(db_file)


@pytest.fixture
def db_connection(db_path):
    """
    Abre uma conexão com o banco temporário.
    Use essa fixture quando quiser criar tabelas/popular dados direto.
    """
    conn = sqlite3.connect(db_path)
    yield conn
    conn.close()


@pytest.fixture
def app(db_path, monkeypatch):
    """
    Configura o Flask para usar o banco temporário,
    substituindo a função get_db() original por uma versão de teste.
    """

    def get_db_test():
        # chamada pelas rotas no lugar da get_db original
        conn = sqlite3.connect(db_path)
        return conn

    # troca app_module.get_db pela nossa versão de teste
    monkeypatch.setattr(app_module, "get_db", get_db_test)

    flask_app.config["TESTING"] = True
    yield flask_app


@pytest.fixture
def client(app):
    """
    Client de teste do Flask.
    Use nos testes assim: resp = client.get("/minha/rota")
    """
    return app.test_client()
