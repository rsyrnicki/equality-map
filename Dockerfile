# --- Build stage: compile the Angular app ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Refresh the indicator snapshot (public/data/indicators.json) from the public
# APIs. If they can't be reached, keep the snapshot committed to git, so a
# World Bank outage never breaks a deploy.
RUN npm run fetch-data || echo "fetch-data failed; building with the committed snapshot"
RUN npm run build

# --- Serve stage: static files behind nginx ---
FROM nginx:alpine

COPY --from=build /app/dist/equality-map/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
