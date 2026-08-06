# Growth Network API — long-running Node process (option b).
# Works on Railway (Dockerfile) and Render (render.yaml), with SQLite on a
# persistent disk volume mounted at /data.

FROM node:22-slim

WORKDIR /app

# pnpm is the project's package manager (see .mise.toml / package.json).
RUN corepack enable

# Install production dependencies first for better layer caching.
COPY package.json pnpm-lock.yaml ./
RUN corepack prepare pnpm@10.33.0 --activate \
  && pnpm install --frozen-lockfile

# Copy source. server/ contains the Hono API; src/ is only needed for the
# Vite frontend, which is NOT built here (Vercel builds the frontend).
COPY server ./server
COPY tsconfig.json ./

ENV NODE_ENV=production
ENV PORT=3001
# Persistent volume path — override per-host (Railway mount, Render disk).
ENV DB_PATH=/data/growth-network.db

EXPOSE 3001

CMD ["pnpm", "exec", "tsx", "server/src/index.ts"]
