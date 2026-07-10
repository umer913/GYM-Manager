# ─────────────────────────────────────────────
# Stage 1 — deps
# Install production + dev dependencies so the
# build step has everything it needs.
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

# libc compat for native modules (bcryptjs, etc.)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy manifests only — layer-cache friendly
COPY package.json package-lock.json* ./

RUN npm ci --frozen-lockfile --legacy-peer-deps


# ─────────────────────────────────────────────
# Stage 2 — builder
# Compile the Next.js app using standalone output
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Enable Next.js standalone output so the final
# image only ships what's needed to run the app.
# This is set here via env rather than next.config.js
# so the source file stays clean.
ENV NEXT_TELEMETRY_DISABLED=1

# Build the app — env vars that are BAKED IN at build
# time (public NEXT_PUBLIC_* vars) should be passed
# here as --build-arg if needed. Runtime secrets like
# MONGODB_URI and JWT_SECRET are NOT needed at build.
RUN npm run build


# ─────────────────────────────────────────────
# Stage 3 — runner  (final, smallest image)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what Next.js needs to run:
#   public/        → static assets
#   .next/static/  → client-side chunks
#   .next/standalone/ → minimal server + node_modules

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Next.js listens on 3000 by default
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# next start equivalent — standalone output uses server.js
CMD ["node", "server.js"]
