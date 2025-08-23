# PMI Exam Portal - GitHub Copilot Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Overview

PMI Exam Portal is a full-stack TypeScript monorepo built with Better-T-Stack, featuring:

- **Frontend**: React 19 + TanStack Router + TailwindCSS v4 + shadcn/ui
- **Backend**: Hono + oRPC for type-safe APIs + Better Auth  
- **Database**: PostgreSQL with Drizzle ORM
- **Runtime**: Bun (v1.2.19+)
- **Styling**: TailwindCSS v4 with shadcn/ui components
- **Linting**: Biome for formatting and linting

## Prerequisites & Environment Setup

Install Bun runtime first:

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

Docker is required for the PostgreSQL database.

## Working Effectively

### Initial Setup & Dependencies

Bootstrap the entire project with these commands:

```bash
# Install all dependencies - takes ~45 seconds
bun install

# Create Docker Compose file for PostgreSQL (first time only)
cd apps/server && cat > compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: pmi_exam_portal
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
EOF

# Create environment file (first time only)
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@localhost:5432/pmi_exam_portal
CORS_ORIGIN=http://localhost:3001
BETTER_AUTH_SECRET=your-secret-key-here-32-chars-long
BETTER_AUTH_URL=http://localhost:3000
RESEND_API_KEY=your-resend-api-key-here
EOF
```

### Database Operations

```bash
# Start PostgreSQL database - takes ~6 seconds first time (with image pull)
bun run db:start

# Push schema to database - takes ~0.5 seconds
bun run db:push

# Open Drizzle Studio UI
bun run db:studio  # Opens at https://local.drizzle.studio

# Stop database
bun run db:stop
```

### Build Operations

```bash
# Build all applications - takes ~5 seconds
bun run build

# Build individual apps
bun run --filter server build  # Takes ~0.2 seconds
bun run --filter web build     # Takes ~4 seconds
```

**CRITICAL BUILD TIMING**: NEVER CANCEL builds. Set timeout to 120+ seconds minimum for safety, though builds typically complete in under 10 seconds.

### Development Servers

Start development mode (all services):

```bash
# Starts web (3001), server (3000), and DB studio - takes ~2 seconds to start
bun dev
```

Individual services:

```bash
bun dev:web     # React frontend at http://localhost:3001
bun dev:server  # Hono API at http://localhost:3000
```

**TIMING**: Development servers start in ~2 seconds. NEVER CANCEL startup - wait at least 30 seconds.

### Code Quality & Linting

```bash
# Format code with Biome - takes ~0.1 seconds
bunx @biomejs/biome format --write

# Check code with Biome - takes ~3 seconds
bunx @biomejs/biome check

# Fix auto-fixable issues
bunx @biomejs/biome check --fix
```

## Validation Scenarios

### Manual Testing After Changes

Always run these validation steps after making changes:

1. **Database Setup Validation**:

   ```bash
   bun run db:start && bun run db:push
   ```

2. **Build Validation**:

   ```bash
   # NEVER CANCEL: Build takes ~5 seconds. Set timeout to 120+ seconds
   bun run build
   ```

3. **Development Server Validation**:

   ```bash
   # NEVER CANCEL: Servers start in ~2 seconds. Wait at least 30 seconds
   bun dev
   ```

   Test applications at:
   - Web app: <http://localhost:3001>
   - API health: <http://localhost:3000> (should return "OK")
   - Database UI: <https://local.drizzle.studio>

4. **Code Quality Validation**:

   ```bash
   bunx @biomejs/biome format --write
   bunx @biomejs/biome check
   ```

### Known Issues & Workarounds

- **TypeScript Type Checking**: `bun run check-types` currently fails due to existing issues with Better Auth type exports and route type mismatches. This is expected and does not prevent development or builds.
- **Runtime Errors**: The web application may show "Cannot read properties of undefined (reading 'role')" errors during development. This is related to authentication context and is expected in the current development state.
- **Missing Dependency**: If you encounter "Cannot find module 'drizzle-zod'" error, add it to the server: `cd apps/server && bun add drizzle-zod`

## Project Structure & Navigation

### Key Directories

```
pmi-exam-portal/
├── apps/
│   ├── web/         # React frontend (port 3001)
│   │   ├── src/components/    # React components
│   │   ├── src/routes/        # TanStack Router routes
│   │   └── src/utils/orpc.ts  # oRPC client setup
│   └── server/      # Hono backend (port 3000)
│       ├── src/db/           # Database schema & migrations
│       ├── src/routers/      # oRPC route definitions
│       └── src/lib/auth.ts   # Better Auth configuration
├── biome.json       # Linting/formatting configuration
└── package.json     # Workspace root scripts
```

### Frequently Modified Files

When working on:

- **API changes**: Check `apps/server/src/routers/` and run `bun run build` in server
- **Database changes**: Modify `apps/server/src/db/schema/` then run `bun run db:push`
- **UI changes**: Work in `apps/web/src/` and test at <http://localhost:3001>
- **Authentication**: Check `apps/server/src/lib/auth.ts` and `apps/web/src/lib/auth-client.ts`

### Important URLs (Development)

- Web Application: <http://localhost:3001>
- API Server: <http://localhost:3000>  
- Database Studio: <https://local.drizzle.studio>
- Auth Endpoints: <http://localhost:3000/api/auth/>**
- RPC Endpoints: <http://localhost:3000/rpc/>*

## Common Commands Reference

### Quick Start (Copy-Paste Ready)

```bash
# Complete setup from fresh clone
curl -fsSL https://bun.sh/install | bash && source ~/.bashrc
bun install
cd apps/server
# Create compose.yml and .env files (see "Working Effectively" section above)
bun run db:start && bun run db:push && cd ../..
bun run build && bun dev
```

### Daily Development

```bash
bun dev                              # Start all services
bunx @biomejs/biome format --write   # Format code
bunx @biomejs/biome check --fix      # Lint and fix
bun run build                        # Validate builds
```

### Database Management

```bash
bun run db:start    # Start PostgreSQL
bun run db:push     # Apply schema changes  
bun run db:studio   # Open database UI
bun run db:stop     # Stop PostgreSQL
```

## Architecture Notes

- **Type Safety**: oRPC provides end-to-end type safety from database to UI
- **Authentication**: Better Auth handles email/password auth with admin roles
- **Database**: Drizzle ORM with PostgreSQL, migrations in `apps/server/src/db/migrations/`
- **Routing**: File-based routing with TanStack Router, auto-generated route tree
- **Styling**: TailwindCSS v4 with shadcn/ui components and dark/light theme support

## Timing Expectations

- Dependency installation: ~45 seconds
- Database startup: ~6 seconds (first time with image pull)
- Schema push: ~0.5 seconds  
- Full build: ~5 seconds
- Development server startup: ~2 seconds
- Code formatting: ~0.1 seconds
- Code linting: ~3 seconds

**CRITICAL**: Always set timeouts of 120+ seconds for build commands and 30+ seconds for server startup. NEVER CANCEL long-running operations prematurely.
