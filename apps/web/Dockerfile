FROM oven/bun:1.2.19 AS builder
WORKDIR /app
COPY package.json bun.lockb ./
COPY . .
RUN bun install --frozen-lockfile \
  bun run build

# ----------- Production Stage ------------
FROM oven/bun:1.2.19 AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

RUN bun install --production

EXPOSE 3001
CMD ["bun", "serve"]

