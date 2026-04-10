# Railway Migration Guide
## Next.js + Playwright on Railway — Lessons Learned

This document captures every issue encountered migrating this project from Raspberry Pi / local machine
to Railway. Read it top to bottom before you touch anything. Each section describes what broke, why,
and the exact fix applied.

---

## Table of Contents

1. [Next.js App Router — API Route Structure](#1-nextjs-app-router--api-route-structure)
2. [Dockerfile — The Only Reliable Approach for Playwright](#2-dockerfile--the-only-reliable-approach-for-playwright)
3. [Playwright — Chromium Launch Flags](#3-playwright--chromium-launch-flags)
4. [Playwright — Version Must Match Between npm and Browser Binary](#4-playwright--version-must-match-between-npm-and-browser-binary)
5. [Playwright — PLAYWRIGHT_BROWSERS_PATH Must Be Set Before Install](#5-playwright--playwright_browsers_path-must-be-set-before-install)
6. [Playwright — Do Not Use --single-process or --no-zygote](#6-playwright--do-not-use---single-process-or---no-zygote)
7. [Module-Level Initialization of External Services](#7-module-level-initialization-of-external-services)
8. [.npmrc Must Be Copied Into Docker](#8-npmrc-must-be-copied-into-docker)
9. [NEXT_PUBLIC Variables at Build Time](#9-next_public-variables-at-build-time)
10. [Railway Environment Variables Checklist](#10-railway-environment-variables-checklist)
11. [Google Maps — Referrer Authorization](#11-google-maps--referrer-authorization)
12. [Debugging Methodology](#12-debugging-methodology)

---

## 1. Next.js App Router — API Route Structure

**What broke**: Every API call returned 404 in production.

**Why**: Next.js App Router requires API handlers to be in a subdirectory named after the route,
with the file named `route.ts`. Flat files like `api/chat.ts` are ignored by the router entirely.

**Wrong** (works locally with Pages Router, silent 404 in App Router):
```
src/app/api/chat.ts          ← NOT recognized
src/app/api/calendar.ts      ← NOT recognized
src/app/api/gallery-images.ts ← NOT recognized
```

**Correct**:
```
src/app/api/chat/route.ts
src/app/api/calendar/route.ts
src/app/api/gallery-images/route.ts
```

**How to check**: Run `npm run build` locally. The build output table will show `ƒ /api/chat` etc.
if routes are recognized. If a route is missing from the table, the file is in the wrong place.

---

## 2. Dockerfile — The Only Reliable Approach for Playwright

**What broke**: Railway's default Nixpacks build system cannot install Playwright/Chromium because it
lacks the ~22 system libraries Chromium requires (libglib, libnss, libatk, etc.).

**Why**: Nixpacks uses a minimal Node.js base. You cannot add arbitrary apt packages without a
custom configuration, and Railway's support for custom nixpacks configs is limited.

**The fix**: Add a `Dockerfile` to the project root. Railway will automatically use it instead of
Nixpacks when it detects one. Do NOT attempt to install Playwright inside a `nixpacks.toml` — it
will appear to succeed during the build but fail at runtime with missing shared library errors.

**Working Dockerfile** (as of April 2026):
```dockerfile
FROM node:20-bookworm

WORKDIR /app

# Copy package files AND .npmrc (contains legacy-peer-deps=true)
COPY package*.json .npmrc ./
RUN npm ci

# CRITICAL: Set browser path BEFORE installing so install and runtime use same location
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install browser matching the exact npm package version, with all system deps
# NODE_OPTIONS ipv4first fixes Railway's IPv6 DNS routing bug that stalls downloads
RUN NODE_OPTIONS="--dns-result-order=ipv4first" npx playwright install --with-deps chromium

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.cjs"]
```

**Why `node:20-bookworm` and NOT the official Playwright image**:
The official `mcr.microsoft.com/playwright:vX.Y.Z-noble` image ships browsers for version X.Y.Z.
If your `package.json` installs a *different* version of the `playwright` npm package (even a patch
higher), Playwright will look for its own browser revision, not find it in `/ms-playwright`, fall
back to `~/.cache/ms-playwright/`, try to use a binary that has no system libraries, and crash.
Version mismatch = guaranteed failure. The `node:20-bookworm` + `install --with-deps` approach
always installs the browser that matches whatever npm version is installed.

---

## 3. Playwright — Chromium Launch Flags

**What broke**: Browser failed to launch or crashed immediately inside Docker.

**Required flags** (minimum set that works on Railway):
```typescript
browser = await chromium.launch({
  headless: true,
  args: [
    '--no-sandbox',           // Required: Railway containers run as root
    '--disable-setuid-sandbox', // Companion to --no-sandbox
    '--disable-dev-shm-usage',  // CRITICAL: Docker /dev/shm is 64MB, Chrome needs more
    '--disable-gpu',            // No GPU in containers
  ]
});
```

**`--disable-dev-shm-usage` is the single most important flag**. Without it, Chromium writes to
`/dev/shm` which Docker caps at 64MB. Chrome needs hundreds of MB for shared memory. Omitting this
flag causes mysterious crashes with no useful error message.

---

## 4. Playwright — Version Must Match Between npm and Browser Binary

**What broke**: Browser binary found but crashed with `libglib-2.0.so.0: cannot open shared object file`.

**Why**: Playwright's browser revisions are tied to npm package versions. The npm package version
determines which browser revision it looks for. If the revision installed on disk doesn't match,
Playwright will try to download or locate a different binary that lacks system libraries.

**Rule**: Always install the browser AFTER `npm ci`, not before. The sequence is:
1. `npm ci` → installs `playwright@x.y.z`
2. `npx playwright install --with-deps chromium` → installs browser for exactly `x.y.z`

Never pre-install the browser in a base image unless the base image version exactly matches the
npm package version and you pin that version in `package.json`.

---

## 5. Playwright — PLAYWRIGHT_BROWSERS_PATH Must Be Set Before Install

**What broke**: Build succeeded, container started, but `chromium.launch()` returned 500. Railway
logs showed browser launching from `/root/.cache/ms-playwright/` while `PLAYWRIGHT_BROWSERS_PATH`
was set to `/ms-playwright`.

**Why**: `PLAYWRIGHT_BROWSERS_PATH` controls BOTH where browsers are installed AND where they are
looked up at runtime. If you set it only as a Railway env var (at runtime), but the Dockerfile
installs without it (to the default `~/.cache/ms-playwright/`), the paths diverge:
- Install path: `/root/.cache/ms-playwright/chromium_headless_shell-1217/`
- Runtime lookup: `/ms-playwright/chromium_headless_shell-1217/` → not found → crash

**Fix**: Set `ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` in the Dockerfile BEFORE the
`playwright install` line. Then the same path is used for both install and runtime.

```dockerfile
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright           # ← set first
RUN npx playwright install --with-deps chromium       # ← installs to /ms-playwright
```

---

## 6. Playwright — Do Not Use --single-process or --no-zygote

**What broke**: Browser launched (visible in logs), but both Airbnb and Booking.com contexts
failed immediately with `browserContext.newPage: Target page, context or browser has been closed`.

**Why**: `--single-process` merges the browser process and renderer into one OS process. When two
`browser.newContext()` calls execute in parallel, this single process becomes unstable and crashes.
`--no-zygote` makes this worse. Both flags are meant for severely memory-constrained environments.

**Do not use these flags** unless you are running on a device with less than 512MB total RAM. On
Railway Hobby (8GB available), they cause more problems than they solve.

---

## 7. Module-Level Initialization of External Services

**What broke**: Docker build failed with `Error: Stripe secret key not found` during `npm run build`,
even though the Stripe key exists in Railway's env vars.

**Why**: Next.js App Router runs API route modules during the build phase to collect page metadata.
Any code at the module's top level executes during `next build`. Since Docker build does not have
access to Railway's runtime env vars, any service initialization that reads env vars at module load
time will throw.

**Wrong**:
```typescript
// src/lib/stripe/stripeService.ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // ← runs at build time → crashes
```

**Correct** — lazy initialization, deferred until the first actual request:
```typescript
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '...' });
  }
  return _stripe;
}
```

**This applies to any service initialized with env vars at module level**: Stripe, OpenAI,
database clients, Redis, SMTP, etc. The rule is: never read `process.env.SECRET_*` at module
scope — only inside functions that are called at request time.

---

## 8. .npmrc Must Be Copied Into Docker

**What broke**: `npm ci` failed inside Docker with `ERESOLVE could not resolve` peer dependency
errors, even though the same command works fine on the local machine.

**Why**: The project has `legacy-peer-deps=true` in `.npmrc` because React 19 + some Radix UI
packages have peer dependency conflicts. Locally, npm reads `.npmrc` automatically. In Docker,
`COPY package*.json ./` only copies `package.json` and `package-lock.json` — `.npmrc` is excluded.

**Fix**: Explicitly include `.npmrc` in the COPY:
```dockerfile
COPY package*.json .npmrc ./
RUN npm ci
```

**General rule**: Check your `.npmrc` for any flags that affect installation and make sure it's
copied before running `npm ci`.

---

## 9. NEXT_PUBLIC Variables at Build Time

**What broke**: Client-side features (maps, contact info, social links) rendered as `undefined`
in production even though env vars were set in Railway.

**Why**: `NEXT_PUBLIC_*` variables are inlined into the JavaScript bundle at `next build` time,
not at runtime. Railway's env vars are only available to the running container, not to the Docker
build step. The Next.js build runs inside `RUN npm run build` with no access to Railway's values.

**Fix**: Pass them as Docker ARGs and promote to ENV before the build step:
```dockerfile
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# ... repeat for each NEXT_PUBLIC_ variable

RUN npm run build   # ← now has access to all NEXT_PUBLIC_ values
```

In Railway dashboard: Settings → Build → add each `NEXT_PUBLIC_*` variable as a build argument.
The variable names in Railway's "Build Arguments" must match the `ARG` names in the Dockerfile.

---

## 10. Railway Environment Variables Checklist

### Set in Railway Dashboard → Variables (runtime)
These are available to the running Node.js process:

| Variable | Notes |
|----------|-------|
| `NODE_ENV` | Must be `production`, NOT `development` |
| `STRIPE_SECRET_KEY` | Server-side only, never expose to client |
| `AIRBNB_CALENDAR_URL` | iCal feed URL |
| `BOOKING_CALENDAR_URL` | iCal feed URL |
| `XAI_API_KEY` | Grok AI key for chatbot |
| `OPENAI_API_KEY` | If using OpenAI |
| `AGENTQL_API_KEY` | If using AgentQL |
| `PLAYWRIGHT_BROWSERS_PATH` | Set to `/ms-playwright` |
| `NODE_OPTIONS` | Set to `--max-old-space-size=2048` |
| `MALLOC_ARENA_MAX` | Set to `2` (reduces glibc memory fragmentation) |

### Set in Railway Dashboard → Settings → Build Arguments
These are needed at build time for `NEXT_PUBLIC_*` embedding:

| Variable |
|----------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` |
| `NEXT_PUBLIC_EMAILJS_USER_ID` |
| `NEXT_PUBLIC_BASE_URL` |
| `NEXT_PUBLIC_CONTACT_EMAIL` |
| `NEXT_PUBLIC_CONTACT_PHONE` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| `NEXT_PUBLIC_INSTAGRAM_URL` |
| `NEXT_PUBLIC_FACEBOOK_URL` |
| `NEXT_PUBLIC_YOUTUBE_URL` |
| `NEXT_PUBLIC_GALLERY_FEATURED` |
| `NEXT_PUBLIC_RECIPIENT_EMAIL` |

### Resource Allocation
- Memory: minimum **2 GB** for single Playwright instance, **4 GB** recommended for two parallel
  browser contexts (Booking.com + Airbnb simultaneously).
- Railway Hobby plan provides up to 8 GB — plenty.

---

## 11. Google Maps — Referrer Authorization

**What broke**: Map component shows `RefererNotAllowedMapError` in the console.

**Why**: The Google Maps JavaScript API key has HTTP referrer restrictions. The Raspberry Pi domain
(or localhost) was authorized but the Railway production domain was not.

**Fix**:
1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Find the Maps JavaScript API key
3. Under "Application restrictions" → "HTTP referrers", add:
   - `https://marzapage-production.up.railway.app/*`
   - `https://marzagem.com/*` (your custom domain)
   - `https://*.railway.app/*` (if you use preview environments)

This is unrelated to the codebase — it's a Google Cloud console configuration.

---

## 12. Debugging Methodology

When a new error appears on Railway, work in this order:

### Step 1 — Read Railway deploy logs, not just the browser console
The browser only shows the HTTP status code. The actual error (missing library, wrong path, env var
undefined) is always in the Railway deploy logs (Deployments → click the deployment → Logs tab).

### Step 2 — Distinguish build errors from runtime errors
- **Build error**: Dockerfile step fails. Fix the Dockerfile or the source code.
- **Runtime 500**: Build succeeded but the handler throws. Read server logs.
- **Runtime 404**: Route not registered. Check App Router file structure.

### Step 3 — For Playwright specifically, read the browser launch log
Railway logs include the full Chromium launch command and pid-level stderr. The most useful lines:
- `<launched> pid=N` → browser started
- `[pid=N][err] ...cannot open shared object file` → missing system library
- `[pid=N][err] ...error while loading shared libraries` → same, wrong image or no `--with-deps`
- `browserContext.newPage: Target page, context or browser has been closed` → browser crashed
  immediately after launch, usually caused by `--single-process`

### Step 4 — Never add `--single-process` or `--no-zygote` to Chromium args
If memory is a concern, reduce parallel contexts instead.

### Step 5 — The build must pass locally first
Always run `npm run build` locally before pushing to Railway. Many Railway build failures
(Stripe key, missing modules, TypeScript errors) are catchable locally in seconds.

---

## Summary of All Fixes Applied (in chronological order)

| # | Problem | Fix |
|---|---------|-----|
| 1 | All API routes returning 404 | Moved `api/name.ts` → `api/name/route.ts` |
| 2 | Playwright can't run on Nixpacks | Added `Dockerfile` using `node:20-bookworm` |
| 3 | `npm ci` fails in Docker | Added `.npmrc` to COPY instruction |
| 4 | `libglib-2.0.so.0` missing | Used `node:20-bookworm` + `--with-deps` instead of official Playwright image |
| 5 | Browser binary not found at runtime | Set `ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` before `playwright install` |
| 6 | Browser crashes on context creation | Removed `--single-process` and `--no-zygote` from launch args |
| 7 | Stripe key throws during `next build` | Lazy-initialized Stripe client inside a function |
| 8 | `NEXT_PUBLIC_*` undefined on client | Added `ARG`/`ENV` pairs in Dockerfile before build step |
| 9 | Google Maps `RefererNotAllowedMapError` | Add Railway domain in Google Cloud Console credentials |
