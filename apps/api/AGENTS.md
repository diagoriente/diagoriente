# API agent instructions

This directory contains the NestJS API application. Preserve its existing TypeScript, NestJS, and module-boundary conventions.

## Development

Run the API directly with Moon:

```sh
moonx api:dev
```

## Validation

```sh
moonx api:build
moonx api:test
moonx api:test-e2e
moonx api:test-cov
```

Run the relevant checks for every change. Add or update tests when changing validation, configuration, controllers, services, or resource integration.

## Structure and conventions

- Put unit tests beside source files under `src/` using the existing Vitest conventions.
- Put end-to-end tests under `test/` and use `vitest.config.e2e.ts`.
- Keep configuration and infrastructure concerns under `src/platform/`.
- Prefer testing observable behavior over implementation details.
- Configuration is validated with Zod and logging is provided through Pino.
