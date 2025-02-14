# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Install all dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application code and build
COPY src ./src
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install runtime tools for bcryptjs and Prisma migrations
RUN apk add --no-cache openssl

# Copy only runtime files from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
