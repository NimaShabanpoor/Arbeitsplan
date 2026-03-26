import mysql from 'mysql2/promise';

export default async function handler(_req: Request): Promise<Response> {
  if (!process.env.DATABASE_URL && !process.env.MYSQL_URL) {
    return new Response(
      JSON.stringify({ error: 'DATABASE_URL oder MYSQL_URL fehlt' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let conn: Awaited<ReturnType<typeof mysql.createConnection>> | null = null;
  try {
    const url = process.env.DATABASE_URL || process.env.MYSQL_URL;
    if (!url) throw new Error('DATABASE_URL oder MYSQL_URL fehlt');
    conn = await mysql.createConnection(url);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS app_state (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        employees JSON NOT NULL,
        schedule JSON NOT NULL,
        templates JSON NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(
      `INSERT IGNORE INTO app_state (id, employees, schedule, templates) VALUES ('default', '[]', '{}', '[]')`
    );
    await conn.end();
    return new Response(JSON.stringify({ ok: true, message: 'Tabelle erstellt' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (conn) await conn.end().catch(() => {});
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
