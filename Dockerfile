# ===================
#    Stage 1: Build
# ===================
FROM node:18-alpine AS build
WORKDIR /app

RUN apk add --no-cache openssl

# Install all dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy the rest of the application code and build
COPY ./src ./src
COPY ./prisma ./prisma
RUN npx prisma generate

RUN npm run build

# Runtime stage
FROM node:18-alpine AS production
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
