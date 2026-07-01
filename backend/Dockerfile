# Backend: Express API (Node)
FROM node:20-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# App source
COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/app.js"]
