FROM node:18-alpine
WORKDIR /app

# install only production deps
COPY package*.json ./
RUN npm ci --only=production

COPY . .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]
