# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# ---- Dependencies ----
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Dummy build-time values so `next build` can evaluate modules that read
# env vars at import time. Real secrets are injected at runtime via
# docker-compose / your platform's env config, never baked into the image.
ENV MONGODB_URI="mongodb://placeholder:27017/placeholder"
ENV AUTH_SECRET="build-time-placeholder-please-override-at-runtime"
ENV JWT_SECRET="build-time-placeholder"
ENV JWT_RESET_SECRET="build-time-placeholder"

RUN npm run build

# ---- Runtime ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
