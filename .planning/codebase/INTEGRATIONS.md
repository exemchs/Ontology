# External Integrations

**Analysis Date:** 2026-02-19

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Complete backend platform for authentication, database (PostgreSQL), real-time, and storage
  - SDK/Client: `@supabase/supabase-js` v2.95.3 (browser/Node client)
  - SSR Integration: `@supabase/ssr` v0.8.0 (server-side rendering support)
  - Auth: Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Supabase Project URL: https://fvfotgzodvomsdtawslr.supabase.co

## Data Storage

**Databases:**
- PostgreSQL (via Supabase)
  - Connection: Managed by Supabase client, authenticated with `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client: `@supabase/supabase-js` (JavaScript/TypeScript client)
  - Access Pattern: Browser client (`src/utils/supabase/client.ts`) and server client (`src/utils/supabase/server.ts`)

**File Storage:**
- Supabase Storage (bucket-based file storage)
  - Access: Available through Supabase client SDK
  - Configuration: No explicit setup in current codebase

**Caching:**
- Not detected - No Redis, Memcached, or caching layer configured

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Built-in authentication service
  - Implementation: Server-side session management via middleware pattern
  - Session Refresh: Automatic via `src/utils/supabase/middleware.ts` called by `src/middleware.ts`
  - Cookie Management: Session stored in cookies, managed across server and browser
  - Auth Flow:
    1. Browser client creates user session in Supabase Auth
    2. Session token stored in secure HTTP-only cookies
    3. Middleware intercepts all requests to refresh session token
    4. Server components access authenticated user via server client

**Session Management Files:**
- `src/utils/supabase/middleware.ts` - Refreshes auth tokens on every request via `supabase.auth.getUser()`
- `src/utils/supabase/client.ts` - Browser-side Supabase client for client components
- `src/utils/supabase/server.ts` - Server-side Supabase client for server components and actions
- `src/middleware.ts` - Next.js middleware that calls Supabase session refresh

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, LogRocket, or error tracking service configured

**Logs:**
- Browser console/browser DevTools - Development logging
- Vercel deployment logs - Production logs accessible via Vercel dashboard

**Performance Monitoring:**
- Not detected - No monitoring service integrated

## CI/CD & Deployment

**Hosting:**
- Vercel - Serverless platform for Next.js applications
  - Project: `chs-ex-emcoms-projects/ontology`
  - Project ID: `prj_e9Bbz9byNR3mmDgqAmHYioqMyjxU`
  - Organization ID: `team_8ltTwnOeGUVL5nzYDobsBRKw`

**CI Pipeline:**
- Vercel Git integration (automatic deployments)
  - Trigger: Push to `main` branch auto-deploys
  - Build command: `npm run build`
  - Start command: `npm run start`

**Environment Variables on Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- Set via Vercel project dashboard (not in repository)

## Webhooks & Callbacks

**Incoming:**
- Not detected - No incoming webhook endpoints configured

**Outgoing:**
- Potential Supabase webhooks available but not currently configured
  - Can trigger webhooks from Supabase events (auth, database changes, realtime events)

## API Routes

**Current State:**
- No API routes detected (`/api/*` endpoints not present in `src/app/`)
- Application is currently client-side and server-component focused
- All external API calls go directly to Supabase client SDK

## Real-time Features

**Supabase Realtime:**
- Available via Supabase client SDK (`@supabase/supabase-js`)
- Not currently implemented in application code
- Can be enabled for subscriptions to database changes, presence, and broadcast channels

---

*Integration audit: 2026-02-19*
