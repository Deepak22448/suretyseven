# Build context is the repo root (see docker-compose.yml) so this stage can
# see /shared — npm workspaces need the whole workspace tree to link packages.
FROM node:20-alpine AS build
# Prisma's query/schema engines need OpenSSL — Alpine doesn't ship it by default.
RUN apk add --no-cache openssl
WORKDIR /repo
COPY package.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
RUN npm install
COPY shared shared
COPY backend backend
RUN npm run build --workspace=shared
WORKDIR /repo/backend
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /repo
# npm workspaces hoists deps to root node_modules — no separate backend/node_modules to copy.
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/shared ./shared
COPY --from=build /repo/backend/dist ./backend/dist
COPY --from=build /repo/backend/prisma ./backend/prisma
COPY --from=build /repo/backend/package.json ./backend/package.json
WORKDIR /repo/backend
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
