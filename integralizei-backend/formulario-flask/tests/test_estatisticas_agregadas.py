import sqlite3
from datetime import datetime
from pathlib import Path

import pytest

from scripts.gerar_estatisticas_agregadas import gerar_estatisticas_agregadas


@pytest.fixture
def db_path(tmp_path: Path) -> str:
    """
    Cria um SQLite temporário com o schema mínimo para testar
    gerar_estatisticas_agregadas.
    """
    db_file = tmp_path / "estatisticas.db"
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()

    # Tabela de origem
    cur.execute(
        """
        CREATE TABLE estatisticas_disciplinas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT,
            nome TEXT,
            media_integralizacao REAL
        )
        """
    )

    # Tabela de destino (agregada) – com atualizado_em
    cur.execute(
        """
        CREATE TABLE estatisticas_disciplinas_agregadas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT,
            nome TEXT,
            media INTEGER,
            min_integralizacao INTEGER,
            max_integralizacao INTEGER,
            total_alunos INTEGER,
            atualizado_em TEXT
        )
        """
    )

    conn.commit()
    conn.close()
    return str(db_file)


def test_gerar_estatisticas_agregadas_agrupa_e_calcula_corretamente(db_path: str):
    """
    Verifica se:
      - agrupa por código
      - calcula média, min, max e total_alunos corretamente
      - preenche atualizado_em com um datetime em formato %Y-%m-%d %H:%M:%S
    """
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Dados de teste — escolhi valores que não dão .5 pra evitar dúvida de arredondamento
    dados = [
        ("FGA0001", "Cálculo 1", 10.0),
        ("FGA0001", "Cálculo 1", 20.0),
        ("FGA0001", "Cálculo 1", 30.0),
        ("FGA0002", "Álgebra Linear", 5.0),
        ("FGA0002", "Álgebra Linear", 15.0),
    ]
    cur.executemany(
        """
        INSERT INTO estatisticas_disciplinas (codigo, nome, media_integralizacao)
        VALUES (?, ?, ?)
        """,
        dados,
    )
    conn.commit()
    conn.close()

    # Executa a função alvo
    gerar_estatisticas_agregadas(db_path)

    # Verifica o que foi inserido na tabela agregada
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT codigo, nome, media, min_integralizacao, max_integralizacao,
               total_alunos, atualizado_em
        FROM estatisticas_disciplinas_agregadas
        ORDER BY codigo
        """
    )
    rows = cur.fetchall()
    conn.close()

    # Deve haver 2 linhas (uma por disciplina)
    assert len(rows) == 2

    # FGA0001
    cod1, nome1, media1, min1, max1, total1, atual1 = rows[0]
    assert cod1 == "FGA0001"
    assert nome1 == "Cálculo 1"
    # média de [10, 20, 30] = 20 → int(round(...)) = 20
    assert media1 == 20
    assert min1 == 10
    assert max1 == 30
    assert total1 == 3
    # atualizado_em deve ser um datetime parseável
    datetime.strptime(atual1, "%Y-%m-%d %H:%M:%S")

    # FGA0002
    cod2, nome2, media2, min2, max2, total2, atual2 = rows[1]
    assert cod2 == "FGA0002"
    assert nome2 == "Álgebra Linear"
    # média de [5, 15] = 10 → int(round(...)) = 10
    assert media2 == 10
    assert min2 == 5
    assert max2 == 15
    assert total2 == 2
    datetime.strptime(atual2, "%Y-%m-%d %H:%M:%S")


def test_gerar_estatisticas_agregadas_limpa_tabela_agregada_antes(db_path: str):
    """
    Garante que a função dá DELETE em estatisticas_disciplinas_agregadas
    antes de inserir os novos agregados.
    """
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Insere um registro antigo/lixo na tabela agregada
    cur.execute(
        """
        INSERT INTO estatisticas_disciplinas_agregadas
            (codigo, nome, media, min_integralizacao, max_integralizacao,
             total_alunos, atualizado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        ("OLD000", "Velha", 100, 100, 100, 1, "2024-01-01 00:00:00"),
    )

    # Insere um único dado real na tabela de origem
    cur.execute(
        """
        INSERT INTO estatisticas_disciplinas (codigo, nome, media_integralizacao)
        VALUES (?, ?, ?)
        """,
        ("FGA0001", "Cálculo 1", 42.0),
    )
    conn.commit()
    conn.close()

    # Roda a função
    gerar_estatisticas_agregadas(db_path)

    # Agora só deve existir o registro novo, o "OLD000" some
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT codigo, nome, media, min_integralizacao, max_integralizacao,
               total_alunos
        FROM estatisticas_disciplinas_agregadas
        """
    )
    rows = cur.fetchall()
    conn.close()

    assert len(rows) == 1
    cod, nome, media, min_v, max_v, total = rows[0]
    assert cod == "FGA0001"
    assert nome == "Cálculo 1"
    assert media == 42  # int(round(42.0))
    assert min_v == 42
    assert max_v == 42
    assert total == 1
