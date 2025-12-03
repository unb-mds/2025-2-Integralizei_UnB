# Migração de SQLite para PostgreSQL no Integralizei UnB

Este documento descreve o processo de migração do banco de dados do projeto **Integralizei UnB** de **SQLite** (arquivo local) para **PostgreSQL** rodando em um contêiner Docker.

## 1. Antes da migração

### 1.1. Como era o cenário com SQLite

- O backend Flask utilizava um **arquivo SQLite** (como `instance/historico.db`).
- A string de conexão era:
  ```
  SQLALCHEMY_DATABASE_URI=sqlite:///instance/historico.db
  ```
- As tabelas eram criadas diretamente no arquivo.

Limitações:
- Uso local
- Dificuldade de escalonar
- Conexões concorrentes limitadas

---

## 2. Novo cenário com PostgreSQL (via Docker)

### 2.1. Docker Compose utilizado
**Exemplo:**

```yaml
services:
  db:
    image: postgres:16
    container_name: integralizei_postgres
    environment:
      POSTGRES_USER: integralizei_usuario
      POSTGRES_PASSWORD: ********
      POSTGRES_DB: integralizei_db
    ports:
      - "5432:5432"
    volumes:
      - integralizei_pg_data:/var/lib/postgresql/data
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4:8
    container_name: integralizei_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@meuservidor.com (
      PGADMIN_DEFAULT_PASSWORD: ********
    ports:
      - "5050:80"
    depends_on:
      - db
    restart: unless-stopped

volumes:
  integralizei_pg_data:
```

---

## 3. Subindo o ambiente

```
docker compose up -d
```

- PostgreSQL disponível em `localhost:5432`
- pgAdmin em `localhost:5050`

---

## 4. Criação do schema no PostgreSQL

As tabelas foram reescritas em PostgreSQL usando tipos equivalentes. Exemplos:

```sql
CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    matricula TEXT UNIQUE NOT NULL,
    nome TEXT,
    curso TEXT,
    ch_exigida INTEGER DEFAULT 3480,
    ira REAL
);
```

```sql
CREATE TABLE IF NOT EXISTS disciplinas_cursadas (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL,
    periodo TEXT,
    codigo TEXT,
    nome TEXT,
    creditos INTEGER,
    mencao TEXT,
    status TEXT,
    criado_em TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);
```

---

## 5. Configuração do Flask

Antes:
```
SQLALCHEMY_DATABASE_URI=sqlite:///instance/historico.db
```

Depois:
```
SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://integralizei_usuario:SENHA@localhost:5432/integralizei_db
```

Dependência necessária:
```
psycopg2-binary
```

---

## 6. Migração dos dados

Processo:

1. Conectar ao SQLite.
2. Conectar ao PostgreSQL.
3. Ler dados das tabelas SQLite.
4. Inserir nos equivalentes do PostgreSQL.
5. Garantir integridade referencial.

Exemplo de inserção:

```python
cur_pg.execute(
    '''
    INSERT INTO alunos (matricula, nome, curso, ch_exigida, ira)
    VALUES (%s, %s, %s, %s, %s)
    ON CONFLICT (matricula) DO NOTHING
    ''',
    (matricula, nome, curso, ch_exigida, ira)
)
```

---

## 7. Rodando o projeto agora

```
docker compose up -d
flask run
```

---

## 9. Observações finais

- Nunca versionar senhas reais.
- Usar arquivo `.env` no gitignore.
- Variáveis de ambiente devem ser usadas em produção.

---
