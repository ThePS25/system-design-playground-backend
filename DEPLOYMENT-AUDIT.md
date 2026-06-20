# Backend Deployment Audit

**Project:** DesignScape API (`system-design-playground-backend`)  
**Date:** 2026-06-21  
**Render error:** `Cannot find module '/opt/render/project/src/dist/server.js'`

---

## Current Entry File

| Context | Path |
|---------|------|
| **Source (development)** | `src/server.ts` |
| **Compiled (production)** | `dist/server.js` |
| **package.json `main`** | `dist/server.js` |

The server bootstraps MongoDB, creates the Express app, and listens on `env.PORT` at `0.0.0.0`.

---

## Module System

| Setting | Value |
|---------|--------|
| **Language** | TypeScript |
| **Runtime module system** | **ESM** (`"type": "module"` in package.json) |
| **TS module** | `"module": "NodeNext"` (ESM output with `.js` import suffixes) |
| **Dev runner** | `tsx` (dev + seed only — not used in production start) |
| **Production runner** | `node` on compiled `dist/server.js` |
| **Build tool** | **`tsc`** (TypeScript compiler — not ts-node) |

This is **TypeScript + tsc build → ESM**, not CommonJS, not ts-node in production.

---

## Project Structure

```
system-design-playground-backend/
├── package.json          ← repo root (Render must use this as Root Directory)
├── tsconfig.json
├── render.yaml
├── scripts/
│   ├── verify-build.mjs  ← fails fast if dist/server.js missing
│   └── start-server.mjs  ← starts server from repo root (cwd-independent)
├── src/
│   ├── server.ts         ← source entrypoint
│   ├── app.ts
│   └── ...
└── dist/                 ← gitignored; created by `npm run build`
    └── server.js         ← production entrypoint
```

`dist/` is in `.gitignore` — it is **never committed**. Render **must** run `npm run build` on every deploy.

---

## Current Build Process

```json
"build": "tsc"
```

**tsconfig.json:**

| Option | Value | Effect |
|--------|-------|--------|
| `rootDir` | `./src` | Source root |
| `outDir` | `./dist` | Output at repo root `dist/`, **not** `src/dist/` |
| `include` | `src/**/*` | All app source |
| `exclude` | `node_modules`, `dist`, `src/scripts` | Dev test script excluded |

**Verified locally:** `tsc` produces `dist/server.js` with ESM `import` statements.

---

## Current Start Process

**Before fix:**

```json
"start": "node dist/server.js"
```

This resolves `dist/server.js` relative to **`process.cwd()`**, not relative to `package.json`.

**After fix:**

```json
"postbuild": "node scripts/verify-build.mjs",
"prestart": "node scripts/verify-build.mjs",
"start": "node scripts/start-server.mjs"
```

`start-server.mjs` resolves `dist/server.js` relative to the **repo root** (parent of `scripts/`) and sets `cwd` to repo root — works even if Render's working directory is wrong.

---

## Issue Found

### Primary root cause

Render's process working directory was **`/opt/render/project/src`** (Root Directory set to `src` in dashboard, or equivalent misconfiguration).

When start runs `node dist/server.js`, Node resolves:

```
/opt/render/project/src/ + dist/server.js
→ /opt/render/project/src/dist/server.js  ❌ does not exist
```

The actual build output is:

```
/opt/render/project/dist/server.js  ✅ created by tsc
```

### Secondary risk

With `NODE_ENV=production`, `npm ci` can skip `devDependencies`. TypeScript was moved to `dependencies` so `tsc` is always available during Render builds. Build command uses `npm ci --include=dev` for `@types/*` as well.

---

### Secondary issue (also fixed)

`src/seed/data/pricing.json` is read at runtime by the cost engine but is **not emitted by `tsc`**. Without copying it to `dist/seed/data/`, the server crashes on boot after `dist/server.js` is found. Fixed via `scripts/copy-static-assets.mjs` in `postbuild`.

---

## Required Fix

### Code (applied)

1. **`scripts/start-server.mjs`** — cwd-independent production start
2. **`scripts/verify-build.mjs`** — fail fast if build output missing
3. **`postbuild` / `prestart`** — verify `dist/server.js` after build and before start
4. **`typescript` in `dependencies`** — ensures `tsc` on Render production installs
5. **`render.yaml`** — `npm ci --include=dev && npm run build`

### Render dashboard (you must verify)

| Setting | Required value |
|---------|----------------|
| **Root Directory** | **Blank** (repo root where `package.json` lives) |
| **Build Command** | `npm ci --include=dev && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/v1/health` |

After changing settings: **Manual Deploy → Clear build cache & deploy**.

---

## Correct Render Commands

```bash
# Build
npm ci --include=dev && npm run build

# Start
npm start
```

---

## Local Verification Checklist

```bash
npm install
npm run build          # must create dist/server.js
npm run postbuild      # must print "Starting server from .../dist/server.js"
npm start              # server listens (requires MONGODB_URI in .env)
```

---

## Summary

| Question | Answer |
|----------|--------|
| Intended build? | **Yes — `tsc` → `dist/`** |
| Intended start? | **`node dist/server.js`** (now via `start-server.mjs`) |
| Why Render failed? | **Wrong cwd** (`src/`) + possibly **missing build output** |
| Is tsx production start needed? | **No** — only for `npm run dev` and `npm run seed` |
