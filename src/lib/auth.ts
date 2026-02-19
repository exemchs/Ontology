// =============================================================================
// eXemble Ontology Platform - Auth Logic
// =============================================================================
// POC password-only auth using sessionStorage.
// No server-side validation — purely client-side for demo purposes.
// =============================================================================

export const AUTH_KEY = "exemble-auth";
export const WELCOME_KEY = "exemble-welcome-dismissed";

const CORRECT_PASSWORD =
  process.env.NEXT_PUBLIC_SITE_PASSWORD ?? "exem123";

export function validatePassword(password: string): boolean {
  return password === CORRECT_PASSWORD;
}
