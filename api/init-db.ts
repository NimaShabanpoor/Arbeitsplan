import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL || '');

export default async function handler(_req: Request): Promise<Response> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return new Response(
      JSON.stringify({ error: 'POSTGRES_URL oder DATABASE_URL fehlt' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
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
    return new Response(JSON.stringify({ ok: true, message: 'Tabelle erstellt' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
