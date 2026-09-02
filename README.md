# Diagoriente

> **Status:** This repository is currently under construction. The structure, APIs, and tooling may change as development progresses.

## Setup

Install [proto](https://moonrepo.dev/docs/proto/install) first. Proto provides the repository's required toolchain, including Node.js, pnpm, Moon, APM, Aspire, and .NET.

```sh
proto install
```

## Development

Start the distributed application through Aspire:

```sh
aspire run
```

This starts the application resources defined by `apphost.cs` and exposes them through the Aspire dashboard.

## Contributing

Keep changes focused, add or update tests for behavior changes, and follow the Conventional Commits configuration in `commitlint.config.ts`. Do not commit secrets, generated build output, coverage reports, or local IDE files.

See [`AGENTS.md`](AGENTS.md) and the application-specific instructions in each project directory for coding-agent guidance.
