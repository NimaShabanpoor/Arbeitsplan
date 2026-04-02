# Arbeitsplan Benedict

Dienstplan-App für Mitarbeitende. Gemeinsame Datenbank – Änderungen sind für alle sichtbar.

## Supabase-Datenbank

1. **Supabase-Projekt erstellen**  
   - [Supabase](https://supabase.com) Projekt anlegen
   - SQL-Editor oeffnen und Tabelle `app_state` anlegen

2. **Umgebungsvariablen in Vercel setzen**  
   - `SUPABASE_URL`  
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Erster Aufruf**  
   - Endpoint `/api/init-db` kann den Default-Datensatz anlegen (`id = default`)

4. **Lokal entwickeln**  
   - Ohne DB: Die App nutzt `localStorage` als Fallback.  
   - Mit DB: `.env.local` mit `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` setzen und `vercel dev` verwenden.

## Entwicklung

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run build
```

Deploy auf Vercel per Git-Push oder Vercel CLI.
