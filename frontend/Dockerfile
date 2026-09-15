# Build context is the repo root (see docker-compose.yml) so this stage can
# see /shared — npm workspaces need the whole workspace tree to link packages.
FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json ./
COPY shared/package.json shared/
COPY frontend/package.json frontend/
RUN npm install
COPY shared shared
COPY frontend frontend
RUN npm run build --workspace=shared
WORKDIR /repo/frontend
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, not read at
# container runtime, so this has to be a build arg rather than a compose `environment:`.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /repo/frontend
COPY --from=build /repo/frontend/.next/standalone ./
COPY --from=build /repo/frontend/.next/static ./frontend/.next/static
COPY --from=build /repo/frontend/public ./frontend/public
EXPOSE 3000
CMD ["node", "frontend/server.js"]
