# syntax=docker/dockerfile:1.7
# --- Baza wspólna ---
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# --- Zależności do builda (dev) ---
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY apps/api/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# --- Build (prod) ---
FROM deps AS build
ENV NODE_ENV=development
COPY apps/api ./
RUN npm run build

# --- Produkcyjne node_modules (prune dev) ---
FROM build AS prod-deps
RUN npm prune --omit=dev

# --- Finalny obraz prod ---
FROM base AS runner
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY apps/api/package*.json ./
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/main.js"]

# --- Cel dev (hot reload, ts-node + nodemon) ---
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
ENV TS_NODE_TRANSPILE_ONLY=1
# polling dla Docker na niektórych OS
ENV CHOKIDAR_USEPOLLING=1
RUN apk add --no-cache python3 make g++
# w dev polegamy na mountach (kod z hosta) + named volume na node_modules
# instalacja zależności odbędzie się w poleceniu startowym compose
CMD ["npm", "run", "start:dev"]
