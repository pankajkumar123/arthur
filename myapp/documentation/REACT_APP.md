# React App Overview

## Current state
- The React app in src/ is a lightweight landing page that links to static HTML pages.
- There is no routing or page content in React beyond the link grid.
- Grievance.jsx exists but is not used in the React app.

## Options to finish
### Option A: Keep static pages + React landing
- Keep the React landing page as a hub for the static pages.
- Use a static server in production to host both the Vite build and HTML files.

### Option B: Migrate static pages into React
- Add routing (react-router or equivalent).
- Convert each static page into a React route/component.
- Replace direct DOM manipulation in JS files with React state and hooks.
- Standardize layout (header/footer) across routes.

## Suggested route map (if migrating)
- / : home
- /buy-on-credit
- /cart
- /help-centre
- /request-for-quotes
- /track-order
- /write-review
- /grievance

## Gaps to finish
- No API layer or data fetching.
- No state management for cart or user session.
- No forms wired to backend.
