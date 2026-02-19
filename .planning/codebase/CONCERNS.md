# Codebase Concerns

**Analysis Date:** 2026-02-19

## Build & Linting Configuration

**ESLint Configuration Missing:**
- Issue: ESLint v9 requires `eslint.config.js` (new flat config format), but project has no ESLint config file.
- Files: No config file exists
- Impact: `npm run lint` fails with "ESLint couldn't find an eslint.config.(js|mjs|cjs) file" error. Code quality checks cannot run. Development workflow broken.
- Fix approach: Create `eslint.config.js` with appropriate rules, or migrate to ESLint v9 flat config format. Consider adding linting to CI pipeline.

## Deprecated API Usage

**Middleware Convention Deprecated:**
- Issue: Next.js 16.1.6 build emits warning: "The 'middleware' file convention is deprecated. Please use 'proxy' instead."
- Files: `src/middleware.ts`
- Impact: Code will break in future Next.js versions. Middleware pattern is moving away from dedicated files.
- Fix approach: Migrate from `src/middleware.ts` pattern to Next.js proxy handlers. This is a breaking change that requires refactoring session refresh logic.

## Environment Variable Safety

**Unsafe Non-Null Assertions on Environment Variables:**
- Issue: Multiple locations use `process.env.NEXT_PUBLIC_SUPABASE_URL!` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` with non-null assertions, assuming these will always exist.
- Files:
  - `src/utils/supabase/middleware.ts` (lines 10-11)
  - `src/utils/supabase/client.ts` (lines 5-6)
  - `src/utils/supabase/server.ts` (lines 8-9)
- Impact: If environment variables are missing at runtime, code will crash with unclear errors. No validation of required configuration.
- Fix approach: Add explicit environment variable validation at app startup. Consider using a configuration validation library (e.g., `zod` for schema validation) to verify all required env vars are present and valid.

## Error Handling Gaps

**Silent Error Swallowing in Server Client:**
- Issue: `src/utils/supabase/server.ts` line 20-23 catches all errors in `setAll()` with empty catch block and comment "This can be ignored if you have middleware refreshing sessions."
- Files: `src/utils/supabase/server.ts` (lines 20-23)
- Impact: Legitimate errors setting cookies in server components are silently ignored. Hard to debug auth issues. Masks problems if middleware is not properly refreshing sessions.
- Fix approach: Add error logging (even if intentional ignore) to aid debugging. Document why this pattern is safe and what specific errors are expected here.

**Middleware Auth Check No Error Handling:**
- Issue: `src/utils/supabase/middleware.ts` line 32 calls `await supabase.auth.getUser()` but doesn't handle errors or check the response.
- Files: `src/utils/supabase/middleware.ts` (line 32)
- Impact: If auth.getUser() fails, the error propagates and crashes middleware, potentially causing 500 errors on all requests.
- Fix approach: Wrap in try-catch with appropriate error handling. Log auth check failures (without leaking sensitive data) for debugging.

## Session Management Concerns

**Session Refresh Mechanism Undocumented:**
- Issue: Comments in `src/utils/supabase/server.ts` and `src/utils/supabase/middleware.ts` reference "middleware refreshing sessions" but the actual session refresh flow is not documented.
- Files:
  - `src/utils/supabase/server.ts` (line 21-22)
  - `src/utils/supabase/middleware.ts` (entire flow)
- Impact: Unclear how sessions are refreshed, when tokens expire, or what happens on token expiration. Makes it hard to troubleshoot auth issues or extend auth functionality.
- Fix approach: Add detailed comments or documentation explaining the session refresh flow. Document expected behaviors (e.g., how refresh tokens are handled, what happens on expiry).

## Code Quality Issues

**Incomplete Application Structure:**
- Issue: Application currently has only a landing page (`/`) with placeholder content. No routing, authentication UI, data handling, or meaningful features implemented.
- Files: `src/app/page.tsx` (7 lines, placeholder H1)
- Impact: Early-stage project with significant work ahead. No tests exist for current code. Easy to accumulate technical debt as features are added.
- Fix approach: As features are added, establish testing patterns, authentication flows, and error handling early to prevent tech debt accumulation.

**Generic Font Import Mismatch:**
- Issue: `src/app/layout.tsx` imports "Geist" font but `globals.css` doesn't use it, instead specifying generic "Arial, Helvetica, sans-serif" fallback.
- Files:
  - `src/app/layout.tsx` (lines 2, 5-7)
  - `src/app/globals.css` (line 4)
- Impact: Geist font likely not rendering as intended. Inconsistency between layout intent and actual styling.
- Fix approach: Either remove unused Geist import or properly configure it in CSS using the `--font-geist-sans` variable.

## Missing Production Considerations

**No Error Boundaries or Error Handling Pages:**
- Issue: No error.tsx, not-found.tsx, or global error handling components implemented.
- Files: Missing error handling pages
- Impact: Production errors will show default Next.js error pages. No custom error messaging or recovery paths for users.
- Fix approach: Implement error.tsx and not-found.tsx pages. Add user-friendly error messages.

**No Health Check or Monitoring:**
- Issue: No liveness probes, health check endpoints, or monitoring integration configured.
- Files: None
- Impact: Vercel deployment has no way to detect application health degradation. Silent failures possible.
- Fix approach: Add health check route (e.g., `/api/health`) for monitoring integrations.

**Limited Environmental Configuration:**
- Issue: Only `.env.local` file exists. No separate configuration for different deployment environments (dev vs. staging vs. production).
- Files: `.env.local` exists, but no staging or production configs documented
- Impact: Hard to manage different Supabase projects or API keys for different environments. Risk of using wrong credentials.
- Fix approach: Document environment setup for staging and production. Use Vercel environment variables for non-public config.

## Dependencies at Risk

**TypeScript Strict Mode May Cause Issues:**
- Issue: `tsconfig.json` has `strict: true` enabled (line 7), which enforces strict type checking.
- Files: `tsconfig.json` (line 7)
- Impact: Good for code quality but requires careful handling of all types. Non-null assertions (!`) are used to bypass strict mode, which defeats the purpose.
- Fix approach: Reduce reliance on non-null assertions by properly validating environment variables and external data.

## Testing Gaps

**No Tests Exist:**
- Issue: No test files, test configuration, or testing framework set up.
- Files: None found
- Risk: High. Critical code paths (Supabase auth, middleware, session refresh) have zero test coverage. Auth bugs will only be discovered in production.
- Priority: High - Add test infrastructure and write tests for auth flows before adding more features.

---

*Concerns audit: 2026-02-19*
