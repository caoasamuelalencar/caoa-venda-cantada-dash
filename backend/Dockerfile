FROM node:24-bullseye-slim AS builder
WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .
COPY backend/package.json backend/tsconfig.json backend/prisma ./backend/
COPY backend/src ./backend/src
RUN pnpm install --frozen-lockfile || true
RUN pnpm approve-builds --all
RUN pnpm install --frozen-lockfile
RUN pnpm --filter caoa-venda-cantada-api exec prisma generate
RUN pnpm --filter caoa-venda-cantada-api build
RUN pnpm --dir backend approve-builds --all
RUN CI=true pnpm --dir backend install --prod --frozen-lockfile

FROM node:24-bullseye-slim AS runner
WORKDIR /workspace
RUN apt-get update && apt-get install -y libssl1.1 && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY backend/package.json ./backend/
COPY --from=builder /workspace/backend/dist ./backend/dist
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/backend/node_modules ./backend/node_modules
COPY backend/.env.example ./backend/.env.example

WORKDIR /workspace/backend
EXPOSE 4000
ENV NODE_ENV=production
CMD ["pnpm", "start"]
