# Base

FROM node:24 AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .



# Build

FROM base AS build

RUN npm run build



# Production

FROM node:24 AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 5001

CMD ["npm", "start"]



# Development

FROM base AS development

EXPOSE 5001

CMD ["npm", "run", "dev"]