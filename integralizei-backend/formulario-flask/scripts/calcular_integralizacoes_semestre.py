# scripts/calcular_integralizacoes_semestre.py
# -*- coding: utf-8 -*-
import os
import sqlite3
from statistics import mean, median, pstdev
from typing import Dict, List, Optional, Tuple

# ---------------------------
# Configs
# ---------------------------
DEFAULT_CH_EXIGIDA = 3480
APR_MENC = {"SS", "MS", "MM", "APROVADO", "EQV"}
APR_STATUS = {"APR", "CUMP", "EQV"}


# ---------------------------
# Helpers de período
# ---------------------------
def norm_periodo(p: Optional[str]) -> Optional[str]:
    """Normaliza '2024.1' / '2024-1' / '2024\\1' -> '2024/1'."""
    if not p:
        return None
    p = p.strip().replace("\\", "/").replace(".", "/").replace("-", "/")
    # Esperado: YYYY/1 ou YYYY/2
    return p


def periodo_key(p: str) -> Tuple[int, int]:
    """Chave ordenável para 'YYYY/1'."""
    try:
        ano = int(p[:4])
        sem = int(p[5:6])
        return (ano, sem)
    except Exception:
        return (9999, 9)


def periodo_anterior(p: str) -> Optional[str]:
    """Retorna o período imediatamente anterior (ex.: 2024/1 -> 2023/2)."""
    try:
        ano = int(p[:4])
        sem = int(p[5:6])
        if sem == 1:
            return f"{ano - 1}/2"
        return f"{ano}/1"
    except Exception:
        return None


# ---------------------------
# Cálculo de integralização por semestre
# ---------------------------
def calcular_integralizacao_semestre_para_aluno(
    cur: sqlite3.Cursor, aluno_id: int, ch_exigida: int
):
    """
    Lê disciplinas do aluno, acumula CH aprovada e grava em integralizacoes_semestre
    um registro por período, com ch_acumulada e % NO INÍCIO DO SEMESTRE.

    Ou seja:
    - 1º período do aluno: ch_acumulada = 0, integralizacao = 0.0
    - Demais períodos: valor corresponde ao que o aluno tinha ao final do período anterior.
    """
    rows = cur.execute(
        """
        SELECT periodo, creditos, mencao, status
        FROM disciplinas_cursadas
        WHERE aluno_id = ?
        ORDER BY CAST(substr(periodo,1,4) AS INT),
                 CAST(substr(periodo,6,1) AS INT),
                 id
        """,
        (aluno_id,),
    ).fetchall()

    # Agrupar por período
    por_periodo: Dict[str, List[Tuple[Optional[int], Optional[str], Optional[str]]]] = (
        {}
    )
    for periodo, ch, mencao, status in rows:
        p = norm_periodo(periodo) or "-"
        por_periodo.setdefault(p, []).append(
            (ch, (mencao or "").upper(), (status or "").upper())
        )

    total_ch = 0  # CH acumulada ATÉ o início do período corrente
    inserts = []

    for p in sorted(por_periodo.keys(), key=periodo_key):
        # 1) Primeiro gravamos o estado NO INÍCIO DO PERÍODO p
        perc_inicio = round(100.0 * total_ch / (ch_exigida or DEFAULT_CH_EXIGIDA), 2)
        inserts.append((aluno_id, p, total_ch, perc_inicio))

        # 2) Depois somamos a CH aprovada DO PRÓPRIO PERÍODO p,
        #    para que isso reflita no início do próximo período.
        for ch, mencao, status in por_periodo[p]:
            if (mencao in APR_MENC) or (status in APR_STATUS):
                total_ch += int(ch or 0)

    # limpa antigos e insere novos
    cur.execute("DELETE FROM integralizacoes_semestre WHERE aluno_id = ?", (aluno_id,))
    if inserts:
        cur.executemany(
            """
            INSERT INTO integralizacoes_semestre
                (aluno_id, periodo, ch_acumulada, integralizacao)
            VALUES (?, ?, ?, ?)
            """,
            inserts,
        )


def calcular_integralizacoes_semestre(conn: sqlite3.Connection):
    cur = conn.cursor()
    alunos = cur.execute(
        "SELECT id, COALESCE(ch_exigida, ?) FROM alunos", (DEFAULT_CH_EXIGIDA,)
    ).fetchall()
    for aluno_id, ch_exigida in alunos:
        calcular_integralizacao_semestre_para_aluno(cur, aluno_id, int(ch_exigida))
    conn.commit()


# ---------------------------
# Estatísticas por disciplina (usando t0 = integralização NO INÍCIO do semestre)
# ---------------------------
def integralizacao_t0_do_aluno_no_periodo(
    cur: sqlite3.Cursor, aluno_id: int, periodo: str
) -> float:
    """
    t0 = integralização NO INÍCIO do próprio período.
    Como a tabela integralizacoes_semestre agora guarda o estado inicial,
    basta ler o registro daquele período. Se não existir, assume 0.0.
    """
    p_norm = norm_periodo(periodo)
    if not p_norm:
        return 0.0

    row = cur.execute(
        """
        SELECT integralizacao
        FROM integralizacoes_semestre
        WHERE aluno_id = ? AND periodo = ?
        """,
        (aluno_id, p_norm),
    ).fetchone()

    if row and row[0] is not None:
        return float(row[0])
    return 0.0


def calcular_estatisticas_disciplinas(conn: sqlite3.Connection, min_n: int = 3):
    """
    Para cada disciplina, coleta a integralização t0 dos alunos que a cursaram
    (t0 = percentual de integralização NO INÍCIO do semestre da disciplina).
    Grava média, mediana, desvio e N em estatisticas_disciplinas.
    - min_n: limiar mínimo de amostras para gravar (evita ruído).
    """
    cur = conn.cursor()
    cur.execute("DELETE FROM estatisticas_disciplinas")

    # Pega (disciplina, aluno, periodo) para calcular t0
    rows = cur.execute(
        """
        SELECT d.codigo,
               COALESCE(d.nome, d.codigo) AS nome,
               d.aluno_id,
               d.periodo
        FROM disciplinas_cursadas d
        """
    ).fetchall()

    buckets: Dict[Tuple[str, str], List[float]] = {}
    for codigo, nome, aluno_id, periodo in rows:
        p = norm_periodo(periodo) or "-"
        t0 = integralizacao_t0_do_aluno_no_periodo(cur, int(aluno_id), p)
        buckets.setdefault((codigo, nome), []).append(t0)

    inserts = []
    for (codigo, nome), vals in buckets.items():
        vals = [float(x) for x in vals if x is not None]
        n = len(vals)
        if n < min_n:
            # Se desejar, pode gravar mesmo assim. Aqui filtramos para qualidade.
            continue
        m = round(mean(vals), 2)
        med = round(median(vals), 2)
        dp = round(pstdev(vals), 2) if n > 1 else 0.0
        inserts.append((codigo, nome, m, med, dp, n))

    if inserts:
        cur.executemany(
            """
            INSERT INTO estatisticas_disciplinas
                (codigo, nome,
                 media_integralizacao,
                 mediana_integralizacao,
                 desvio_padrao,
                 total_alunos)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            inserts,
        )

    conn.commit()


def recalcular_tudo(db_path: str, min_n: int = 3):
    conn = sqlite3.connect(db_path)
    try:
        conn.execute("PRAGMA foreign_keys=ON;")
        conn.execute("PRAGMA journal_mode=WAL;")
        calcular_integralizacoes_semestre(conn)
        calcular_estatisticas_disciplinas(conn, min_n=min_n)
    finally:
        conn.close()


# ---------------------------
# Execução direta via CLI
# ---------------------------
if __name__ == "__main__":
    # Detecta DB em ./instance/integralizei.db por padrão
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DB_DEFAULT = os.path.join(os.path.dirname(BASE_DIR), "instance", "integralizei.db")
    db = os.environ.get("DB_PATH", DB_DEFAULT)
    print(f"[Integralizei] Recalculando integralizações e estatísticas em: {db}")
    recalcular_tudo(db)
    print("[Integralizei] OK.")
