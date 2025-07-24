# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PMI exam portal built with the Better-T-Stack, featuring a modern TypeScript monorepo with:
- **Frontend**: React + TanStack Router + Vite (port 3001)
- **Backend**: Hono + ORPC + Bun (port 3000)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email/password
- **Package Manager**: Bun with workspaces

## Development Commands

### Running the Application
```bash
bun dev              # Start both web and server in development
bun dev:web          # Start only frontend (port 3001)
bun dev:server       # Start only backend (port 3000)
```

### Building and Type Checking  
```bash
bun build            # Build all applications
bun check-types      # TypeScript check across all apps
```

### Database Operations
```bash
bun db:push          # Push schema changes to database
bun db:studio        # Open Drizzle Studio UI
bun db:generate      # Generate migration files
bun db:migrate       # Run migrations
bun db:start         # Start PostgreSQL via Docker Compose
bun db:watch         # Start PostgreSQL with logs
bun db:stop          # Stop PostgreSQL container
bun db:down          # Stop and remove PostgreSQL container
```

## Architecture

### Monorepo Structure
- `apps/server/` - Hono backend with ORPC APIs
- `apps/web/` - React frontend with TanStack Router
- Shared type safety between frontend and backend via ORPC

### Backend Architecture (`apps/server/`)
- **Entry Point**: `src/index.ts` - Hono app with CORS, auth routes, and RPC handler
- **Authentication**: Better Auth with Drizzle adapter, email/password + admin plugin
- **Database**: Drizzle ORM with PostgreSQL, schema in `src/db/schema/`
- **API Layer**: ORPC procedures in `src/routers/`, type-safe with middleware
- **Context**: Session and database access via `src/lib/context.ts`
- **Environment**: Type-safe env vars via `@t3-oss/env-core` in `src/env.ts`

### Frontend Architecture (`apps/web/`)
- **Routing**: File-based routing with TanStack Router in `src/routes/`
- **API Client**: ORPC client with TanStack Query integration
- **Authentication**: Better Auth React client with admin plugin
- **Components**: shadcn/ui components in `src/components/`
- **Styling**: TailwindCSS with next-themes for dark mode

### Key Patterns

**ORPC Procedures**:
- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authenticated session
- Middleware for auth checking with proper error handling

**Database Schema**:
- Better Auth tables: `user`, `session`, `account`, `verification`
- User roles, banning, and admin functionality built-in

**Type Safety**:
- Full end-to-end type safety from database to frontend
- ORPC provides OpenAPI integration and type inference
- Environment variables validated with Zod schemas

## Environment Setup

### Required Environment Variables
Create `apps/server/.env`:
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
RESEND_API_KEY=your-resend-key
```

### Database Setup
The project requires PostgreSQL. Use Docker Compose for local development:
```bash
bun db:start  # Starts PostgreSQL container
bun db:push   # Apply schema to database
```

## Testing and Development

- Use Drizzle Studio (`bun db:studio`) for database inspection
- The backend serves at `http://localhost:3000` with `/api/auth/**` for auth endpoints
- Frontend development server at `http://localhost:3001`
- RPC endpoints available at `/rpc/*` for type-safe API calls
- Authentication state managed through Better Auth with cookie-based sessions