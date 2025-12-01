import pytest
from unittest.mock import MagicMock, patch

@patch('setup_db.get_pg_conn')
def test_setup_db_cria_tabelas(mock_get_conn):
    from setup_db import create_tables
    
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_conn.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    create_tables()

    assert mock_cursor.execute.call_count > 0
    
    mock_conn.commit.assert_called_once()
    mock_conn.close.assert_called_once()

@patch('reset_db.get_pg_conn')
def test_reset_db_limpa_tabelas(mock_get_conn):
    from reset_db import reset_database
    
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_get_conn.return_value = mock_conn
    mock_conn.cursor.return_value = mock_cursor

    reset_database()


    chamadas = [args[0] for args, _ in mock_cursor.execute.call_args_list]
    
    tem_drop = any("DROP TABLE" in cmd for cmd in chamadas)
    assert tem_drop