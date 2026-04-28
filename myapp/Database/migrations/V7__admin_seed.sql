BEGIN;

INSERT INTO admin_user (full_name, email, password_hash)
VALUES (
  'Admin',
  'admin@saiscientifics.com',
  crypt('Admin@123', gen_salt('bf'))
);

COMMIT;
