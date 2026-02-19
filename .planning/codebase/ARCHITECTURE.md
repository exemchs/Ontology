# Architecture

**Analysis Date:** 2026-02-19

## Pattern Overview

**Overall:** Next.js App Router with server/client separation pattern

**Key Characteristics:**
- Full-stack React application with Next.js 16 App Router
- Server-side rendering (SSR) for pages and middleware-based auth
- Separate Supabase client utilities for browser vs server contexts
- Authentication session management via middleware and cookies
- Type-safe with TypeScript (strict mode)

## Layers

**Presentation Layer:**
- Purpose: React components and page templates
- Location: `src/app/`
- Contains: Next.js pages (`.tsx`), layouts, global styles
- Depends on: Supabase browser client (`@/utils/supabase/client`)
- Used by: Users via HTTP requests

**Server Utilities Layer:**
- Purpose: Server-side Supabase integration and authentication
- Location: `src/utils/supabase/`
- Contains: Server client factory, middleware utilities, session management
- Depends on: `@supabase/ssr`, `next/server`, `next/headers`
- Used by: Middleware and server components

**Middleware Layer:**
- Purpose: Request interception and session management
- Location: `src/middleware.ts`, `src/utils/supabase/middleware.ts`
- Contains: Session refresh logic, cookie management
- Depends on: Supabase SSR, Next.js server utilities
- Used by: Next.js request pipeline

**Configuration Layer:**
- Purpose: Project configuration and build setup
- Location: `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- Contains: TypeScript settings, Next.js config, PostCSS/Tailwind setup
- Depends on: Package dependencies
- Used by: Build system and development environment

## Data Flow

**Authentication Session Flow:**

1. HTTP request arrives at Next.js server
2. `src/middleware.ts` invokes `updateSession()` from `src/utils/supabase/middleware.ts`
3. Middleware creates server Supabase client from request cookies
4. `supabase.auth.getUser()` validates session and potentially refreshes auth tokens
5. Middleware updates response cookies with any new session data
6. Request continues to appropriate page or API handler

**Client Component Data Access:**

1. Client component uses `createClient()` from `src/utils/supabase/client.ts`
2. Client establishes browser-based Supabase session from stored cookies
3. Component can call Supabase API methods directly (queries, mutations)
4. Response handled by component state management

## Key Abstractions

**Supabase Client Factory:**
- Purpose: Encapsulate client instantiation logic for different contexts
- Examples: `src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`
- Pattern: Factory functions that instantiate `createBrowserClient` or `createServerClient` with environment credentials

**Session Middleware:**
- Purpose: Centralized auth session refresh and cookie management
- Example: `src/utils/supabase/middleware.ts` with `updateSession(request)`
- Pattern: Extracts auth-related side effects from request processing

## Entry Points

**Web Application Entry:**
- Location: `src/app/layout.tsx` (root layout), `src/app/page.tsx` (home page)
- Triggers: HTTP request to `/`
- Responsibilities: Root HTML structure, metadata, Geist font setup; render home page with "Ontology" heading

**Request Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every HTTP request matching pattern (all routes except assets)
- Responsibilities: Refresh Supabase session before page processing

**Build Entry:**
- Location: `next.config.ts`
- Triggers: `npm run build` or `npm run dev`
- Responsibilities: Next.js build configuration and optimization settings

## Error Handling

**Strategy:** Try-catch suppression with fallback behavior

**Patterns:**
- Middleware cookie updates wrapped in try-catch to ignore Server Component context errors (see `src/utils/supabase/server.ts` line 20-23)
- Missing environment variables will fail at client initialization (uncaught)
- Authentication failures allow request to proceed (auth state available via `supabase.auth.getUser()`)

## Cross-Cutting Concerns

**Logging:** Not implemented - console methods would be used as needed

**Validation:** Enforced by TypeScript strict mode (`strict: true` in `tsconfig.json`) and Supabase SDK type safety

**Authentication:** Managed via Supabase auth integrated at middleware level with session cookies; all authenticated requests require active user session (validated in middleware)

---

*Architecture analysis: 2026-02-19*
