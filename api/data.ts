import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL || '');

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY DEFAULT 'default',
      employees JSONB NOT NULL DEFAULT '[]',
      schedule JSONB NOT NULL DEFAULT '{}',
      templates JSONB NOT NULL DEFAULT '[]',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    INSERT INTO app_state (id, employees, schedule, templates)
    VALUES ('default', '[]', '{}', '[]')
    ON CONFLICT (id) DO NOTHING
  `;
}

export default async function handler(req: Request): Promise<Response> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return new Response(
      JSON.stringify({ error: 'POSTGRES_URL oder DATABASE_URL fehlt' }),
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

  try {
    await ensureTable();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: `Init: ${msg}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT employees, schedule, templates
        FROM app_state
        WHERE id = 'default'
        LIMIT 1
      `;
      const row = rows[0] as { employees: unknown; schedule: unknown; templates: unknown } | undefined;
      const employees = Array.isArray(row?.employees) ? row.employees : [];
      const schedule = row?.schedule && typeof row.schedule === 'object' && !Array.isArray(row.schedule) ? row.schedule : {};
      const templates = Array.isArray(row?.templates) ? row.templates : [];
      return new Response(JSON.stringify({ employees, schedule, templates }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json() as { employees: unknown; schedule: unknown; templates: unknown };
      const employees = Array.isArray(body.employees) ? body.employees : [];
      const schedule = body.schedule && typeof body.schedule === 'object' && !Array.isArray(body.schedule) ? body.schedule : {};
      const templates = Array.isArray(body.templates) ? body.templates : [];

      await sql`
        UPDATE app_state
        SET employees = ${JSON.stringify(employees)}::jsonb,
            schedule = ${JSON.stringify(schedule)}::jsonb,
            templates = ${JSON.stringify(templates)}::jsonb,
            updated_at = NOW()
        WHERE id = 'default'
      `;

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
