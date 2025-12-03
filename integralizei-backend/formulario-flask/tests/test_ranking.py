from unittest.mock import patch, MagicMock


@patch("app.get_db")
def test_ranking_geral_retorna_200(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    mock_cursor.fetchall.return_value = [
        {"integralizacao_no_periodo": 0.85},
        {"integralizacao_no_periodo": 0.70},
    ]

    response = client.get("/api/ranking/FGA0163")

    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["integralizacao"] == "0.85%"


@patch("app.get_db")
def test_ranking_com_filtro_professor(mock_get_db, client):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.fetchall.return_value = []

    response = client.get("/api/ranking/FGA0163?professor=Fabricio")
    assert response.status_code == 200

    args, _ = mock_cursor.execute.call_args
    sql_executed = args[0]
    assert "WHERE codigo=%s" in sql_executed
    assert "AND professor ILIKE %s" in sql_executed
