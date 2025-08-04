FROM oven/bun:1.1.13 AS builder
WORKDIR /app
COPY package.json bun.lockb ./
COPY . .
RUN bun install --frozen-lockfile \
  bun run build

# ----------- Production Stage ------------
FROM oven/bun:1.1.13 AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies (if any)
RUN bun install --production

EXPOSE 3000
CMD ["bun", "start"]

