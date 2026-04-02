import { createClient } from '@supabase/supabase-js';

export default async function handler(_req: Request): Promise<Response> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { error } = await supabase.from('Arbeitsplan').upsert(
      {
        id: 'default',
        employees: [],
        schedule: {},
        templates: [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) throw error;

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
