# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PMI Exam Portal built with the Better-T-Stack, a modern full-stack TypeScript application featuring:

- **Monorepo Structure**: Uses Bun workspaces with separate `apps/` and `packages/` directories
- **Frontend**: React + TanStack Router + Vite (runs on port 3001)
- **Backend**: Hono + oRPC API server (runs on port 3000)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email/password
- **Shared Package**: Common types, schemas, and database definitions
- **Runtime**: Bun for package management and execution

## Development Commands

### Primary Development
```bash
# Start all services (recommended for development)
bun dev

# Start individual services
bun dev:web     # Frontend only (port 3001)
bun dev:server  # Backend only (port 3000)
```

### Database Operations
```bash
# Start PostgreSQL with Docker
bun db:start    # Start in detached mode
bun db:watch    # Start with logs visible
bun db:stop     # Stop containers
bun db:down     # Stop and remove containers

# Schema management
bun db:push     # Push schema changes to database
bun db:generate # Generate migrations
bun db:migrate  # Run migrations
bun db:studio   # Open Drizzle Studio UI
```

### Build and Type Checking
```bash
bun build       # Build all applications
bun check-types # Type check all applications
```

## Architecture

### Monorepo Structure
```
apps/
├── web/           # React frontend with TanStack Router
│   ├── src/
│   │   ├── components/    # UI components (shadcn/ui based)
│   │   ├── routes/        # File-based routing
│   │   ├── lib/           # Client utilities
│   │   └── utils/         # ORPC client setup
├── server/        # Hono backend with ORPC
│   ├── src/
│   │   ├── db/            # Database connection
│   │   ├── lib/           # Server utilities (auth, ORPC setup)
│   │   └── routers/       # API route definitions

packages/
└── shared/        # Shared types, schemas, and database definitions
    ├── src/
    │   ├── db/schema/     # Drizzle database schemas
    │   ├── types/         # Shared TypeScript types
    │   └── validation/    # Zod schemas
```

### Key Architecture Patterns

**Type-Safe API Communication**: Uses ORPC for end-to-end type safety between frontend and backend. The client is configured in `apps/web/src/utils/orpc.ts` with automatic error handling via toast notifications.

**Authentication Flow**: Better Auth handles authentication with session-based auth. Protected routes use `protectedProcedure` middleware in the backend (`apps/server/src/lib/orpc.ts`).

**Database Layer**: Drizzle ORM with PostgreSQL. All schemas are defined in the shared package (`packages/shared/src/db/schema/`) and consumed by both applications. Database configuration is in `apps/server/drizzle.config.ts`.

**Shared Package Architecture**: The `shared` package exports database schemas, types, and validation schemas with proper TypeScript module resolution. It auto-builds on changes during development.

### Environment Configuration

The server requires these environment variables (see `apps/server/.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGIN`: Frontend URL for CORS
- `BETTER_AUTH_SECRET`: Authentication secret
- `BETTER_AUTH_URL`: Base URL for auth callbacks
- `RESEND_API_KEY`: Email service API key

### Development Database Setup

The project uses Docker for PostgreSQL:
1. Run `bun db:start` to start PostgreSQL container
2. Configure `DATABASE_URL` in `apps/server/.env`
3. Run `bun db:push` to create tables
4. Use `bun db:studio` to inspect database

### File-Based Routing

The frontend uses TanStack Router with file-based routing in `apps/web/src/routes/`. Route files automatically generate type-safe navigation with the `@tanstack/router-plugin`.

### Component Architecture

UI components use shadcn/ui with Tailwind CSS v4. Components are in `apps/web/src/components/` with a `ui/` subdirectory for base components. The project uses `next-themes` for dark mode support.

## Working with the Codebase

- **Adding API Endpoints**: Create procedures in `apps/server/src/routers/index.ts` using `publicProcedure` or `protectedProcedure`
- **Database Changes**: Update schemas in `packages/shared/src/db/schema/`, then run `bun db:push`
- **Adding Routes**: Create new route files in `apps/web/src/routes/` following TanStack Router conventions
- **Shared Types**: Add common types to `packages/shared/src/types/` for use across applications
- **Environment Variables**: Add new variables to `apps/server/.env.example` and update validation in `apps/server/src/env.ts`

## Important Notes

- The shared package must be built before other applications can use it in production builds
- ORPC provides full type safety - changes to backend procedures automatically type the frontend client
- Better Auth requires proper CORS configuration for cross-origin requests
- All database operations should use the shared schemas for consistency
- The project uses Bun's workspace protocol (`workspace:*`) for internal package dependencies