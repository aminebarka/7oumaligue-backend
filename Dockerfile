# Étape de build
FROM node:22.15.0-bookworm AS builder

# Installer les dépendances système pour les modules natifs
RUN apt-get update && \
    apt-get install -y build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config

# Configurer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma

# Installer les dépendances (incluant devDependencies)
RUN npm install --include=dev

# Copier tout le code source
COPY . .

# Builder l'application avec chemin explicite
RUN ./node_modules/.bin/tsc

# Étape d'exécution finale
FROM node:22.15.0-bookworm-slim

# Installer les dépendances système d'exécution
RUN apt-get update && \
    apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configurer le répertoire de travail
WORKDIR /app

# Copier les artefacts de build depuis l'étape builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Variables d'environnement
ENV PORT=8080
ENV NODE_ENV=production

# Exposer le port
EXPOSE 8080

# Commande de démarrage
CMD ["node", "dist/src/server.js"] 