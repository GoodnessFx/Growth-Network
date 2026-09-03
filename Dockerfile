# Growth Network — Hono API server (Supabase backend, no SQLite).
# better-sqlite3 and whatsapp-web.js have been removed from package.json.
# This Dockerfile builds the backend only; the frontend is served separately.

FROM node:22-slim

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Install dependencies — no native compilation required (Supabase-only stack)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy server source
COPY server ./server
COPY tsconfig.json ./

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["pnpm", "exec", "tsx", "server/src/index.ts"]
