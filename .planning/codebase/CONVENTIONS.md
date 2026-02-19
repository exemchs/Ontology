# Coding Conventions

**Analysis Date:** 2026-02-19

## Naming Patterns

**Files:**
- Components: `PascalCase.tsx` (e.g., `layout.tsx`, `page.tsx`)
- Utilities: `camelCase.ts` (e.g., `client.ts`, `server.ts`, `middleware.ts`)
- Configuration: lowercase with dots (e.g., `postcss.config.mjs`, `next.config.ts`)

**Functions:**
- Named exports: `camelCase` (e.g., `createClient()`, `updateSession()`)
- Default exports: Often PascalCase for React components (e.g., `export default function Home()`)

**Variables:**
- Local variables: `camelCase` (e.g., `cookieStore`, `supabaseResponse`)
- Constants: `camelCase` (e.g., `geistSans`)
- Type variables: `PascalCase` (e.g., `Metadata`, `NextRequest`, `NextConfig`)

**Types:**
- Interfaces/Types: `PascalCase` (e.g., `NextRequest`, `Metadata`, `NextConfig`)
- Type imports use explicit `type` keyword: `import type { Metadata } from "next"`

## Code Style

**Formatting:**
- Uses default Next.js/ESLint configuration
- ESLint version 9 with `eslint-config-next` v16.1.6
- No explicit Prettier configuration found - relies on ESLint integration

**Linting:**
- Configured through: `eslint` v9 and `eslint-config-next` v16.1.6
- Run command: `npm run lint` (from package.json)
- Next.js ESLint preset enforces strict type checking and React best practices

**Indentation:**
- Uses 2-space indentation (observed in all source files)
- Consistent with Next.js conventions

## Import Organization

**Order:**
1. External packages (Next.js, React, third-party libraries)
2. Type imports (with explicit `type` keyword)
3. Relative imports from `@/` path aliases
4. Internal utilities

**Examples:**
```typescript
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/client";
```

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Used consistently across codebase for relative imports

## Error Handling

**Pattern - Try/Catch with Optional Chaining:**
```typescript
// From src/utils/supabase/server.ts
try {
  cookiesToSet.forEach(({ name, value, options }) =>
    cookieStore.set(name, value, options)
  );
} catch {
  // The `setAll` method was called from a Server Component.
  // This can be ignored if you have middleware refreshing sessions.
}
```

**Guidelines:**
- Silent catch blocks are used when errors are expected and recoverable (e.g., middleware cookie operations)
- Comments explain why errors are caught and ignored
- No error logging or re-throwing in utility layers (Supabase client setup)

## Logging

**Framework:** No explicit logging library - uses `console` (not observed in source code)

**Patterns:**
- Logging is minimal in utility/middleware code
- Focus on error comments rather than logging statements
- Comments in catch blocks serve as documentation for error scenarios

## Comments

**When to Comment:**
- Explain non-obvious error handling (e.g., why a catch block is empty)
- Document Next.js-specific behavior or constraints
- Comments placed inline with code they explain

**JSDoc/TSDoc:**
- Not consistently used throughout codebase
- Type annotations are preferred over JSDoc for type documentation

**Example from `src/utils/supabase/server.ts`:**
```typescript
{
  cookies: {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        // ...
      } catch {
        // The `setAll` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing sessions.
      }
    },
  },
}
```

## Function Design

**Size:**
- Utility functions are small and focused (5-35 lines)
- Examples:
  - `createClient()` in `client.ts`: 8 lines
  - `createClient()` in `server.ts`: 28 lines
  - `updateSession()` in `middleware.ts`: 35 lines

**Parameters:**
- Use object destructuring for function parameters when needed
- Example from `server.ts`:
```typescript
cookiesToSet.forEach(({ name, value, options }) =>
  cookieStore.set(name, value, options)
);
```

**Return Values:**
- Functions return instances or responses directly
- Consistent with SDK pattern: `return createBrowserClient(...)` or `return await updateSession(request)`

## Module Design

**Exports:**
- Named exports for utility functions (e.g., `export async function updateSession()`)
- Default exports for React components (e.g., `export default function Home()`)
- Type exports use explicit `type` keyword: `export const metadata: Metadata`

**Barrel Files:**
- Not currently used - each module exports specific functions
- Supabase utilities are organized in separate files: `client.ts`, `server.ts`, `middleware.ts`
- No index.ts aggregator in `src/utils/supabase/`

## Async/Await

**Pattern:**
- Used consistently with `async` functions and `await` calls
- Example from middleware:
```typescript
export async function updateSession(request: NextRequest) {
  // ... sync code ...
  await supabase.auth.getUser();
  return supabaseResponse;
}
```

**Guidelines:**
- Always declare async before functions that use await
- Await promises from external SDK calls (Supabase, Next.js APIs)

## TypeScript Strict Mode

**Configuration (tsconfig.json):**
- `"strict": true` - Full strict type checking enabled
- `"noEmit": true` - Type checking without code generation
- `"esModuleInterop": true` - Allow CommonJS/ES module interoperability
- `"isolatedModules": true` - Treat each file as separate module

**Implications:**
- All implicit `any` types trigger errors
- Null/undefined safety enforced
- Type imports must use explicit `type` keyword

---

*Convention analysis: 2026-02-19*
