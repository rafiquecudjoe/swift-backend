# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    mkdir -p /app/logs && chown appuser:appgroup /app/logs
USER appuser

EXPOSE 3000

CMD ["npm", "run", "start:docker"]
