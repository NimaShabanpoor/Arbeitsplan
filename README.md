# Arbeitsplan Benedict

Dienstplan-App für Mitarbeitende. Gemeinsame Datenbank – Änderungen sind für alle sichtbar.

## MySQL-Datenbank

1. **MySQL verbinden**  
   - Beliebiger MySQL-Server (z. B. Railway, AWS RDS, DigitalOcean, eigener Server)  
   - PlanetScale: nutzt ein anderes Protokoll – evtl. separat konfigurieren

2. **Umgebungsvariablen**  
   In Vercel oder `.env.local` setzen:
   - `DATABASE_URL` oder `MYSQL_URL`  
   - Format: `mysql://user:pass@host/datenbank`

3. **Erster Aufruf**  
   Die Tabelle wird beim ersten API-Aufruf automatisch angelegt.

4. **Lokal entwickeln**  
   - Ohne DB: Die App nutzt `localStorage` als Fallback.  
   - Mit DB: `.env.local` mit `DATABASE_URL` anlegen und `vercel dev` verwenden.

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
