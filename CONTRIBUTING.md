# Contributing

Thanks for helping improve `@sagifire/ioc`.

This repository is a TypeScript and pnpm workspace for three packages:

- `@sagifire/ioc`
- `@sagifire/ioc-testing`
- `@sagifire/ioc-next`

## Contact And Support

Use GitHub Issues for ordinary project questions, bug reports, feature requests and
documentation feedback.

Do not use public issues for secrets, credentials, private customer data, unreleased
vulnerability details or exploit instructions. Use the process in [SECURITY.md](SECURITY.md)
for security-sensitive reports.

## Contribution License

The repository and publishable packages use the Apache License, Version 2.0.

Unless you explicitly state otherwise, any contribution intentionally submitted for
inclusion in this project is submitted under the Apache License, Version 2.0. If a change is
not intended as a contribution, mark it clearly as `Not a Contribution`.

## Development Setup

Install dependencies with pnpm:

```sh
pnpm install
```

Useful workspace checks:

```sh
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm format
```

## Pull Request Expectations

- Keep changes scoped to the issue or task.
- Preserve package boundaries: core must stay runtime-agnostic and must not import
  Next.js, React, Node-only APIs, decorators or `reflect-metadata`.
- Do not add hidden service locator behavior, filesystem discovery, global mutable
  containers or runtime mutation after `freeze()` / `compose()`.
- Add or update tests for behavioral changes.
- Update documentation when public behavior, package usage or examples change.
- Do not commit secrets, tokens, credentials, generated local caches or machine-specific
  configuration.

## Coding Style

- TypeScript and ESM.
- 4 spaces indentation.
- Single quotes.
- No semicolons.
- No trailing commas.
- Prefer explicit `undefined` handling.
- Avoid `any`; if it is unavoidable, keep the reason local and obvious.
