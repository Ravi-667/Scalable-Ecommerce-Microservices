FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# For development run the dev server; for production change to build + static server
CMD ["npm", "run", "dev"]
