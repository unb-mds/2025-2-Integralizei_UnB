def test_exemplo_usa_fixture(db_path):
    # Se esse teste rodar, o conftest.py foi carregado
    # e a fixture db_path existe.
    assert db_path.endswith(".db")
