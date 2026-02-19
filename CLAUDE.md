# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js with Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

## Deployment

- Vercel auto-deploys on push to `main`
- Vercel project: `chs-ex-emcoms-projects/ontology`
- Production URL: https://ontology-eta.vercel.app
- Manual deploy: `npx vercel --prod`

## Architecture

Next.js 16 App Router with TypeScript, Tailwind CSS 4, and Supabase.

### Supabase Integration

Three client utilities in `src/utils/supabase/`:
- `client.ts` — Browser client (`createBrowserClient`) for client components
- `server.ts` — Server client (`createServerClient`) for server components/actions
- `middleware.ts` — Session refresh logic used by `src/middleware.ts`

Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are set in `.env.local` and Vercel.

### Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json).
