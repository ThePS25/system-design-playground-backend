# DesignScape — Backend

Node.js + Express + TypeScript API.

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 6+ (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Setup

```bash
cp .env.example .env
# Edit .env with your MONGODB_URI

npm install
npm run seed    # Requires MongoDB running
npm run dev     # http://localhost:4000
```

### Verify

```bash
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/v1/templates
curl http://localhost:4000/api/v1/components
curl http://localhost:4000/api/v1/challenges
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run seed` | Seed MongoDB (development) |
| `npm run seed:prod` | Seed MongoDB (production build) |

## API Endpoints

Base URL: `http://localhost:4000/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/templates` | List architecture templates |
| GET | `/templates/:id` | Get template (ID or slug) |
| GET | `/components` | List components |
| GET | `/components/:id` | Get component detail |
| GET | `/challenges` | List design challenges |
| GET | `/challenges/:id` | Get challenge detail |
| POST | `/challenge/validate` | Validate architecture submission |
| POST | `/simulation` | Run traffic simulation |
| POST | `/cost/calculate` | Calculate infrastructure cost |
| POST | `/saved-designs` | Save a design |
| GET | `/saved-designs` | List saved designs |

See [`../docs/API-CONTRACTS.md`](../docs/API-CONTRACTS.md) for full request/response schemas.

## Seed Data

| Collection | Count |
|------------|-------|
| Components | 14 |
| Architecture Templates | 8 |
| Challenges | 5 |

Templates: Twitter, WhatsApp, Netflix, YouTube, Instagram, Uber, URL Shortener, Google Drive.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `4000`; Render sets automatically) |
| `MONGODB_URI` | MongoDB connection string |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated |
| `NODE_ENV` | `development` or `production` |

## Production Deployment (Render)

1. Connect this repo to [Render](https://render.com) (Blueprint uses `render.yaml`).
2. Set `MONGODB_URI` and `CORS_ORIGIN` in the Render dashboard.
3. After first deploy, seed the database: `npm run seed:prod` (Render Shell or locally against Atlas).
4. Health check: `GET /api/v1/health` → `"database": "connected"`.

Full step-by-step guide: [`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md)

## Architecture

```
Routes → Controllers → Services → Repositories → Models
                              ↘ Engines (simulation, challenge, cost)
```

See [`../docs/PHASE-1-ARCHITECTURE.md`](../docs/PHASE-1-ARCHITECTURE.md) for full design docs.
