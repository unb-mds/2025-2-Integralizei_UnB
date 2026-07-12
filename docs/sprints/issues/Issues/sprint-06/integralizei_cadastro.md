# Autenticação & Cadastro — Integralizei UnB

## Visão geral

O módulo de autenticação implementa:
- Cadastro de usuário com **hash seguro de senha** (sem armazenar senha em texto puro).
- Login com verificação do **hash**.
- Persistência em **SQLite** (`integralizei.db`), com índice de performance em `email`.

Banco: arquivo local `./integralizei.db` (ou `./instance/integralizei.db` em projetos Flask; aqui usamos **Node**).  

---

## Stack e dependências

- **Node.js** LTS (>= 18)
- **SQLite** embutido (arquivo `.db`)
- Pacotes NPM principais:
  - `sqlite3` — driver nativo
  - `sqlite` — wrapper com `open()`/`db.exec()`
  - `bcrypt` — hash de senha (ou `argon2`, se preferir)
  - `express` — servidor HTTP
### Instalação
```bash
npm init -y
npm i express sqlite3 sqlite bcrypt dotenv zod
```
> Se aparecer **“No matching version found for `sqlite@^5.1.6`”**, apenas use `npm i sqlite` sem travar numa versão inexistente (ou use uma versão estável disponível, p.ex. `npm i sqlite@latest`).

---

## Esquema do banco (criação automática)

Arquivo: `db.js`
```js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function getDB() {
  const db = await open({
    filename: "./integralizei.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  return db;
}
```

**Notas de projeto**
- `password_hash` guarda **apenas** o hash (ex.: bcrypt).
- `updated_at` pode ser atualizado via trigger ou na aplicação em cada update.

---

## Exemplo de implementação (trechos)

### `auth.controller.js`
```js
import bcrypt from "bcrypt";
import { getDB } from "./db.js";

const SALT_ROUNDS = 10;

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Campos obrigatórios: name, email, password." });
    }

    const db = await getDB();

    // verifica se já existe
    const exists = await db.get("SELECT id FROM users WHERE email = ?", [email]);
    if (exists) {
      return res.status(409).json({ error: "Email já cadastrado." });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await db.run(
      `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
      [name, email, password_hash]
    );

    const user = await db.get("SELECT id, name, email, created_at FROM users WHERE id = ?", [result.lastID]);
    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Campos obrigatórios: email, password." });
    }

    const db = await getDB();
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas." });

    // TODO: emitir JWT/cookie de sessão
    return res.status(200).json({ message: "Login bem-sucedido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
```

### `app.js` (roteador mínimo)
```js
import express from "express";
import { register, login } from "./auth.controller.js";

const app = express();
app.use(express.json());

app.post("/auth/register", register);
app.post("/auth/login", login);

// Somente em desenvolvimento:
app.get("/users", async (req, res) => {
  const { getDB } = await import("./db.js");
  const db = await getDB();
  const rows = await db.all("SELECT id, name, email, password_hash, created_at FROM users");
  res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP on http://localhost:${PORT}`));
```

---

## Estrutura de pastas

```
Integralizei-Cadatro&Login
├── node_modules/              # Dependências do Node.js
├── public/                    # Recursos públicos (frontend)
│   └── login/
│       ├── css/
│       │   └── style.css      # Estilos da interface
│       ├── js/
│       │   ├── login.js       # Lógica de login (requisições, validação)
│       │   └── register.js    # Lógica de cadastro
│       ├── index.html         # Tela inicial (login)
│       ├── register.html      # Página de cadastro
│       └── dashboard.html     # Painel do usuário logado
│
├── db.js                      # Conexão e criação do banco SQLite
├── integralizei.db            # Banco de dados local (SQLite)
├── package.json               # Configuração do Node.js (dependências, scripts)
├── server.js                  # Servidor Express 
└── view_users.js              # Script para visualizar usuários cadastrados (modo dev)

```

## Melhorias futuras
- Implementar Login com conta google
- Criar tela de redefinição de senha
- Adicionar logs e tratamento de erros

