# Agent instructions

Before making changes, inspect the relevant project documentation and any nested `AGENTS.md` files for the area being changed.

## Repository rules

- Use pnpm for JavaScript dependencies and workspace commands.
- Use Moon task targets for application development, builds, and tests where a target exists.
- Keep changes scoped to the requested behavior; avoid unrelated refactors.
- Do not commit secrets, generated `dist/` output, coverage artifacts, or IDE metadata.

## Validation

Before considering a change complete:

1. Run the most relevant tests for each affected application.
2. Run the build for each affected application when source or module configuration changes.
3. Run end-to-end tests when an application boundary or infrastructure integration changes.
4. Run formatting and linting checks for modified source files.

## Aspire and local services

- `apphost.cs` is the source of truth for the local distributed resource graph.
- Treat changes to ports, endpoints, environment variables, data volumes, and external exposure as deliberate configuration changes.
- Do not add credentials or machine-specific values to tracked configuration files.

## Git and handoff

- Follow the Conventional Commits rules configured in `commitlint.config.ts`.
- Review the final diff for accidental files and unrelated changes.
- Report the checks that were run and any checks that could not run, including the reason.
