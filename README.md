# Arbeitsplan Benedict

Dienstplan-App für Mitarbeitende. Gemeinsame Datenbank – Änderungen sind für alle sichtbar.

## PostgreSQL (Vercel + Neon)

1. **Neon-Datenbank verbinden**  
   - Im Vercel-Projekt: **Storage** → **Create Database** → **Neon (Postgres)**  
   - Oder: [Vercel Marketplace](https://vercel.com/marketplace) → Neon → Integration hinzufügen

2. **Umgebungsvariablen**  
   Nach dem Hinzufügen setzt Vercel automatisch z. B. `POSTGRES_URL` oder `DATABASE_URL`.

3. **Erster Aufruf**  
   Die Tabelle wird beim ersten API-Aufruf automatisch angelegt.

4. **Lokal entwickeln**  
   - Ohne DB: Die App nutzt weiterhin `localStorage` als Fallback.  
   - Mit DB: `.env.local` mit `POSTGRES_URL` anlegen und `vercel dev` verwenden.

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
