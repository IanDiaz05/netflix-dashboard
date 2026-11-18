# Frontend

React + TypeScript + Vite app for the Netflix catalog analytics dashboard.

```bash
cp .env.example .env
pnpm install
pnpm dev
pnpm typecheck
```

`VITE_API_BASE_URL` points at the future FastAPI server. Until that API exists, `dashboardService` returns unresolved promises and pages stay on skeleton states.

Project conventions: see `../docs/ARCHITECTURE.md`.
