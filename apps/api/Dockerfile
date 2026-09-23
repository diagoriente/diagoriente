# syntax=docker/dockerfile:1.27.0@sha256:bde3983e9c939224420ddaf6b784cc30e09b035a4dea01f581230c50809f372e

# -----------------------------------------------------------------------------
# Base
# -----------------------------------------------------------------------------

FROM node:26.10.0-trixie-slim@sha256:ec7758ee051e457b468b32bde57b0879010b325bb9862718e9615225ce4aaae1 AS base
WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends --yes ca-certificates curl xz-utils \
    && rm -rf /var/lib/apt/lists/*

ADD --checksum=sha256:4dee48598dc3acafbe10b068da63e237f4b3d045792773c2cdb2e81994d9a43d https://moonrepo.dev/install/moon.sh /tmp
RUN bash /tmp/moon.sh
ENV PATH="/root/.moon/bin:/root/.proto/bin:$PATH"

# -----------------------------------------------------------------------------
# Skeleton
# -----------------------------------------------------------------------------

FROM base AS skeleton

COPY --link . .
RUN moon docker scaffold api

# -----------------------------------------------------------------------------
# Build
# -----------------------------------------------------------------------------

FROM base AS build

COPY --link --from=skeleton /app/.moon/docker/configs .

RUN --mount=type=secret,id=BUILDFETCH_TOKEN,env=BUILDFETCH_TOKEN \
    --mount=type=cache,id=moon-proto,target=/root/.proto,sharing=locked \
    --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store,sharing=locked \
    moon docker setup

COPY --link --from=skeleton /app/.moon/docker/sources .

RUN --mount=type=secret,id=BUILDFETCH_TOKEN,env=BUILDFETCH_TOKEN \
    --mount=type=cache,id=moon-proto,target=/root/.proto,sharing=locked \
    --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store,sharing=locked \
    moon run api:build \
    && moon docker prune \
    && pnpm --filter @diagoriente/api deploy --prod /tmp/deploy

# -----------------------------------------------------------------------------
# Runtime
# -----------------------------------------------------------------------------

FROM gcr.io/distroless/nodejs26-debian13:nonroot@sha256:afc6657a4b662f9cb69ca892b0596e55d6ef81a10e83ee8887b13f602877df89 AS start
WORKDIR /app

ENV NODE_ENV=production

COPY --link --from=build /tmp/deploy /app

CMD ["dist/main.js"]
