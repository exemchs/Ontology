# Codebase Structure

**Analysis Date:** 2026-02-19

## Directory Layout

```
/Users/chs/Desktop/Claude/Ontology/
├── src/                           # Source code root
│   ├── app/                       # Next.js App Router pages and layouts
│   │   ├── layout.tsx            # Root layout with metadata, fonts, global structure
│   │   ├── page.tsx              # Home page component (route /)
│   │   └── globals.css           # Global styles with Tailwind imports
│   ├── utils/                    # Utility functions and services
│   │   └── supabase/             # Supabase integration utilities
│   │       ├── client.ts         # Browser client factory for client components
│   │       ├── server.ts         # Server client factory for server components/actions
│   │       └── middleware.ts     # Session refresh logic for middleware
│   └── middleware.ts             # Next.js middleware entry point
├── .next/                         # Build output (generated, not committed)
├── .planning/                     # Planning and analysis documents
│   └── codebase/                 # Codebase analysis output
├── node_modules/                 # Dependencies (not committed)
├── .git/                         # Version control
├── .env.local                    # Local environment configuration (not committed)
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js build configuration
├── tsconfig.json                 # TypeScript compiler configuration
├── postcss.config.mjs            # PostCSS configuration for Tailwind
├── package.json                  # NPM dependencies and scripts
├── package-lock.json             # Locked dependency versions
└── CLAUDE.md                      # Project-specific Claude instructions
```

## Directory Purposes

**`src/`:**
- Purpose: All application source code
- Contains: React components, utilities, middleware, configuration
- Key files: `middleware.ts`, `app/layout.tsx`, `app/page.tsx`

**`src/app/`:**
- Purpose: Next.js App Router route handlers and page components
- Contains: Page components (`.tsx`), layouts, global styles
- Key files: `layout.tsx` (root layout), `page.tsx` (home page), `globals.css` (global styles)

**`src/utils/`:**
- Purpose: Shared utility functions and service layers
- Contains: Supabase integration code, factory functions, helpers
- Key files: None at root level

**`src/utils/supabase/`:**
- Purpose: Supabase client instantiation and authentication middleware
- Contains: Three client utilities and session management logic
- Key files: `client.ts`, `server.ts`, `middleware.ts`

**`.next/`:**
- Purpose: Build output directory
- Generated: Yes (created by `next build` or `next dev`)
- Committed: No

**`.planning/codebase/`:**
- Purpose: Architecture and analysis documentation
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md
- Generated: No (manually created by analysis)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout component with HTML structure and metadata
- `src/app/page.tsx`: Home page component (route `/`)
- `src/middleware.ts`: Middleware entry point for request processing
- `next.config.ts`: Next.js build configuration entry point

**Configuration:**
- `tsconfig.json`: TypeScript compiler options (strict mode, ES2017 target, path aliases)
- `next.config.ts`: Next.js-specific configuration
- `postcss.config.mjs`: PostCSS plugins (Tailwind CSS)
- `package.json`: Dependencies, scripts, project metadata

**Core Logic:**
- `src/utils/supabase/client.ts`: Browser Supabase client factory
- `src/utils/supabase/server.ts`: Server Supabase client factory with cookie handling
- `src/utils/supabase/middleware.ts`: Session refresh and cookie management logic
- `src/app/globals.css`: Global styles and Tailwind directives

**Styling:**
- `src/app/globals.css`: Single global stylesheet with Tailwind imports
- Tailwind CSS 4 configured via `postcss.config.mjs`

## Naming Conventions

**Files:**
- React components: PascalCase (not currently used; only functional components in routes)
- Utilities: camelCase (`client.ts`, `middleware.ts`)
- Configuration: kebab-case with `.config.` pattern (`next.config.ts`, `postcss.config.mjs`)
- Styles: kebab-case (`globals.css`)

**Directories:**
- Feature directories: singular nouns (`app`, `utils`, `supabase`)
- Group directories: plural for collections (`src/utils/supabase/`)

**Functions:**
- Factory functions: camelCase verb phrases (`createClient()`, `updateSession()`)
- Async functions: same naming as sync; use `async`/`await` keywords

**Variables:**
- Constants: camelCase (no SCREAMING_SNAKE_CASE observed)
- React props: camelCase (children, className, etc.)

## Where to Add New Code

**New Feature (Pages/Routes):**
- Primary code: Create new file in `src/app/` following Next.js App Router pattern
  - Example: `src/app/users/page.tsx` for `/users` route
  - Example: `src/app/users/[id]/page.tsx` for `/users/123` dynamic routes
- Tests: Not yet established; would go in `src/app/` or adjacent `__tests__` directory
- Styling: Use Tailwind utility classes in JSX; global overrides in `src/app/globals.css`

**New Component/Module:**
- Implementation: Create in `src/app/` for page components or nested route components
- Shared components: Would go in dedicated `src/components/` directory (not yet created)
- Utilities: Add to `src/utils/` with appropriate subdirectory (e.g., `src/utils/formatters/`, `src/utils/api/`)

**Utilities (Helpers, Services):**
- Shared helpers: `src/utils/` with descriptive filename (e.g., `src/utils/dateHelpers.ts`)
- Supabase-related: `src/utils/supabase/` (already established pattern)
- API-related: Create `src/utils/api/` subdirectory if needed

**Server Actions:**
- Location: Can be colocated with pages in `src/app/` or in `src/utils/` for reusability
- Pattern: Export `"use server"` at top of file

**Middleware:**
- Location: Must be at `src/middleware.ts` (Next.js convention)
- Additional middleware logic: Extract to `src/utils/supabase/middleware.ts` pattern

## Special Directories

**`.env.local`:**
- Purpose: Local environment variables for development
- Contains: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and other secrets
- Generated: No
- Committed: No (in `.gitignore`)

**`.vercel/`:**
- Purpose: Vercel deployment configuration and metadata
- Generated: Yes (created by Vercel CLI)
- Committed: Yes (contains project metadata)

---

*Structure analysis: 2026-02-19*
