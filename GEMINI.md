# Project Overview

This is a full-stack exam portal application built with the **Better-T-Stack**. It features a monorepo structure with a React frontend and a Hono backend.

-   **Frontend (`apps/web`):** A modern web application built with React, Vite, TanStack Router for file-based routing, TailwindCSS, and `shadcn/ui` for components. It communicates with the backend using oRPC for end-to-end type safety.
-   **Backend (`apps/server`):** A lightweight and performant API server built with Hono. It uses Drizzle as a TypeScript-first ORM for interacting with a PostgreSQL database and `better-auth` for authentication.

The project is configured to run with Bun.

# Building and Running

1.  **Install Dependencies:**
    ```bash
    bun install
    ```

2.  **Database Setup:**
    *   Copy the `.env.example` file in `apps/server` to `.env`.
    *   Update the `.env` file with your PostgreSQL connection string.
    *   Push the database schema:
        ```bash
        bun db:push
        ```

3.  **Run Development Servers:**
    This command starts the frontend (web) and backend (server) applications concurrently.
    ```bash
    bun dev
    ```
    *   Web app will be available at `http://localhost:3001`.
    *   API server will be available at `http://localhost:3000`.
    *   Drizzle Studio (database UI) will be available at its configured port.

4.  **Build for Production:**
    ```bash
    bun build
    ```

# Key Scripts

-   `bun dev`: Start all applications in development mode.
-   `bun dev:web`: Start only the web application.
-   `bun dev:server`: Start only the server application.
-   `bun build`: Build all applications for production.
-   `bun check-types`: Run TypeScript type checking across the entire project.
-   `bun db:push`: Push schema changes to the database.
-   `bun db:studio`: Open the Drizzle Studio UI to manage your database.

# Development Conventions

-   **Monorepo:** The project is organized as a monorepo with separate packages for the `web` and `server` applications under the `apps` directory.
-   **Type Safety:** End-to-end type safety is a core principle, enforced by TypeScript, oRPC, and Drizzle.
-   **UI Components:** The frontend uses `shadcn/ui` for its component library. When adding new UI, prefer using or extending these components.
-   **Database Migrations:** Database schema changes are managed using `drizzle-kit`. Use the `db:push` or `db:migrate` scripts to apply changes.
-   **API:** The API is built using oRPC. Define new procedures and routers in the `apps/server/src/routers` directory. The client-side queries and mutations are then available through the oRPC client in the web app.
