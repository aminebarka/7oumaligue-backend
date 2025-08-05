# Étape de build
FROM node:18-alpine AS builder
WORKDIR /app

# Installer les dépendances système pour bcrypt et autres
RUN apk add --no-cache python3 make g++ git

# Copier et installer les dépendances Node
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le code source et compiler TypeScript
COPY . .
RUN npm run build

# Étape d'exécution légère
FROM node:18-alpine
WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Générer le client Prisma
RUN npx prisma generate

# Variables d'environnement
ENV PORT=8080
EXPOSE $PORT

# Commande de démarrage
CMD ["node", "dist/src/server.js"]