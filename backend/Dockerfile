# Base

FROM node:24 AS base

WORKDIR /app

COPY package*.json ./
COPY common/package*.json ./common/
COPY backend/package*.json ./backend/

RUN npm ci

COPY common ./common
COPY backend ./backend
COPY themes ./uploads/themes

RUN npm run build -w @kochbuch/common



# Build

FROM base AS build

RUN npm run build -w @kochbuch/backend



# Production

FROM node:24 AS production

WORKDIR /app

COPY package*.json ./
COPY common/package*.json ./common/
COPY backend/package*.json ./backend/

RUN npm ci --omit=dev

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/common/dist ./common/dist
COPY themes ./uploads/themes

WORKDIR /app/backend

EXPOSE 5001

CMD ["npm", "start"]



# Development

FROM base AS development

WORKDIR /app/backend

EXPOSE 5001

CMD ["npm", "run", "dev"]