# Security Notes

## Data protection
- Do not store raw passwords. Use a strong hash (argon2 or bcrypt).
- Use HTTPS everywhere in production.
- Add input validation and server-side sanitization.

## Access control
- Use row-level security for customer data.
- Separate admin and customer roles.

## Operational controls
- Rotate secrets regularly.
- Add rate limiting and audit logging.
- Monitor webhook endpoints for abuse.
