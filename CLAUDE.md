# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PMI Exam Portal built with Better-T-Stack, a modern full-stack TypeScript application with separate web and server applications in a monorepo structure.

## Architecture

### Monorepo Structure
- **apps/web**: React frontend with TanStack Router
- **apps/server**: Hono backend API with oRPC

### Technology Stack
- **Frontend**: React 19, TanStack Router, TailwindCSS, shadcn/ui
- **Backend**: Hono, oRPC for type-safe APIs, Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **Runtime**: Bun
- **Styling**: TailwindCSS v4 with shadcn/ui components

### Core Architecture Patterns

#### Type-Safe API Communication
- Uses oRPC for end-to-end type safety between client and server
- Client setup in `apps/web/src/utils/orpc.ts` with TanStack Query integration
- Server procedures defined in `apps/server/src/lib/orpc.ts` with public/protected middleware
- Router aggregation in `apps/server/src/routers/index.ts`

#### Authentication Flow
- Better Auth handles authentication with email/password
- Context creation in `apps/server/src/lib/context.ts` extracts session from headers
- Protected routes use `protectedProcedure` middleware requiring authenticated session
- Client auth setup in `apps/web/src/lib/auth-client.ts`

#### Database Schema
- Main entities: `exam`, `question`, `option` with proper relations
- Auth entities: `user`, `session`, `account`, `verification`
- Drizzle relations define foreign key relationships and joins

#### Routing Architecture
- File-based routing with TanStack Router
- Route tree auto-generated in `apps/web/src/routeTree.gen.ts`
- Root layout in `apps/web/src/routes/__root.tsx` with theme provider
- Protected dashboard route with auth context

## Development Commands

### Starting Development
```bash
bun dev              # Start both web and server in development
bun dev:web          # Start only frontend (port 3001)
bun dev:server       # Start only backend (port 3000)
```

### Database Operations
```bash
bun db:push          # Push schema changes to database
bun db:studio        # Open Drizzle Studio UI
bun db:generate      # Generate migrations
bun db:migrate       # Run migrations
bun db:start         # Start PostgreSQL via Docker Compose
bun db:stop          # Stop PostgreSQL container
bun db:down          # Remove PostgreSQL container
```

### Build and Type Checking
```bash
bun build            # Build all applications
bun check-types      # Type check all applications
```

### Testing Individual Components
```bash
# Frontend development
cd apps/web && bun dev

# Backend development  
cd apps/server && bun run --hot src/index.ts

# Type checking specific app
cd apps/web && bun run check-types
cd apps/server && bun run check-types
```

## Environment Configuration

### Server Environment (apps/server/.env)
Required environment variables defined in `apps/server/src/env.ts`:
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Auth encryption secret
- `BETTER_AUTH_URL`: Auth service base URL
- `CORS_ORIGIN`: Frontend origin for CORS
- `RESEND_API_KEY`: Email service API key

### Development URLs
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Auth endpoints: http://localhost:3000/api/auth/**
- RPC endpoints: http://localhost:3000/rpc/*

## Key Implementation Patterns

### Adding New API Endpoints
1. Define procedure in `apps/server/src/routers/` using `publicProcedure` or `protectedProcedure`
2. Export from `apps/server/src/routers/index.ts`
3. Use in frontend via `orpcClient` with full type safety

### Adding New Routes
1. Create route file in `apps/web/src/routes/`
2. Route tree regenerates automatically
3. Use `createFileRoute` from TanStack Router
4. Access auth context via router context

### Database Schema Changes
1. Modify schema in `apps/server/src/db/schema/`
2. Run `bun db:push` to apply changes
3. Update TypeScript types automatically via Drizzle

### Authentication Integration
- Check auth status via `authClient.getSession()`
- Protect server routes with `protectedProcedure`
- Access user session in components via router context
- Better Auth handles session management and CSRF protection

## Component Architecture

### UI Components
- shadcn/ui components in `apps/web/src/components/ui/`
- Custom components like `Header`, `UserMenu`, authentication forms
- Theme provider with dark/light mode support

### Form Handling
- TanStack Form for type-safe form management
- Zod schemas for validation
- Integration with auth flows in sign-in/sign-up forms

## Development Notes

- Uses Bun workspaces for monorepo management
- Hot reload enabled for both frontend and backend development
- Type safety enforced across the entire stack from database to UI
- Docker Compose for local PostgreSQL development
- Better Auth provides secure authentication with minimal setup