import sqlite3
import pytest

from app import app as flask_app
import app as app_module


@pytest.fixture
def db_path(tmp_path):
    db_file = tmp_path / "test.db"
    return str(db_file)


@pytest.fixture
def db_connection(db_path):
    conn = sqlite3.connect(db_path)
    yield conn
    conn.close()


@pytest.fixture
def app(db_path, monkeypatch):
    def get_db_test():
        conn = sqlite3.connect(db_path)
        return conn

    monkeypatch.setattr(app_module, "get_db", get_db_test)

    flask_app.config["TESTING"] = True
    yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()
