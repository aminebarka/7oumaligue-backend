FROM node:20-alpine AS build

# Installer build tools (pour bcrypt, sharp, etc.)
RUN apk add --no-cache make gcc g++ python3

WORKDIR /app

# Copier package.json, package-lock.json et dossier prisma pour npm ci + prisma generate
COPY package*.json ./ 
COPY prisma ./prisma

# Installer toutes les dépendances (dev + prod) pour compiler
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste des fichiers (code source + tsconfig)
COPY tsconfig.json ./
COPY . .

# Compiler le code
RUN npm run build

# -------- Production stage --------
  FROM node:20-alpine

  WORKDIR /app
  
  # Copier package.json et prisma AVANT npm ci
  COPY package*.json ./
  COPY prisma ./prisma
  
  RUN npm ci --omit=dev
  
  COPY --from=build /app/dist ./dist
  COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
  COPY --from=build /app/.env* ./
  
  # Variables d'environnement
  ENV PORT=8080
  ENV HOST=0.0.0.0
  ENV NODE_ENV=production
  
  # Utilisateur non-root
  RUN addgroup -g 1001 -S nodejs \
   && adduser -S nodejs -u 1001 \
   && chown -R nodejs:nodejs /app
  USER nodejs
  
  EXPOSE 8080
  
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js
  
  CMD ["node", "dist/src/server.js"]
  