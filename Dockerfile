FROM node:20-alpine

# Installer uniquement les dépendances essentielles
RUN apk add --no-cache make gcc g++ python3

WORKDIR /app

# 1. Copier les fichiers essentiels en premier
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# 2. Installer les dépendances
RUN npm install --production

# 3. Copier le fichier .env (s'il existe) - optionnel
COPY .env* ./

# 4. Générer le client Prisma
RUN npx prisma generate

# 5. Installer les types supplémentaires
RUN npm install @types/bcryptjs @types/cors @types/express @types/jsonwebtoken @types/node

# 6. Copier le reste du code
COPY . .

# 7. Compiler l'application
RUN npm run build

# Définir les variables d'environnement de façon explicite
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer la propriété des fichiers
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/src/server.js"]