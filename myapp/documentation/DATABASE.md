# Database Setup

## Overview
The database is PostgreSQL, with Flyway migrations stored in Database/migrations.

## Local setup
```bash
cd Database
docker compose up -d postgres
docker compose run --rm flyway
```

## Configuration
- Flyway settings: Database/flyway.conf
- Migrations: Database/migrations/V4__reset_schema.sql, V5__seed_data.sql, V6__admin_auth.sql, V7__admin_seed.sql

## Important
V4__reset_schema.sql drops existing tables to rebuild the schema from scratch. Use only in development or fresh environments.

## Notes
- RLS templates are in Docs/RLS_POLICIES.md.
- Schema planning notes are in Docs/DB_PLANNING.md.
- Use versioned migrations only; avoid manual edits in production.
