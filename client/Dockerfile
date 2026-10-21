# Base

FROM node:24 AS base

WORKDIR /app

COPY package*.json ./
COPY common/package*.json ./common/
COPY client/package*.json ./client/

RUN npm ci

COPY common ./common
COPY --exclude=docker-entrypoint.sh client ./client

RUN npm run build -w @kochbuch/common



# Build

FROM base AS builder

RUN npm run build -w @kochbuch/client



# Production

FROM nginx:alpine AS production

COPY client/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]



# Development

FROM base AS development

COPY client/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /app/client

EXPOSE 5173

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "--host"]