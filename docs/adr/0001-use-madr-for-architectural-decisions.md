# Use MADR for Architectural Decisions

- **Status:** Accepted
- **Date:** 2026-06-16
- **Deciders:** Mérill Téterel (@id6tm-mteterel)

## Context and Problem Statement

The project needs a durable way to record architectural decisions, including the
context, alternatives, trade-offs, and consequences behind them. These records
should live close to the source code, be easy to review in pull requests, and
remain readable without requiring a dedicated documentation system.

## Options Considered

- **Markdown ADRs in the repository** - Store ADRs as Markdown files under
  `docs/adr` and manage numbering/indexing with `@id6tm/madr-tools`.
  - **Pros:** Easy to write, review, diff, search, and link from code or issues.
  - **Cons:** Requires maintainers to keep ADRs current and concise.
- **External documentation system** - Store decisions in a wiki or hosted
  documentation tool.
  - **Pros:** Can provide richer navigation and publishing features.
  - **Cons:** Separates decisions from the code review workflow and adds another
    system to maintain.
- **No formal ADR process** - Rely on commit messages, pull requests, and issue
  discussions to preserve decision history.
  - **Pros:** No extra process or files.
  - **Cons:** Decision context becomes fragmented and harder to recover later.

## Decision Outcome

**Use Markdown ADRs in the repository**, because they keep architectural decision
history close to the code while staying simple enough for regular use.

### Consequences

- Good, because decisions are versioned with the codebase and can be reviewed
  alongside implementation changes.
- Good, because new contributors can understand why important technical
  choices were made without reconstructing history from scattered discussions.
- Bad, because the team must remember to add or update ADRs when decisions
  materially change the architecture.
- Bad, because Markdown ADRs do not enforce completeness beyond the review
  process and the shared template.

## Links

- [About MADR](https://adr.github.io/madr/)
- [GitHub repository of @id6tm/madr-tools CLI](https://github.com/id6tm/madr-tools)
