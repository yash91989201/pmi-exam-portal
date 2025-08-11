# Copilot Instructions for PMI Exam Portal

## Project Overview & Architecture
- This is a PMI Exam Portal built with Better-T-Stack, a full-stack TypeScript monorepo.
- **Frontend**: React 19 with TanStack Router, TailwindCSS, shadcn/ui, TanStack Form, TanStack Query
- **Backend**: Hono, oRPC (type-safe API), Drizzle ORM, PostgreSQL
- **Auth**: Better Auth (email/password, session management)
- **Runtime**: Bun

## Directory Structure
- `apps/web/` — React frontend app
    - `src/components/` — UI and app components
    - `src/routes/` — File-based routing
    - `src/lib/` — Utilities, schemas, auth client
    - `src/utils/orpc.ts` — ORPC client config
- `apps/server/` — Hono backend API
    - `src/routers/` — oRPC procedure routes
    - `src/db/schema/` — Drizzle ORM entities
    - `src/lib/` — Auth, oRPC config, context creator
    - `src/utils/` — Backend utilities
- Shared conventions and cross-module updates are required for all core changes.

## Code Style & Naming Conventions
- **camelCase** for variables/functions
- **PascalCase** for React components and types
- **kebab-case** for filenames
- Always use TypeScript; enforce type safety across all layers
- UI components must follow shadcn/ui patterns and be placed in `apps/web/src/components/ui/`
- Mandatory: Add English comments for any complex or non-obvious logic, using imperative style (do not include general dev knowledge or tutorials)
- Never add explanatory comments for JS/TS basics

## Key Workflows & File Update Rules
### API Endpoints
1. Define new endpoint in `apps/server/src/routers/` using `publicProcedure` or `protectedProcedure`
2. Export it from `apps/server/src/routers/index.ts`
3. Add/Update client calls in `apps/web/src/utils/orpc.ts`
4. Check for type/interface changes and update as needed in both frontend and backend

### Database Schema Changes
1. Edit entities in `apps/server/src/db/schema/`
2. Run `bun db:push` and update affected types
3. Ensure related routers/types are updated
4. Update `.env.example` and `drizzle.config.ts` if relevant

### UI Components & Routes
- New UI components: Place in `apps/web/src/components/ui/`, follow shadcn/ui and design tokens
- New routes: Add file in `apps/web/src/routes/`, ensure routeTree.gen.ts updates automatically
- Always check for corresponding context/provider or backend updates

### Auth Changes
- Edit logic in both `apps/server/src/lib/auth.ts` and `apps/web/src/lib/auth-client.ts` for any auth modifications

## Environment & Build
- Frontend env: `apps/web/.env.example` (e.g. VITE_SERVER_URL)
- Backend env: `apps/server/.env.example` (e.g. DATABASE_URL, CORS_ORIGIN, BETTER_AUTH_SECRET, etc.)
- Use provided scripts: `bun dev`, `bun db:push`, `bun check-types`, etc.

## Prohibited Actions & Special Rules
- **Do not** include general dev knowledge, tutorials, or explanations of core JS/TS/React functionality
- **Do not** modify unrelated files; always recursively check dependencies and update all affected files for any core change
- **Do not** update package.json with deprecated or unstable dependencies; only use libraries already referenced
- **Do not** omit backend updates when adding/modifying frontend logic (and vice versa)
- **Do not** include non-English comments
- **Always** update both frontend and backend when core entities, types, or business logic change
- **Always** check for environment/config/route/dependency updates when making changes that affect system behavior

## Example Scenarios
- Adding a new database entity: Update schema, routers, types, and ensure both frontend and backend are in sync
- Adding a new API endpoint: Update routers, orpc client, and relevant types in both apps
- Modifying authentication: Update logic and config in both server and client auth modules

**Summary**: Maintain full type safety, follow recursive dependency updates, never include general or unrelated knowledge, and always keep the monorepo in sync across both apps for any core change.

