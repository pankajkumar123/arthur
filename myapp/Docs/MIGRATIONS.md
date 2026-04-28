# Migration Tooling (Flyway)

This project uses Flyway with open-source defaults and file-based migrations.

## Folder Layout
- `Database/migrations` contains Flyway migration files.
- `Database/flyway.conf` provides local configuration defaults.

## Naming
Flyway expects `V<version>__<description>.sql`:
- `V1__init_schema.sql`
- `V2__seed_data.sql`

## Example Usage

```bash
flyway -configFiles=Database/flyway.conf migrate
```

## Notes
- The default `flyway.conf` targets the local Docker Compose database.
- Keep production migrations strictly forward-only; use rollback script only for local/dev.
