# Base

FROM node:24 AS base

WORKDIR /app

COPY package*.json ./
COPY common/package*.json ./common/
COPY backend/package*.json ./backend/

RUN npm ci

COPY common ./common
COPY --exclude=docker-entrypoint.sh backend ./backend
COPY themes ./uploads/themes

RUN npm run build -w @kochbuch/common



# Build

FROM base AS build

RUN npm run build -w @kochbuch/backend



# Production

FROM node:24 AS production

WORKDIR /app

COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY package*.json ./
COPY common/package*.json ./common/
COPY backend/package*.json ./backend/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN npm ci --omit=dev

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/common/dist ./common/dist
COPY themes ./uploads/themes

WORKDIR /app/backend

EXPOSE 5001

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]



# Development

FROM base AS development

COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /app/backend

EXPOSE 5001

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]