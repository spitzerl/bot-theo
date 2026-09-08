FROM node:20-alpine

# Installer dumb-init pour une gestion propre des signaux Docker (SIGINT / SIGTERM)
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev || npm install --omit=dev

# Copier le code du bot
COPY bot.js ./

# Utiliser l'utilisateur non-root par sécurité
USER node

ENV NODE_ENV=production

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "bot.js"]
