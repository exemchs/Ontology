# Technology Stack

**Analysis Date:** 2026-02-19

## Languages

**Primary:**
- TypeScript 5.x - Full application source code, type-safe development

**Secondary:**
- JavaScript (MJS) - PostCSS configuration (`postcss.config.mjs`)

## Runtime

**Environment:**
- Node.js (LTS version implied by Next.js 16 compatibility)

**Package Manager:**
- npm (via package-lock.json)
- Lockfile: Present (`package-lock.json` - 233,774 bytes)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router, server/client components, middleware
- React 19.2.3 - UI component library and rendering engine
- React DOM 19.2.3 - DOM rendering for React components

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework with PostCSS integration (`@tailwindcss/postcss` v4)

**Build/Dev:**
- TypeScript 5.x - Compile and type-check TypeScript source
- ESLint 9.x - Code linting and quality checks with Next.js config

## Key Dependencies

**Critical:**
- `@supabase/ssr` 0.8.0 - Supabase Server-Side Rendering integration for authentication and database access
- `@supabase/supabase-js` 2.95.3 - Supabase JavaScript client SDK for API calls

**Infrastructure:**
- `@tailwindcss/postcss` 4 - PostCSS plugin for Tailwind CSS v4 processing
- `eslint-config-next` 16.1.6 - Next.js-specific ESLint configuration rules

**Type Definitions:**
- `@types/node` 20.x - Node.js type definitions
- `@types/react` 19.x - React type definitions
- `@types/react-dom` 19.x - React DOM type definitions

## Configuration Files

**Build Configuration:**
- `tsconfig.json` - TypeScript compiler options with Next.js plugin and path alias (`@/*` → `./src/*`)
- `next.config.ts` - Next.js configuration (currently minimal)
- `postcss.config.mjs` - PostCSS plugins for Tailwind CSS processing

**Type Checking:**
- TypeScript strict mode enabled
- `isolatedModules: true` for faster compilation
- Target: ES2017

## Environment Variables

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public, used in browser)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous API key (public, used in browser)

**Configuration Sources:**
- Development: `.env.local` (loaded automatically by Next.js, git-ignored)
- Production: Vercel environment variables configured in Vercel dashboard

## Platform & Deployment

**Development:**
- Run: `npm run dev` - Starts Next.js dev server with Turbopack
- Type-check: TypeScript compilation integrated into dev server

**Production:**
- Build: `npm run build` - Compiles TypeScript and optimizes for production
- Start: `npm run start` - Runs Next.js production server
- Hosting: Vercel (auto-deploys on push to `main` branch)
- Vercel Project ID: `prj_e9Bbz9byNR3mmDgqAmHYioqMyjxU`

**Deployment Pipeline:**
- Git trigger: Push to main branch automatically deploys to Vercel
- Manual deploy: `npx vercel --prod`
- Production URL: https://ontology-eta.vercel.app

## File Structure for Configuration

- `package.json` - Project metadata, scripts, dependencies
- `package-lock.json` - Locked dependency versions
- `tsconfig.json` - TypeScript configuration with Next.js integration
- `next.config.ts` - Next.js framework configuration
- `postcss.config.mjs` - CSS processing pipeline
- `.env.local` - Local environment variables (development)
- `.vercel/project.json` - Vercel project metadata

---

*Stack analysis: 2026-02-19*
