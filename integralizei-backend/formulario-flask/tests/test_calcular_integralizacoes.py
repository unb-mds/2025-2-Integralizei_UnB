import sqlite3
from pathlib import Path

import pytest

from scripts.calcular_integralizacoes_semestre import (
    DEFAULT_CH_EXIGIDA,
    norm_periodo,
    periodo_key,
    periodo_anterior,
    calcular_integralizacao_semestre_para_aluno,
    calcular_integralizacoes_semestre,
    integralizacao_t0_do_aluno_no_periodo,
    calcular_estatisticas_disciplinas,
    recalcular_tudo,
)


# =========================
#   Helpers de período
# =========================


def test_norm_periodo_normaliza_formatos_basicos():
    assert norm_periodo("2024.1") == "2024/1"
    assert norm_periodo("2024-2") == "2024/2"
    assert norm_periodo("2024\\1") == "2024/1"
    assert norm_periodo("2024/1") == "2024/1"
    assert norm_periodo(None) is None


def test_periodo_key_gera_tuplas_ordenaveis():
    assert periodo_key("2024/1") == (2024, 1)
    assert periodo_key("2023/2") == (2023, 2)
    # Se vier formato estranho, devolve fallback
    assert periodo_key("xyz") == (9999, 9)


def test_periodo_anterior_funciona_para_1_e_2():
    assert periodo_anterior("2024/1") == "2023/2"
    assert periodo_anterior("2024/2") == "2024/1"
    # formato inválido devolve None
    assert periodo_anterior("abc") is None


# =========================
#   Fixture de banco em disco com schema mínimo
# =========================


@pytest.fixture
def conn(tmp_path: Path):
    """Cria um DB SQLite com o schema mínimo usado por esse script."""
    db_path = tmp_path / "test_integralizacoes.db"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Tabela de alunos
    cur.execute(
        """
        CREATE TABLE alunos (
            id INTEGER PRIMARY KEY,
            ch_exigida INTEGER
        )
        """
    )

    # Tabela de disciplinas cursadas
    cur.execute(
        """
        CREATE TABLE disciplinas_cursadas (
            id INTEGER PRIMARY KEY,
            aluno_id INTEGER,
            periodo TEXT,
            creditos INTEGER,
            mencao TEXT,
            status TEXT,
            codigo TEXT,
            nome TEXT
        )
        """
    )

    # Tabela de integralizacoes por semestre
    cur.execute(
        """
        CREATE TABLE integralizacoes_semestre (
            id INTEGER PRIMARY KEY,
            aluno_id INTEGER,
            periodo TEXT,
            ch_acumulada INTEGER,
            integralizacao REAL
        )
        """
    )

    # Tabela de estatísticas por disciplina
    cur.execute(
        """
        CREATE TABLE estatisticas_disciplinas (
            id INTEGER PRIMARY KEY,
            codigo TEXT,
            nome TEXT,
            media_integralizacao REAL,
            mediana_integralizacao REAL,
            desvio_padrao REAL,
            total_alunos INTEGER
        )
        """
    )

    conn.commit()
    yield conn
    conn.close()


# =========================
#   calcular_integralizacao_semestre_para_aluno
# =========================


def test_calcular_integralizacao_semestre_para_aluno_acumula_por_periodo(conn):
    """
    Cenário:
        - ch_exigida = 300
        - 2024.1: 2 disciplinas (1 aprovada de 60h, 1 reprovada)
        - 2024.2: 1 disciplina aprovada de 60h
        - 2025.1: 1 disciplina com status CUMP (conta) de 60h

    Esperado:
        - 2024/1: ch_acumulada = 0,   integralizacao = 0.0
        - 2024/2: ch_acumulada = 60,  integralizacao = 20.0
        - 2025/1: ch_acumulada = 120, integralizacao = 40.0
    """
    cur = conn.cursor()

    aluno_id = 1
    ch_exigida = 300

    # Inserir disciplinas do aluno 1
    disciplinas = [
        # id, aluno_id, periodo, creditos, mencao, status, codigo, nome
        (1, aluno_id, "2024.1", 60, "MS", "APR", "FGA0001", "X"),
        (2, aluno_id, "2024.1", 60, "MI", "REP", "FGA0002", "Y"),  # não conta
        (3, aluno_id, "2024.2", 60, "SS", "APR", "FGA0003", "Z"),
        (4, aluno_id, "2025.1", 60, "-", "CUMP", "FGA0004", "W"),  # status conta
    ]
    cur.executemany(
        """
        INSERT INTO disciplinas_cursadas
            (id, aluno_id, periodo, creditos, mencao, status, codigo, nome)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        disciplinas,
    )
    conn.commit()

    calcular_integralizacao_semestre_para_aluno(cur, aluno_id, ch_exigida)

    rows = cur.execute(
        """
        SELECT periodo, ch_acumulada, integralizacao
        FROM integralizacoes_semestre
        WHERE aluno_id = ?
        ORDER BY periodo
        """,
        (aluno_id,),
    ).fetchall()

    assert len(rows) == 3

    # Garantir que os valores batem
    assert rows[0] == ("2024/1", 0, pytest.approx(0.0))
    assert rows[1] == ("2024/2", 60, pytest.approx(20.0))
    assert rows[2] == ("2025/1", 120, pytest.approx(40.0))


# =========================
#   calcular_integralizacoes_semestre
# =========================


def test_calcular_integralizacoes_semestre_roda_para_todos_os_alunos(conn):
    cur = conn.cursor()

    # Dois alunos: um com ch_exigida nula (usa DEFAULT), outro com valor próprio
    cur.executemany(
        "INSERT INTO alunos (id, ch_exigida) VALUES (?, ?)",
        [
            (1, None),
            (2, 200),
        ],
    )

    # Ambos com uma disciplina aprovada de 60h em 2024.1
    cur.executemany(
        """
        INSERT INTO disciplinas_cursadas
            (aluno_id, periodo, creditos, mencao, status, codigo, nome)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (1, "2024.1", 60, "MS", "APR", "FGA0001", "X"),
            (2, "2024.1", 60, "MS", "APR", "FGA0001", "X"),
        ],
    )
    conn.commit()

    calcular_integralizacoes_semestre(conn)

    rows = cur.execute(
        """
        SELECT aluno_id, periodo, ch_acumulada, integralizacao
        FROM integralizacoes_semestre
        ORDER BY aluno_id, periodo
        """
    ).fetchall()

    # Deve ter 1 linha por aluno (só temos um período)
    assert len(rows) == 2

    # Aluno 1: usa DEFAULT_CH_EXIGIDA
    aluno1 = rows[0]
    assert aluno1[0] == 1
    assert aluno1[1] == "2024/1"
    assert aluno1[2] == 0  # no início do 1º período é sempre 0
    # integralização é 0 no início do primeiro período, independentemente do CH exigida
    assert aluno1[3] == pytest.approx(0.0)

    # Aluno 2: idem
    aluno2 = rows[1]
    assert aluno2[0] == 2
    assert aluno2[1] == "2024/1"
    assert aluno2[2] == 0
    assert aluno2[3] == pytest.approx(0.0)


# =========================
#   integralizacao_t0_do_aluno_no_periodo
# =========================


def test_integralizacao_t0_do_aluno_no_periodo_busca_valor_ou_zero(conn):
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO integralizacoes_semestre
            (aluno_id, periodo, ch_acumulada, integralizacao)
        VALUES (?, ?, ?, ?)
        """,
        (1, "2024/1", 120, 10.5),
    )
    conn.commit()

    # Deve achar o valor para o período normalizado
    val = integralizacao_t0_do_aluno_no_periodo(cur, 1, "2024.1")
    assert val == pytest.approx(10.5)

    # Período sem registro retorna 0.0
    val2 = integralizacao_t0_do_aluno_no_periodo(cur, 1, "2023.2")
    assert val2 == 0.0


# =========================
#   calcular_estatisticas_disciplinas
# =========================


def test_calcular_estatisticas_disciplinas_calcula_media_mediana_dp(conn):
    cur = conn.cursor()

    # integralizacoes_semestre: t0 por aluno no período 2024/1
    cur.executemany(
        """
        INSERT INTO integralizacoes_semestre
            (aluno_id, periodo, ch_acumulada, integralizacao)
        VALUES (?, ?, ?, ?)
        """,
        [
            (1, "2024/1", 0, 10.0),
            (2, "2024/1", 0, 30.0),
            (3, "2024/1", 0, 50.0),
        ],
    )

    # disciplinas_cursadas: mesma disciplina para 3 alunos no mesmo período
    cur.executemany(
        """
        INSERT INTO disciplinas_cursadas
            (aluno_id, periodo, creditos, mencao, status, codigo, nome)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (1, "2024.1", 60, "MS", "APR", "FGA0001", "Cálculo"),
            (2, "2024.1", 60, "MS", "APR", "FGA0001", "Cálculo"),
            (3, "2024.1", 60, "MS", "APR", "FGA0001", "Cálculo"),
        ],
    )
    conn.commit()

    calcular_estatisticas_disciplinas(conn, min_n=3)

    rows = cur.execute(
        """
        SELECT codigo, nome,
               media_integralizacao,
               mediana_integralizacao,
               desvio_padrao,
               total_alunos
        FROM estatisticas_disciplinas
        """
    ).fetchall()

    assert len(rows) == 1
    codigo, nome, media, mediana, dp, n = rows[0]

    assert codigo == "FGA0001"
    assert nome == "Cálculo"
    assert media == pytest.approx(30.0)   # (10 + 30 + 50) / 3
    assert mediana == pytest.approx(30.0)
    # dp populacional de [10, 30, 50] ≈ 16.33
    assert dp == pytest.approx(16.33, rel=1e-2)
    assert n == 3


def test_calcular_estatisticas_disciplinas_respeita_min_n(conn):
    cur = conn.cursor()

    # Só 2 alunos → abaixo do min_n=3
    cur.executemany(
        """
        INSERT INTO integralizacoes_semestre
            (aluno_id, periodo, ch_acumulada, integralizacao)
        VALUES (?, ?, ?, ?)
        """,
        [
            (1, "2024/1", 0, 10.0),
            (2, "2024/1", 0, 30.0),
        ],
    )

    cur.executemany(
        """
        INSERT INTO disciplinas_cursadas
            (aluno_id, periodo, creditos, mencao, status, codigo, nome)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (1, "2024.1", 60, "MS", "APR", "FGA0001", "Cálculo"),
            (2, "2024.1", 60, "MS", "APR", "FGA0001", "Cálculo"),
        ],
    )
    conn.commit()

    calcular_estatisticas_disciplinas(conn, min_n=3)

    rows = cur.execute("SELECT COUNT(*) FROM estatisticas_disciplinas").fetchone()
    assert rows[0] == 0  # nada gravado porque n < min_n


# =========================
#   recalcular_tudo
# =========================


def test_recalcular_tudo_integra_fluxo_completo(tmp_path: Path):
    """
    Cria um DB real em disco, povoa alunos + disciplinas e chama
    recalcular_tudo(db_path). Depois verifica se as tabelas
    integralizacoes_semestre e estatisticas_disciplinas foram preenchidas.
    """
    db_path = tmp_path / "recalc.db"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Schema
    cur.executescript(
        """
        CREATE TABLE alunos (
            id INTEGER PRIMARY KEY,
            ch_exigida INTEGER
        );

        CREATE TABLE disciplinas_cursadas (
            id INTEGER PRIMARY KEY,
            aluno_id INTEGER,
            periodo TEXT,
            creditos INTEGER,
            mencao TEXT,
            status TEXT,
            codigo TEXT,
            nome TEXT
        );

        CREATE TABLE integralizacoes_semestre (
            id INTEGER PRIMARY KEY,
            aluno_id INTEGER,
            periodo TEXT,
            ch_acumulada INTEGER,
            integralizacao REAL
        );

        CREATE TABLE estatisticas_disciplinas (
            id INTEGER PRIMARY KEY,
            codigo TEXT,
            nome TEXT,
            media_integralizacao REAL,
            mediana_integralizacao REAL,
            desvio_padrao REAL,
            total_alunos INTEGER
        );
        """
    )

    # Um aluno com ch_exigida padrão
    cur.execute(
        "INSERT INTO alunos (id, ch_exigida) VALUES (?, ?)",
        (1, None),
    )

    # Esse aluno cursou 2 períodos
    cur.executemany(
        """
        INSERT INTO disciplinas_cursadas
            (aluno_id, periodo, creditos, mencao, status, codigo, nome)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (1, "2024.1", 60, "MS", "APR", "FGA0001", "Cálculo"),
            (1, "2024.2", 60, "MS", "APR", "FGA0001", "Cálculo"),
        ],
    )

    conn.commit()
    conn.close()

    # Executa o fluxo completo
    recalcular_tudo(str(db_path), min_n=1)

    # Reabre e checa resultados
    conn2 = sqlite3.connect(db_path)
    cur2 = conn2.cursor()

    n_int = cur2.execute(
        "SELECT COUNT(*) FROM integralizacoes_semestre"
    ).fetchone()[0]
    n_est = cur2.execute(
        "SELECT COUNT(*) FROM estatisticas_disciplinas"
    ).fetchone()[0]

    conn2.close()

    assert n_int > 0
    assert n_est > 0
