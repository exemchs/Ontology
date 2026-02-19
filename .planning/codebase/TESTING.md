# Testing Patterns

**Analysis Date:** 2026-02-19

## Test Framework

**Runner:**
- Not detected - No test framework configured
- No `jest.config.*`, `vitest.config.*`, or equivalent test runner configuration found
- Testing infrastructure not yet implemented

**Assertion Library:**
- Not detected

**Run Commands:**
```bash
npm run lint              # ESLint linting
npm run dev              # Development mode
npm run build            # Production build
npm run start            # Production start
```

**Note:** No dedicated test command in `package.json`

## Test File Organization

**Current State:**
- No test files present in `src/` directory
- Codebase does not include application-level tests
- Only dependency tests exist in `node_modules/` (from Zod, Next.js, tsconfig-paths, etc.)

**Recommended Pattern (for future implementation):**
- Co-locate tests with source files
- Naming: `[filename].test.ts` or `[filename].spec.ts`
- Location: `src/` alongside implementation

**Example structure to follow:**
```
src/
├── app/
│   ├── page.tsx
│   ├── page.test.tsx          # New test file location
│   └── layout.tsx
├── utils/
│   └── supabase/
│       ├── client.ts
│       ├── client.test.ts     # New test file location
│       ├── server.ts
│       └── server.test.ts
```

## Testing Opportunities

**High Priority - Core Functionality:**

1. **Supabase Client Integration (`src/utils/supabase/client.ts`):**
   - Verify `createClient()` returns valid Supabase client instance
   - Confirm environment variables are properly accessed
   - Test with and without valid credentials

2. **Server-side Cookie Management (`src/utils/supabase/server.ts`):**
   - Test `getAll()` returns cookies correctly
   - Test `setAll()` handles cookie setting without throwing
   - Test error scenario where `setAll()` is called from Server Component (should silently fail)

3. **Middleware Session Update (`src/utils/supabase/middleware.ts`):**
   - Verify `updateSession()` calls `getUser()` to refresh auth
   - Test that session is properly maintained across requests
   - Test response cookie handling

4. **Layout & Page Components:**
   - Test that `Home()` component renders with correct text
   - Test that metadata is correctly exported
   - Test Geist font configuration loads

## Current Testing Configuration

**ESLint as Quality Gate:**
- ESLint v9 with Next.js config (`eslint-config-next`) is the primary code quality tool
- Run with: `npm run lint`

**Type Checking:**
- TypeScript with strict mode (`tsconfig.json`: `"strict": true`)
- Acts as static analysis for type safety
- Run with: `npm run build`

## Environment & Dependencies

**Key Testing Considerations:**

**Environment Variables:**
- `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Mock these values in test setup

**Dependencies for Testing (if implemented):**
- Currently not installed - would need to add:
  - Jest or Vitest as test runner
  - @testing-library/react for component testing
  - @testing-library/jest-dom for DOM matchers
  - MSW (Mock Service Worker) for API mocking

## Mocking Strategy (for future implementation)

**Mocking Framework:**
- Recommend MSW (Mock Service Worker) for Supabase API calls
- Supabase client is from `@supabase/ssr` - would need API mocking setup

**Patterns to Mock:**
```typescript
// Mock Supabase client responses
jest.mock("@supabase/ssr");

// Mock Next.js functions
jest.mock("next/headers");
jest.mock("next/font/google");
```

**What to Mock:**
- `@supabase/ssr` client instances
- `next/headers` for cookies() function
- External service calls (Supabase auth, getUser)

**What NOT to Mock:**
- Internal utility functions (should test directly)
- Core React/Next.js hooks (test their behavior instead)
- Configuration files (load and validate directly)

## Manual Testing Approach (Current)

**Development Mode:**
```bash
npm run dev
```
- Starts Next.js dev server with Turbopack
- Available at `http://localhost:3000`
- Hot reload for changes

**Production Build Verification:**
```bash
npm run build
npm run start
```

**Deployment Testing:**
- Automatic deployment to Vercel on git push to `main`
- Production URL: `https://ontology-eta.vercel.app`
- Manual trigger: `npx vercel --prod`

## Test Coverage Gaps

**Untested Areas:**

1. **Supabase Integration (`src/utils/supabase/`):**
   - No unit tests for client/server initialization
   - No tests for cookie handling in middleware
   - No tests for session refresh logic
   - Risk: Auth failures could go undetected until production

2. **Middleware (`src/middleware.ts`):**
   - No integration tests for request/response cycle
   - No tests for auth token refresh flow
   - Risk: Session management bugs only discovered in production

3. **Components (`src/app/`):**
   - No tests for page rendering
   - No tests for layout composition
   - No tests for font loading
   - Risk: UI regressions only caught manually

4. **Type Safety:**
   - No runtime validation of API responses
   - Supabase client calls are unvalidated
   - Risk: Type mismatches at runtime

**Priority: High** - Authentication and session management are critical paths that should have test coverage.

## Recommended Testing Implementation Path

**Phase 1 - Setup (Foundation):**
1. Install Vitest + @testing-library/react
2. Create test configuration in `vitest.config.ts`
3. Add test script to package.json

**Phase 2 - Utilities (High Risk):**
1. Test Supabase client creation
2. Test middleware updateSession()
3. Test server-side cookie handling

**Phase 3 - Components:**
1. Test page and layout rendering
2. Test metadata export

**Phase 4 - Integration:**
1. End-to-end tests for auth flows
2. Middleware integration tests

---

*Testing analysis: 2026-02-19*
