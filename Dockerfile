# --- Build stage: compile the Angular app ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Serve stage: static files behind nginx ---
FROM nginx:alpine

COPY --from=build /app/dist/equality-map/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
