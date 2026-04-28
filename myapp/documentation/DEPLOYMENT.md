# Deployment Plan

For a provider-specific checklist, see PROD_DEPLOY.md.

## Frontend
### Static pages
- Host the static HTML pages on a static server (NGINX, S3, Netlify, or similar).
- Ensure base.css and ui-notify.js are available in the same root.

### React app
```bash
npm run build
```
Deploy the dist/ output to the same static host. Ensure routes map correctly to the static HTML files if both are served together.

## Backend
- Deploy the backend API (Node, Python, or another stack).
- Configure environment variables for database connection, auth secrets, and payment keys.

## Database
- Use a managed PostgreSQL service in production.
- Run Flyway migrations as part of the deployment pipeline.

## Observability
- Add logging, metrics, and error reporting.
- Monitor payment webhooks and notification delivery.
