# Testing Plan

## Manual testing checklist
- Static pages load with no console errors.
- Forms validate required fields and show messages.
- Modals open/close via click, overlay, and Escape.
- Cart calculations update correctly.
- Tracking form updates timeline.
- Toast notifications appear and auto-dismiss.

## Automated testing (recommended)
- Unit tests for utilities and validation (Vitest or Jest).
- Component tests if migrating to React.
- End-to-end tests for main flows (Playwright or Cypress).

## Linting
```bash
npm run lint
```
