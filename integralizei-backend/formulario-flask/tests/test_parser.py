import pytest
from unittest.mock import patch
from parsers.unb_historico import parse_basico

TEXTO_FALSO = """
2024.1 COMPUTAÇÃO BÁSICA
Dr. Professor Ignorado (60h)
01 APRCIC0004 60 100,0 MS

2024.1 CÁLCULO 1
MSc. Outro Professor (90h)
02 APRMAT0025 90 90,0 SS

Componentes Curriculares
Exigido 3480h Integralizado 150h
"""

@patch('parsers.unb_historico.extract_any')
def test_parser_basico_funciona(mock_extract):
    
    mock_extract.return_value = TEXTO_FALSO

   
    resultado = parse_basico("caminho_falso.pdf")

    
    assert resultado['aluno'] is not None
    materias = resultado['curriculo']['materias']
    
   
    assert len(materias) >= 1
    
   
    m1 = materias[0]
    assert m1['codigo'] == 'CIC0004'
    assert m1['nome'] == 'COMPUTAÇÃO BÁSICA'
    assert m1['situacao'] == 'MS'