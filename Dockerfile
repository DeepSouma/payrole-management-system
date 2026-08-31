FROM node:20-alpine AS base

# Install OpenSSL and libc compatibility for Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy dependency manifests and prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies needed for build & seed)
RUN npm install

# Copy application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Ensure entrypoint is executable and has Unix LF line endings
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
