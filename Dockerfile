# syntax=docker/dockerfile:1
# ADN Tire Shop — SFP standard: node build stage → nginx serve stage.

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .
# Client env vars (VITE_*) are baked at build time. In Coolify, pass them as
# build args / build-time env so they are present during `npm run build`.
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
