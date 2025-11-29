import pytest
from unittest.mock import patch

from parsers.unb_historico import (
    pegar_nome,
    pegar_matricula,
    pegar_curso,
    pegar_ira_mp,
    extrair_materias,
    pegar_totais_painel,
    total_exigido_por_curso,
    calcular_integralizacao,
    parse_basico,
)


# =========================
#   Campos básicos
# =========================


def test_pegar_nome_funciona_com_nome_simples():
    texto = "Alguma coisa\nNome : Fulano de Tal da Silva\nOutra linha"
    assert pegar_nome(texto) == "Fulano de Tal da Silva"


def test_pegar_matricula_remove_pontos_e_tracos():
    texto = "xxx\nMatrícula: 20.123.456-7\nzzz"
    assert pegar_matricula(texto) == "201234567"


def test_pegar_curso_retorna_curso_limpo():
    texto = "Algo\nCurso: ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO - UnB\nMais"
    assert (
        pegar_curso(texto)
        == "ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO - UnB"
    )


def test_pegar_ira_mp_encontra_ambos():
    texto = "IRA: 3,27   MP: 4,50"
    ira, mp = pegar_ira_mp(texto)
    assert ira == pytest.approx(3.27)
    assert mp == pytest.approx(4.50)


# =========================
#   extrair_materias
# =========================


def test_extrair_materias_layout_3_linhas_e_linha_direta():
    """
    Monta um texto com:
      - 1 disciplina no layout 3 linhas
      - 1 disciplina em linha direta
      - 1 entrada ENADE que deve ser ignorada
    """
    texto = """
    2024.1 ALGORITMOS E PROGRAMAÇÃO
    Profa. X (60h)
    09 APRFGA0161 60 96,0 MS*

    ALGORITMOS E PROGRAMAÇÃO 2
    2024.1 * FGA0162 60 02 96,0 SS APR

    2023.2 ENADE SISTEMAS DE INFORMAÇÃO
    01 APRCEP0001 0 0,0 MM*
    """

    materias = extrair_materias(texto)

    # ENADE não deve entrar
    assert len(materias) == 2

    m1 = materias[0]
    assert m1["periodo"] == "2024.1"
    assert m1["codigo"] == "FGA0161"
    assert m1["nome"] == "ALGORITMOS E PROGRAMAÇÃO"
    assert m1["creditos"] == 60
    assert m1["situacao"] == "MS"  # menção
    assert m1["status"] == "APR"

    m2 = materias[1]
    assert m2["periodo"] == "2024/1"  # DIRECT_RX troca . por /
    assert m2["codigo"] == "FGA0162"
    assert m2["nome"] == "ALGORITMOS E PROGRAMAÇÃO 2"
    assert m2["creditos"] == 60
    assert m2["situacao"] == "SS"
    assert m2["status"] == "APR"


# =========================
#   Painel de CH
# =========================


def test_pegar_totais_painel_encontra_exigido_e_integralizado():
    texto = """
    Carga Horária
    Exigido 3480 h  Integralizado 1200 h
    Algumas outras coisas no meio
    """
    exigido, integralizado = pegar_totais_painel(texto)
    assert exigido == 3480
    assert integralizado == 1200


def test_total_exigido_por_curso_usa_default_do_dict():
    curso = "ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO"
    assert total_exigido_por_curso(curso) == 3480


def test_total_exigido_por_curso_desconhecido_retorna_none():
    assert total_exigido_por_curso("CURSO QUE NÃO EXISTE") is None


# =========================
#   calcular_integralizacao
# =========================


def test_calcular_integralizacao_usa_painel_quando_disponivel():
    texto = "Exigido 3480 h   Integralizado 1200 h"
    materias = []  # não importa, pois o painel já traz integrado
    curso = "ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO"

    perc, ch_int, ch_exigida = calcular_integralizacao(texto, curso, materias)

    assert ch_exigida == 3480
    assert ch_int == 1200
    assert perc == pytest.approx(34.48, rel=1e-3)  # 1200 / 3480 * 100


def test_calcular_integralizacao_fallback_soma_ch_aprovadas_e_usa_default_curso():
    texto = "sem painel aqui"
    curso = "ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO"
    materias = [
        {"creditos": 60, "situacao": "MS", "status": "APR"},   # conta (menção MS)
        {"creditos": 60, "situacao": "MI", "status": "REP"},   # não conta
        {"creditos": 60, "situacao": "SS", "status": "MATR"},  # conta (menção SS)
        {"creditos": 60, "situacao": "-", "status": "CUMP"},   # conta (status CUMP)
    ]

    perc, ch_int, ch_exigida = calcular_integralizacao(texto, curso, materias)

    # 3 matérias contam → 3 * 60 = 180h
    assert ch_int == 180
    assert ch_exigida == 3480
    assert perc == pytest.approx(5.17, rel=1e-3)  # 180 / 3480 * 100


# =========================
#   parse_basico (com extract_any mockado)
# =========================


def test_parse_basico_integra_campos_basicos_materias_e_integralizacao():
    raw_fake = """
    Nome : Fulano da Silva
    Matrícula: 20.123.456-7
    Curso: ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO
    IRA: 3,28   MP: 4,50

    Carga Horária
    Exigido 3480 h   Integralizado 120 h

    2024.1 ALGORITMOS E PROGRAMAÇÃO
    Profa. X (60h)
    09 APRFGA0161 60 96,0 MS*
    """

    with patch("parsers.unb_historico.extract_any", return_value=raw_fake):
        data = parse_basico("fake.pdf")

    aluno = data["aluno"]
    indices = data["indices"]
    curr = data["curriculo"]

    # aluno
    assert aluno["nome"] == "Fulano da Silva"
    assert aluno["matricula"] == "201234567"
    assert (
        aluno["curso"] == "ENGENHARIA DE SOFTWARE/FCTE - BACHARELADO - DIURNO"
    )

    # índices
    assert indices["ira"] == pytest.approx(3.28)
    assert indices["mp"] == pytest.approx(4.50)

    # currículo / integralização
    assert curr["ch_exigida"] == 3480
    assert curr["ch_integralizada"] == 120
    assert curr["integralizacao"] == pytest.approx(3.45, rel=1e-3)

    # matérias
    materias = curr["materias"]
    assert len(materias) == 1
    m = materias[0]
    assert m["codigo"] == "FGA0161"
    assert m["creditos"] == 60
    assert m["situacao"] == "MS"
    assert m["status"] == "APR"
