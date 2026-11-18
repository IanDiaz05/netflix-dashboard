# Netflix catalog analytics dashboard

Interactive dashboard for exploring a Netflix content catalog: production trends, genre mix, and geographic distribution over time.

The project is in Phase 1 (scaffolding, documentation, and API/type contracts). UI charts and FastAPI endpoints are not implemented yet.

## Architecture

Three layers:

- Frontend: React + TypeScript + Vite (this repository, `frontend/`), intended for Vercel.
- Backend: FastAPI REST API (planned, `backend/`).
- Database: PostgreSQL (planned).

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md), [docs/UI_GUIDELINES.md](docs/UI_GUIDELINES.md).

## Frontend local setup

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

Typecheck:

```bash
pnpm typecheck
```

## Team

- Ian Diaz | 230301007
- Emiliano Burgos | 230300973
