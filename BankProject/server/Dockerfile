FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY server/ ./server/

WORKDIR /app/server

EXPOSE 3000

CMD ["node", "server.js"]
