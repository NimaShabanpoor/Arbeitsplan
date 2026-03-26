import mysql from 'mysql2/promise';

function getConnection() {
  const url = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (!url) throw new Error('DATABASE_URL oder MYSQL_URL fehlt');
  return mysql.createConnection(url);
}

async function ensureTable(conn: Awaited<ReturnType<typeof mysql.createConnection>>) {
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
}

export default async function handler(req: Request): Promise<Response> {
  if (!process.env.DATABASE_URL && !process.env.MYSQL_URL) {
    return new Response(
      JSON.stringify({ error: 'DATABASE_URL oder MYSQL_URL fehlt' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let conn: Awaited<ReturnType<typeof mysql.createConnection>> | null = null;

  try {
    conn = await getConnection();
    await ensureTable(conn);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: `Init: ${msg}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    if (req.method === 'GET') {
      const [rows] = await conn!.execute(
        'SELECT employees, schedule, templates FROM app_state WHERE id = ? LIMIT 1',
        ['default']
      );
      const row = (rows as { employees: unknown; schedule: unknown; templates: unknown }[])[0];
      const employees = Array.isArray(row?.employees) ? row.employees : (typeof row?.employees === 'string' ? JSON.parse(row.employees || '[]') : []);
      const schedule = row?.schedule && typeof row.schedule === 'object' && !Array.isArray(row.schedule) ? row.schedule : (typeof row?.schedule === 'string' ? JSON.parse(row.schedule || '{}') : {});
      const templates = Array.isArray(row?.templates) ? row.templates : (typeof row?.templates === 'string' ? JSON.parse(row.templates || '[]') : []);
      await conn!.end();
      return new Response(JSON.stringify({ employees, schedule, templates }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = (await req.json()) as { employees: unknown; schedule: unknown; templates: unknown };
      const employees = Array.isArray(body.employees) ? body.employees : [];
      const schedule = body.schedule && typeof body.schedule === 'object' && !Array.isArray(body.schedule) ? body.schedule : {};
      const templates = Array.isArray(body.templates) ? body.templates : [];

      await conn!.execute(
        `UPDATE app_state SET employees = ?, schedule = ?, templates = ?, updated_at = NOW() WHERE id = ?`,
        [JSON.stringify(employees), JSON.stringify(schedule), JSON.stringify(templates), 'default']
      );
      await conn!.end();
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await conn!.end();
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (conn) await conn.end().catch(() => {});
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
