import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt' }),
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

  const supabase = getSupabase();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('app_state')
        .select('employees, schedule, templates')
        .eq('id', 'default')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      const row = data || { employees: [], schedule: {}, templates: [] };
      const employees = Array.isArray(row.employees) ? row.employees : [];
      const schedule = row.schedule && typeof row.schedule === 'object' && !Array.isArray(row.schedule) ? row.schedule : {};
      const templates = Array.isArray(row.templates) ? row.templates : [];
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

      const { error } = await supabase
        .from('app_state')
        .upsert(
          {
            id: 'default',
            employees,
            schedule,
            templates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      if (error) throw error;
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
