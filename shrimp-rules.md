# Development Guidelines

## Project Overview
- This project is a PMI Exam Portal built with Better-T-Stack (React, TanStack Router, Hono, Bun, Drizzle ORM, Better Auth)
- All rules apply only to project modification and AI agent operation, not to general development practice

## Directory & Architecture Standards
- Main directories: apps/web (frontend), apps/server (backend), each with src, components, routes, lib, db/schema
- All additions, deletions, or refactors must update related files in both frontend and backend as needed
- When modifying any route/component, check if corresponding changes are needed in route tree and context providers

## Code Standards
- Use consistent naming (camelCase for JS/TS, kebab-case for files, PascalCase for React components)
- Always include English comments for any complex logic added or modified
- Use imperative instructions in comments for AI agent clarity
- Do not add explanatory comments or general development knowledge

## Functionality Implementation Standards
- When adding or modifying API endpoints, update routers in apps/server/src/routers and client calls in apps/web/src/utils/orpc.ts
- For new database entities, modify schema in apps/server/src/db/schema and ensure related routers/types are updated
- UI components must follow shadcn/ui standards and be placed in apps/web/src/components/ui
- All authentication changes must update relevant files in apps/server/src/lib/auth.ts and apps/web/src/lib/auth-client.ts
- Always check for multi-file dependencies before finalizing edits

## External Dependencies Usage
- Only use dependencies already referenced in package.json
- Any addition of libraries must be reflected in both frontend and backend package.json where appropriate
- Always verify compatibility with Bun runtime before using new modules

## Workflow Standards
- Maintain type safety across stack (database, backend, frontend)
- After modifying API or DB schema, run type checks and update affected types
- Always run bun check-types after schema changes

## Key File Interaction Standards
- When modifying README.md, also update CLAUDE.md if changes affect developer instructions
- If database schema changes, update drizzle.config and .env.example as needed
- Route changes must update routeTree.gen.ts and related route files

## AI Decision-making Standards
- Prioritize minimal impact edits and recursive file evaluation
- If ambiguous, default to updating related files in both apps/web and apps/server
- Use decision trees to determine edit scope: (1) What module is affected? (2) Are there cross-module dependencies? (3) Do changes affect developer docs or environment?

## Prohibited Actions
- Do not include general development knowledge or tutorials
- Do not explain project functionality; focus only on modification instructions
- Do not modify unrelated files
- Do not update package.json with deprecated or unstable packages

## Examples
**Do:**
- Add a new question entity: update schema, router, and types for both backend and frontend
- Modify authentication: edit both server and client auth logic
**Do Not:**
- Add code comments explaining JavaScript basics
- Change unrelated files when updating one module

**Bold Rules:**
- Always recursively check for dependencies and required updates in related files
- Never include general knowledge outside project context
- Always update both frontend and backend when core entities change
