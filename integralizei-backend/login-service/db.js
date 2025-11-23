import sqlite3 from "sqlite3";
import { open } from "sqlite";

/**
 * Função auxiliar para verificar se uma coluna existe em uma tabela.
 */
async function checkColumnExists(db, tableName, columnName) {
  try {
    const result = await db.all(`PRAGMA table_info(${tableName})`);
    return result.some(col => col.name === columnName);
  } catch (e) {
    console.error(`Erro ao checar PRAGMA table_info para ${tableName}:`, e.message);
    return false; // Assume que não existe se a verificação falhar
  }
}

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
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      
      -- Campos de redefinição de senha
      reset_token TEXT,
      reset_token_expires INTEGER 
    );
    
    -- O índice do e-mail está OK para ficar aqui
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
  
  // --- Início da Migração ---
  
  // 1. Garante que a coluna 'reset_token' exista
  const tokenColumnExists = await checkColumnExists(db, 'users', 'reset_token');
  if (!tokenColumnExists) {
    console.log("MIGRATION: Adicionando coluna 'reset_token' na tabela 'users'...");
    try {
      await db.run("ALTER TABLE users ADD COLUMN reset_token TEXT");
      console.log("MIGRATION: Coluna 'reset_token' adicionada com sucesso.");
    } catch (e) {
      console.error("MIGRATION ERROR (reset_token):", e.message);
    }
  }

  // 2. Garante que a coluna 'reset_token_expires' exista
  const expiresColumnExists = await checkColumnExists(db, 'users', 'reset_token_expires');
  if (!expiresColumnExists) {
    console.log("MIGRATION: Adicionando coluna 'reset_token_expires' na tabela 'users'...");
    try {
      await db.run("ALTER TABLE users ADD COLUMN reset_token_expires INTEGER");
      console.log("MIGRATION: Coluna 'reset_token_expires' adicionada com sucesso.");
    } catch (e) {
      console.error("MIGRATION ERROR (reset_token_expires):", e.message);
    }
  }

  // 3. (CORREÇÃO) Cria o índice para 'reset_token' SOMENTE AGORA
  //    que temos certeza que a coluna existe.
  try {
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
    `);
  } catch (e) {
     console.error("MIGRATION ERROR (idx_users_reset_token):", e.message);
  }
  
  // --- Fim da Migração ---

  return db;
}

