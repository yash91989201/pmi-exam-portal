# Build stage
FROM oven/bun:1.2.20 as builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY apps/server/src/lib/schema ./apps/server/src/lib/schema
COPY apps/server/src/lib/types ./apps/server/src/lib/types
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json

# Build the application
WORKDIR /app/apps/web
RUN bun run build

# Production stage
FROM oven/bun:1.2.20-slim as production

WORKDIR /app

# Install serve globally for serving static files
RUN bun add -g serve

# Copy built application from builder stage
COPY --from=builder /app/apps/web/dist ./dist

# Expose port
EXPOSE 3001

# Start the application
CMD ["serve", "-s", "dist", "-l", "3001"]

