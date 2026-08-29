FROM oven/bun:1.2.20 AS builder

WORKDIR /app

# Install all dependencies needed during build
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application source
COPY . .

# Compile for the platform Docker is building on
RUN bun build \
    --compile \
    ./src/index.ts \
    --outfile server

FROM gcr.io/distroless/cc-debian12:nonroot AS runner

WORKDIR /app

COPY --from=builder /app/server /app/server

USER 65532:65532

EXPOSE 3000

ENTRYPOINT ["/app/server"]
