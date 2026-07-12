# Documentation

This directory is the repository documentation map for the implemented workspace API.
Package README files and this map are the current entry points.

## Start Here

- [Root README](../README.md) - product overview, package roles and quickstart.
- [Core package README](../packages/ioc/README.md) - core imports, APIs and boundaries.
- [Testing package README](../packages/ioc-testing/README.md) - test helpers and
  assertions.
- [Next package README](../packages/ioc-next/README.md) - App Router boundary helpers.

## Guides

- [Architecture](architecture.md) - package boundaries, explicit composition model and
  object API / DSL relationship.
- [Container](container.md) - tokens, providers, lifetimes, scopes and sync resolution.
- [Async model](async-model.md) - async providers, async resources, `getAsync()` and
  disposal.
- [Composer](composer.md) - composer builder, validation, inspection and dependency edges.
- [Graph export](graph-export.md) - v1 schema, JSON/DOT/Mermaid, privacy and snapshot/diff workflow.
- [Modules](modules.md) - module definitions, capabilities, required ports and isolation.
- [Diagnostics](diagnostics.md) - typed errors, diagnostic reports, formatting and
  diagnostic assertions.
- [Testing](testing.md) - isolated test runtimes, overrides, test composers, fake modules,
  module harnesses and assertions.
- [Next.js integration](next-integration.md) - cached runtimes, explicit request context,
  route scopes and server action scopes.
- [Migration from DI containers](migration-from-di-container.md) - migration notes from
  common DI container patterns.
- [Release workflow](release.md) - Changesets release PRs, manual npm publish workflow,
  required external settings and provenance assumptions.

## Governance

- [License](../LICENSE) - Apache License, Version 2.0.
- [Notices](../NOTICE) - project notices and attribution.
- [Contributing](../CONTRIBUTING.md) - contribution flow and GitHub Issues support channel.
- [Security](../SECURITY.md) - security-sensitive reporting policy.
- [Trademarks](../TRADEMARKS.md) - `@sagifire/ioc` product mark usage guidance.

## Examples

- [Basic Node](../examples/basic-node/README.md) - tokens, container providers,
  multi-providers, scope-local values, child scope overlays and runtime disposal.
- [Module composition](../examples/module-composition/README.md) - modules, capabilities,
  required ports, graph-aware adapters, multi contribution catalogs, validation,
  inspection and composed runtime resolution.
- [Async DB resource](../examples/async-db-resource/README.md) - lazy async database
  resource, retry after failed initialization, scoped unit-of-work and disposal.
- [Testing overrides](../examples/testing-overrides/README.md) - isolated test runtimes,
  composer overrides, fake modules, module harnesses and graph/diagnostic assertions.
- [Next App Router](../examples/next-app-router/README.md) - cached runtime, explicit
  request/action context, route scopes and server action scopes for `@sagifire/ioc-next`.
