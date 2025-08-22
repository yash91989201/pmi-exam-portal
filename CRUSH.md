PMI Exam Portal — Agent Quick Reference (CRUSH)
Monorepo: apps/web (React 19, TanStack Router, Tailwind v4, shadcn/ui) and apps/server (Hono, oRPC, Better Auth); Bun workspaces.
Build/Run
- bun dev → start web (3001), server (3000), DB studio
- Per app: bun run --filter web dev | bun run --filter server dev
- Builds: bun run build | bun run --filter web build | bun run --filter server build
- DB: bun run db:start; bun run db:push; bun run db:studio; bun run db:stop
Lint/Format/Types
- Biome: bunx @biomejs/biome format --write; bunx @biomejs/biome check [--fix]
- Types: bun run check-types (may fail currently; see Copilot rules)
Tests
- No test runner configured. If Bun test exists: bun test
- Single file/name: bun test path/to/file.test.ts; bun test -t "name"
- If Vitest: bunx vitest run path/to/file.test.ts -t "name"
Code Style
- Imports: ESNext + verbatimModuleSyntax; prefer named exports; type-only imports; aliases web:@/*, server:@/*
- Formatting: Biome (tabs, double quotes); organize imports
- Types: strict TS; avoid any; validate with zod; prefer readonly & const assertions
- Naming: camelCase vars/fns; PascalCase components/types; kebab-case files; hooks start with use-
- React: pure components; typed props; TanStack Router file routes; avoid default exports
- Errors/Security: server throws ORPCError ("UNAUTHORIZED"/"FORBIDDEN") + zod; client surfaces safe messages; secrets only in apps/server/.env; CORS via env.CORS_ORIGIN; never log tokens/credentials
API/DB
- oRPC at /rpc/* with protectedProcedure/adminProcedure; Drizzle + PostgreSQL; run bun run db:push after schema changes
AI Assistant Rules
- Read .github/copilot-instructions.md (don’t cancel builds; typecheck/runtime caveats; drizzle-zod note)
- No Cursor rules found; .crush is gitignored