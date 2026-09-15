# Base

FROM node:24 AS base

WORKDIR /app

COPY package*.json ./
COPY common/package*.json ./common/
COPY client/package*.json ./client/

RUN npm ci

COPY common ./common
COPY client ./client

RUN npm run build -w @kochbuch/common



# Build

FROM base AS builder

RUN npm run build -w @kochbuch/client



# Production

FROM nginx:alpine AS production

COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



# Development

FROM base AS development

WORKDIR /app/client

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]