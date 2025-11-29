# db.py
import psycopg2
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD


def get_pg_conn():
    """
    Abre conexão com o PostgreSQL usando psycopg2.
    Retorna uma conexão com RealDictCursor.
    """
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )

