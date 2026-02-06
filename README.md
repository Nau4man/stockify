# Stockify

Stockify is a React + Vite application that generates stock-photo metadata using Google Gemini.
It supports platform-specific output for Shutterstock and Adobe Stock, with CSV export, retry flows, and client-side draft recovery.

## Highlights

- Server-side Gemini API proxy (`/api/generate-metadata`) to avoid exposing API keys in client bundles
- Platform-aware metadata generation for Shutterstock and Adobe Stock
- Batch processing with progress tracking and retry support for failed items
- Client-side image compression and payload-size safeguards
- Draft persistence and preference storage in local storage
- Production-ready rate limiting (Upstash Redis), plus in-memory fallback for local development
- Error logging endpoint (`/api/log-error`) and health endpoint (`/api/health`)

## Tech Stack

- React 18
- Vite 7
- Vercel Serverless Functions
- Upstash Redis
- Vitest + Testing Library
- Tailwind CSS

## Quick Start (Local)

### Prerequisites

- Node.js 18+
- npm
- Google Gemini API key

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_real_key_here
```

For local development, `UPSTASH_*` variables are optional.

### 3) Start the local API server

```bash
npm run dev:api
```

Runs on `http://localhost:3001`.

### 4) Start the frontend app

In a second terminal:

```bash
npm start
```

Runs on `http://localhost:5173` by default.

### 5) Verify health

Open:

- `http://localhost:3001/api/health`

If `GEMINI_API_KEY` is missing, this endpoint returns `degraded`.

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | Start Vite dev server |
| `npm run dev:api` | Start local Node server for `/api/*` routes |
| `npm run dev:app` | Start Vite with debug logs |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest in interactive mode |
| `npm run test:run` | Run Vitest once |

## Environment Variables

| Variable | Required | Scope | Notes |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Local + Production | Required for metadata generation |
| `UPSTASH_REDIS_REST_URL` | Production | Server | Required in production for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Production | Server | Required in production for rate limiting |
| `REACT_APP_DEBUG` | No | Client build-time | Optional debug toggle |
| `REACT_APP_TITLE` | No | Client build-time | Optional app title |
| `REACT_APP_DESCRIPTION` | No | Client build-time | Optional app description |

Security note: do not use `REACT_APP_GEMINI_API_KEY`.

## API Endpoints

### `POST /api/generate-metadata`

- Accepts image payload + model + platform
- Validates payload and MIME type
- Applies rate limiting
- Calls Gemini and returns structured metadata or typed error responses

### `GET /api/health`

- Returns service health state
- In non-production, includes basic configuration checks

### `POST /api/log-error`

- Accepts batched client errors
- Validates payload size and shape
- Applies rate limiting
- Emits structured logs

## Supported Models

Current model keys:

- `gemini-3-flash-preview` (default)
- `gemini-3-flash`
- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`

## Supported Input Formats

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

## Architecture

```text
Client (React/Vite)
  -> /api/* (Vite proxy in local dev)
  -> Local API server (dev) or Vercel functions (prod)
  -> Google Gemini API
```

Key paths:

- `src/main.jsx` - app entry
- `src/App.jsx` - main UI orchestration
- `src/utils/geminiApi.js` - client API calls and preprocessing
- `api/generate-metadata.js` - server-side Gemini proxy
- `api/_utils/rateLimit.js` - rate-limit utility
- `scripts/dev-api-server.cjs` - local API server bootstrap

## Testing

```bash
npm run test:run
```

Current tests cover utility modules (CSV generation, storage, image compression).

## Deployment (Vercel)

Vercel is the primary deployment target.

1. Import repository in Vercel
2. Set environment variables:
   - `GEMINI_API_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Deploy

The project includes `vercel.json` for:

- Vite build output (`dist/`)
- Security headers (including CSP)
- Function runtime settings
- SPA rewrites

## Troubleshooting

### Metadata generation fails

- Check `GEMINI_API_KEY` in `.env.local`
- Confirm API server is running (`npm run dev:api`)
- Check `http://localhost:3001/api/health`

### 429 errors

- Model or endpoint is rate-limited
- Retry after the provided delay or switch model

### App cannot reach `/api`

- Ensure Vite is running with `npm start`
- Ensure API server is running on port `3001`

## Repository

- GitHub: `https://github.com/Nau4man/stockify`
- Issues: `https://github.com/Nau4man/stockify/issues`
- Support: GitHub Issues only (no email support)

Made with love by Nau4man.
