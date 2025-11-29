import sqlite3
from pathlib import Path

import pytest

from scripts.preencher_estatisticas_disciplinas import (
    preencher_estatisticas_disciplinas,
)


@pytest.fixture
def db_path(tmp_path: Path) -> str:
    """
    Cria um SQLite temporário com o schema mínimo usado pelo script.
    """
    db_file = tmp_path / "test_preencher.db"
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()

    # Tabela disciplinas_cursadas
    cur.execute(
        """
        CREATE TABLE disciplinas_cursadas (
            id INTEGER PRIMARY KEY,
            aluno_id INTEGER,
            codigo TEXT,
            nome TEXT,
            mencao TEXT,
            creditos INTEGER,
            periodo TEXT
        )
        """
    )

    # Tabela disciplinas_com_integralizacao
    cur.execute(
        """
        CREATE TABLE disciplinas_com_integralizacao (
            id INTEGER PRIMARY KEY,
            disciplina_id INTEGER,
            integralizacao_no_periodo REAL
        )
        """
    )

    # Tabela final: estatisticas_disciplinas
    cur.execute(
        """
        CREATE TABLE estatisticas_disciplinas (
            id INTEGER PRIMARY KEY,
            aluno_id INTEGER,
            codigo TEXT,
            nome TEXT,
            mencao TEXT,
            creditos INTEGER,
            periodo TEXT,
            media_integralizacao REAL
        )
        """
    )

    conn.commit()
    conn.close()
    return str(db_file)


def test_preencher_estatisticas_insere_registros_corretamente(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Criar 2 disciplinas cursadas
    disciplinas = [
        (1, 10, "FGA0001", "Cálculo", "MS", 60, "2024/1"),
        (2, 10, "FGA0002", "Álgebra", "SS", 60, "2024/2"),
    ]
    cur.executemany(
        """
        INSERT INTO disciplinas_cursadas
            (id, aluno_id, codigo, nome, mencao, creditos, periodo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        disciplinas,
    )

    # Criar integralização associada — disciplina_id deve bater com ID da disciplina
    integr = [
        (1, 1, 42.5),
        (2, 2, 87.0),
    ]
    cur.executemany(
        """
        INSERT INTO disciplinas_com_integralizacao
            (id, disciplina_id, integralizacao_no_periodo)
        VALUES (?, ?, ?)
        """,
        integr,
    )

    conn.commit()
    conn.close()

    # Executar script
    preencher_estatisticas_disciplinas(db_path)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    rows = cur.execute(
        """
        SELECT aluno_id, codigo, nome, mencao, creditos, periodo, media_integralizacao
        FROM estatisticas_disciplinas
        ORDER BY codigo
        """
    ).fetchall()

    conn.close()

    assert len(rows) == 2

    # Primeiro registro — FGA0001
    r1 = rows[0]
    assert r1[0] == 10
    assert r1[1] == "FGA0001"
    assert r1[2] == "Cálculo"
    assert r1[3] == "MS"
    assert r1[4] == 60
    assert r1[5] == "2024/1"
    assert r1[6] == 42.5  # convertido para float

    # Segundo registro — FGA0002
    r2 = rows[1]
    assert r2[0] == 10
    assert r2[1] == "FGA0002"
    assert r2[2] == "Álgebra"
    assert r2[3] == "SS"
    assert r2[4] == 60
    assert r2[5] == "2024/2"
    assert r2[6] == 87.0


def test_preencher_estatisticas_limpa_tabela_antes(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Inserir lixo antigo
    cur.execute(
        """
        INSERT INTO estatisticas_disciplinas
            (aluno_id, codigo, nome, mencao, creditos, periodo, media_integralizacao)
        VALUES (999, 'LIXO', 'Velho', 'MS', 0, '2020/1', 100.0)
        """
    )

    # Inserir um único dado real para sobrescrever
    cur.execute(
        """
        INSERT INTO disciplinas_cursadas
            (id, aluno_id, codigo, nome, mencao, creditos, periodo)
        VALUES (1, 10, 'FGA1234', 'Teste', 'MS', 60, '2024/1')
        """
    )

    cur.execute(
        """
        INSERT INTO disciplinas_com_integralizacao
            (id, disciplina_id, integralizacao_no_periodo)
        VALUES (1, 1, 50.0)
        """
    )

    conn.commit()
    conn.close()

    # Rodar função
    preencher_estatisticas_disciplinas(db_path)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT aluno_id, codigo FROM estatisticas_disciplinas"
    ).fetchall()
    conn.close()

    # O registro LIXO deve ter sumido
    assert len(rows) == 1
    assert rows[0] == (10, "FGA1234")
