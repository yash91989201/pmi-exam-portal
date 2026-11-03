# Build stage
# Node, not Bun: the deploy host CPU lacks SSE4.2, which every Bun build requires.
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files for dependency resolution
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/

# No package-lock.json in repo (bun.lock is Bun-only), so resolution is not pinned.
# --legacy-peer-deps: npm's strict peer check rejects what Bun installs happily.
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy application source
COPY apps/server ./apps/server

# Bundle to apps/server/dist/index.js (tsdown); dependencies stay external
RUN npm run build --workspace server

# Runtime needs production modules only
RUN npm prune --omit=dev --no-audit --no-fund

# Tiny static wget for the container health check; distroless ships no shell or
# HTTP client, so we borrow busybox instead of fattening the runtime image.
FROM busybox:1.37.0-uclibc AS busybox

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/server/dist /app/dist
COPY --from=builder /app/apps/server/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=busybox /bin/busybox /bin/busybox

USER 65532:65532

EXPOSE 3000

# GET / returns "OK" (see apps/server/src/index.ts)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/bin/busybox", "wget", "-q", "-T", "4", "-O", "-", "http://127.0.0.1:3000/"]

ENTRYPOINT ["/nodejs/bin/node", "/app/dist/index.js"]
