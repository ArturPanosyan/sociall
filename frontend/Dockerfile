# ─── STAGE 1: Build Angular ───────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
# ВАЖНО: --configuration=production → использует environment.prod.ts с /api (без localhost:8080)
RUN npm run build -- --configuration=production

# ─── STAGE 2: Serve with Nginx ────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist/socialnet-frontend/browser /usr/share/nginx/html

# Angular routing support (SPA fallback)
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
    location ~* \.(js|css|png|jpg|gif|ico|svg|woff2)$ { expires 1y; add_header Cache-Control "public, immutable"; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
