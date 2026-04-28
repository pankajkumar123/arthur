# End-to-End Release Checklist

## Build and verify UI
- Review every static page for broken links and layout issues.
- Ensure shared header/footer links are consistent.
- Replace placeholder data with real API responses.

## Backend readiness
- Implement API endpoints listed in BACKEND_PLAN.md.
- Wire all forms to POST requests and handle responses.
- Implement authentication and session handling.
- Implement payment processing and webhooks.
- Implement file uploads.

## Database readiness
- Run all migrations in a clean environment.
- Seed required reference data.
- Validate RLS policies and user roles.

## Testing
- Run lint checks.
- Execute automated tests (unit + end-to-end).
- Perform manual flow checks for RFQ, cart, checkout, tracking, reviews, and support.

## Deployment
- Deploy frontend assets.
- Deploy backend and verify health checks.
- Run Flyway migrations in production.
- Smoke test critical flows.
