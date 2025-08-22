# Start from Bun official image
FROM oven/bun:1.2.20 AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install --production

# Copy all source code
COPY . .

# Compile Bun app to a standalone Linux x64 binary
RUN bun build --compile --target=bun-linux-x64 ./src/index.ts --outfile server

# --- Minimal runner stage ---
FROM gcr.io/distroless/cc-debian12:nonroot AS runner
WORKDIR /app
COPY --from=builder /app/server /app/server

# Use non-root user for security (distroless default is 65532)
USER 65532:65532

# Expose port 3000 (optional)
EXPOSE 3000

# Start server binary
ENTRYPOINT ["/app/server"]

