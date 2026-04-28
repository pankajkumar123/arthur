# Setup and Local Run

## Prerequisites
- Node.js 18+ with npm
- Git
- Docker Desktop (for database)
- Optional: Flyway CLI (if not using Docker Compose)

## Install dependencies
From the project root (myapp/):

```bash
npm install
```

## Run the React app (Vite)
```bash
npm run dev
```
This serves the React app at the Vite dev URL. The React app links to static HTML pages by path (for example /TopRowbanner.html).

## View static pages
Static HTML files live at the project root. You can:

1) Open the file directly in a browser (basic usage).
2) Run a simple static server for correct relative paths.

Example using a local static server:
```bash
npx serve .
```
Then open the page, for example:
- http://localhost:3000/TopRowbanner.html

## Lint
```bash
npm run lint
```

## Backend API (Node + Express)
From myapp/server:

```bash
npm install
npm run dev
```

The API runs at http://localhost:4000 by default.

## Database (local)
```bash
cd Database
docker compose up -d postgres
docker compose run --rm flyway
```
See DATABASE.md for details and troubleshooting.
