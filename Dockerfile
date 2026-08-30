# Build stage
FROM oven/bun:1.4.0 AS builder
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

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

# Build the web application
WORKDIR /app/apps/web
RUN bun run build

# Production stage - static SPA served by nginx
FROM nginx:1.29-alpine AS production

# Drop the default nginx site and install the SPA config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static build output: index.html, assets/, and files copied from apps/web/public
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Listen on 8080 so nginx can bind as the unprivileged nginx user
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/index.html || exit 1

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
