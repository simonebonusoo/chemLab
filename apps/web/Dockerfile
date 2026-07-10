# ChemLab web — multi-stage build (monorepo context = repo root)
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /repo

# Copy manifests first for better layer caching.
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @chemlab/web build

# ── Serve static build with nginx ────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
# SPA fallback so client-side routes work on refresh.
RUN printf 'server {\n listen 80;\n root /usr/share/nginx/html;\n location / {\n  try_files $uri $uri/ /index.html;\n }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
