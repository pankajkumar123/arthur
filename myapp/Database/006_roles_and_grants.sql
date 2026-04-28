-- Role and grant setup for app/read/admin roles

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_admin') THEN
        CREATE ROLE app_admin LOGIN PASSWORD 'change_me_admin';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user LOGIN PASSWORD 'change_me_app';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_readonly') THEN
        CREATE ROLE app_readonly LOGIN PASSWORD 'change_me_read';
    END IF;

    -- Keep app roles RLS-safe by default
    ALTER ROLE app_user NOBYPASSRLS;
    ALTER ROLE app_readonly NOBYPASSRLS;
    ALTER ROLE app_admin BYPASSRLS;
END $$;

GRANT CONNECT ON DATABASE current_database() TO app_admin, app_user, app_readonly;

-- Split grants by schema for clarity and future expansion
DO $$
DECLARE
    schema_name TEXT;
BEGIN
    FOREACH schema_name IN ARRAY ARRAY['public']
    LOOP
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO app_admin, app_user, app_readonly', schema_name);

        EXECUTE format('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA %I TO app_admin', schema_name);
        EXECUTE format('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA %I TO app_admin', schema_name);

        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO app_user', schema_name);
        EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA %I TO app_user', schema_name);

        EXECUTE format('GRANT SELECT ON ALL TABLES IN SCHEMA %I TO app_readonly', schema_name);
        EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA %I TO app_readonly', schema_name);

        EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL PRIVILEGES ON TABLES TO app_admin', schema_name);
        EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user', schema_name);
        EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT SELECT ON TABLES TO app_readonly', schema_name);
    END LOOP;
END $$;

COMMIT;
