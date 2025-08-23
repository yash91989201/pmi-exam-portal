# Build stage
FROM oven/bun:1.2.20 as builder

WORKDIR /app

# Copy package files for dependency resolution
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy all source code needed for web build (web app needs server for type definitions and schemas)
COPY apps/web ./apps/web
COPY apps/server ./apps/server

# Set environment variables for build
ARG VITE_SERVER_URL=http://localhost:3000
ENV VITE_SERVER_URL=${VITE_SERVER_URL}

# Build the web application
WORKDIR /app/apps/web
RUN bun run build

# Production stage
FROM oven/bun:1.2.20-slim as production

WORKDIR /app

# Copy only the built dist folder from builder stage
COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/package.json ./package.json

# Expose port
EXPOSE 3001

# Start the application
CMD ["bun", "start"]

