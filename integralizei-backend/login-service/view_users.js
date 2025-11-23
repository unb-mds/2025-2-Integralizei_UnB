import { getDB } from "./db.js";

async function main() {
  const db = await getDB();
  const rows = await db.all(`
    SELECT id, name, email, password_hash, created_at, updated_at
    FROM users
    ORDER BY id
  `);
  if (!rows.length) {
    console.log("Nenhum usuário encontrado.");
  } else {
    console.table(rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      password_hash: r.password_hash,
      created_at: r.created_at,
      updated_at: r.updated_at
    })));
  }
  await db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
