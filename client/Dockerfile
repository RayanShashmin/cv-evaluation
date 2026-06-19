# Client (Next.js) Dockerfile - Optimized for speed and size
FROM node:18-alpine AS base

# Builder stage
FROM base AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies (build will need devDependencies)
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# Copy application source
COPY . .

# Build argument for API URL
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application with standalone output
RUN npm run build

# Production stage - minimal runtime
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use standalone server for smaller image
CMD ["node", "server.js"]
