FROM oven/bun:1.2.20 AS builder

WORKDIR /app

# Install all dependencies needed during build
COPY package.json bun.lock ./
RUN bun install

# Copy application source
COPY . .

# Compile for the platform Docker is building on

RUN bun install && bun build \
  --compile \
  ./apps/server/src/index.ts \
  --outfile server

# Tiny static wget for the container health check; distroless ships no shell or
# HTTP client, so we borrow busybox instead of fattening the runtime image.
FROM busybox:1.37.0-uclibc AS busybox

FROM gcr.io/distroless/cc-debian12:nonroot AS runner

WORKDIR /app

COPY --from=builder /app/server /app/server
COPY --from=busybox /bin/busybox /bin/busybox

USER 65532:65532

EXPOSE 3000

# GET / returns "OK" (see apps/server/src/index.ts)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/bin/busybox", "wget", "-q", "-T", "4", "-O", "-", "http://127.0.0.1:3000/"]

ENTRYPOINT ["/app/server"]
