# Build stage
FROM oven/bun:1.2.20 as builder

WORKDIR /app

# Copy package files for dependency resolution
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/

# Install dependencies
RUN bun install --production

# Copy all source code needed for web build (web app needs server for type definitions and schemas)
COPY apps/web ./apps/web
COPY apps/server ./apps/server

# Build the web application
WORKDIR /app/apps/web
RUN bun run build

# Production stage
FROM oven/bun:1.2.20-slim as production

WORKDIR /app

# Install serve globally for serving static files
RUN bun add -g serve

# Copy only the built dist folder from builder stage
COPY --from=builder /app/apps/web/dist ./dist

# Expose port
EXPOSE 3001

# Start the application
CMD ["serve", "-s", "dist", "-l", "3001"]

