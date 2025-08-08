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

# 3. Copier le fichier .env (s'il existe)
COPY .env ./

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

EXPOSE 8080

CMD ["node", "dist/src/server.js"]