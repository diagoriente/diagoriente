# syntax=docker/dockerfile:1.24.0@sha256:87999aa3d42bdc6bea60565083ee17e86d1f3339802f543c0d03998580f9cb89

# -----------------------------------------------------------------------------
# Base
# -----------------------------------------------------------------------------

FROM node:26.8.1-trixie-slim@sha256:c0753125a3789977aefe869cbebccf70e3cfd7ea84ca48547458f02e4f1d7146 AS base
WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends --yes ca-certificates curl xz-utils \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://moonrepo.dev/install/moon.sh | bash
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

RUN --mount=type=cache,id=moon-proto,target=/root/.proto,sharing=locked \
    --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store,sharing=locked \
    moon docker setup

COPY --link --from=skeleton /app/.moon/docker/sources .

RUN --mount=type=cache,id=moon-proto,target=/root/.proto,sharing=locked \
    --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store,sharing=locked \
    moon run api:build \
    && moon docker prune \
    && pnpm --filter @diagoriente/api deploy --prod /tmp/deploy

# -----------------------------------------------------------------------------
# Runtime
# -----------------------------------------------------------------------------

FROM gcr.io/distroless/nodejs26-debian13:nonroot@sha256:10ec8cb93ef461563da50d4eb8dfac7d048783826825bf5b07510c2f34c14315 AS start
WORKDIR /app

ENV NODE_ENV=production

COPY --link --from=build /tmp/deploy /app

CMD ["dist/main.js"]
