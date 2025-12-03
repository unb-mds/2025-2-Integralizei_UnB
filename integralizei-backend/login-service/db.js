import { Pool } from 'pg';

// Configuração da conexão usando as variáveis de ambiente do Docker
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Caso precise forçar SSL em produção no futuro:
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Função auxiliar para verificar se uma coluna existe em uma tabela.
 */
async function checkColumnExists(client, tableName, columnName) {
  try {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name=$1 AND column_name=$2;
    `;
    const result = await client.query(query, [tableName, columnName]);
    return result.rows.length > 0;
  } catch (e) {
    console.error(`Erro ao checar coluna ${columnName} na tabela ${tableName}:`, e.message);
    return false;
  }
}

export async function getDB() {
  // No Postgres com 'pg', usamos o pool para conectar
  const client = await pool.connect();

  try {
    // Inicia transação para garantir integridade na criação
    await client.query('BEGIN');

    // Criação da tabela adaptada para PostgreSQL
    // - INTEGER PRIMARY KEY AUTOINCREMENT -> SERIAL PRIMARY KEY
    // - datetime('now') -> NOW()
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        google_id TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Campos de redefinição de senha
        reset_token TEXT,
        reset_token_expires BIGINT 
      );
    `);
    
    // Índice
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    
    // --- Migrações Manuais (Verificações de Coluna) ---
    
    // 1. reset_token
    const tokenExists = await checkColumnExists(client, 'users', 'reset_token');
    if (!tokenExists) {
      console.log("MIGRATION: Adicionando coluna 'reset_token'...");
      await client.query("ALTER TABLE users ADD COLUMN reset_token TEXT");
    }

    // 2. reset_token_expires
    const expiresExists = await checkColumnExists(client, 'users', 'reset_token_expires');
    if (!expiresExists) {
      console.log("MIGRATION: Adicionando coluna 'reset_token_expires'...");
      // Nota: Em Postgres, INTEGER é pequeno para timestamp em milissegundos, usamos BIGINT
      await client.query("ALTER TABLE users ADD COLUMN reset_token_expires BIGINT");
    }

    // 3. Índice do token
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
    `);

    await client.query('COMMIT');
    
    // Retornamos o 'pool' ou o 'client'. 
    // Para manter compatibilidade com seu código antigo que devia fazer db.run/db.all,
    // o ideal seria refatorar as queries no resto do sistema, mas por agora retornamos o pool.
    // OBS: O resto do seu código (server.js) vai quebrar se usar sintaxe específica do SQLite driver.
    // O driver 'sqlite' usa db.get('sql', [params]). O 'pg' usa pool.query('sql', [params]).
    
    return pool; 

  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Erro ao iniciar DB:", e);
    throw e;
  } finally {
    client.release();
  }
}