# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-28

## Goal for This Run

Реалізувати Stage 3 tokens у core package `@sagifire/ioc`: typed token contract,
`token()`, `namespace()`, token ID validation, public exports і tests.

## Clarified Requirements

- Implement only core token API in `@sagifire/ioc`.
- Keep core package runtime-agnostic and free of Next.js, React, Node-only APIs,
  decorators and `reflect-metadata`.
- Use token ID as canonical runtime identity; do not introduce a global registry.
- Do not rely on token object identity for future matching semantics.
- Keep phantom `__type` type-only; do not use it at runtime.
- Use Vitest `expectTypeOf` for Stage 3 token inference assertions.
- Implement invalid ID rejection with a minimal token-specific typed error and readable
  message.
- Do not implement full diagnostics types, reports or formatting.

## Scope for This Run

- `packages/ioc/src/tokens.ts`.
- `packages/ioc/src/index.ts` if root re-export is needed.
- Token tests, preferably under `packages/ioc/test/` or another existing Vitest include.
- Existing package export smoke tests only if expectations need to account for new exports.
- Minimal docs or README adjustment only if public exports would otherwise be misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Container APIs and provider behavior.
- Context/scopes.
- Async providers/resources/disposal.
- Composer/modules/capabilities/required ports/bindings.
- DSL.
- Full diagnostics layer.
- Next.js adapter helpers.
- Testing package helpers.
- Release automation.
- Editing `memory/sources/SPEC.md`.

## Planned Token ID Validation Baseline

- ID must be a non-empty string.
- ID must not have leading/trailing whitespace.
- ID must not contain whitespace or control characters.
- ID may contain ASCII letters, ASCII digits, `.`, `-`, `_`, `:`, `/`.
- Namespace prefix and local token ID are validated separately before joining with `.`.

If implementation finds this baseline too restrictive for a documented canonical use case,
stop and update task memory or ask for clarification instead of silently widening the
public contract.

## Acceptance Criteria for This Run

- [ ] `Token<TValue>` public type is exported from `@sagifire/ioc/tokens`.
- [ ] Root `@sagifire/ioc` exports the token API or intentionally documents why only the
  subpath export is used.
- [ ] `token<TValue>(id, options?)` creates tokens with stable `id`.
- [ ] `description` is preserved when provided and handled explicitly when `undefined`.
- [ ] `Token<TValue>` preserves `TValue` inference in consumer code.
- [ ] `namespace(id).token(localId)` creates stable prefixed IDs.
- [ ] Invalid IDs throw/readably fail with token-specific error.
- [ ] Token implementation has no global mutable registry.
- [ ] Token implementation imports no container/composer/DSL/adapters.
- [ ] Runtime tests cover creation, namespaces and invalid IDs.
- [ ] Type-level assertions cover token inference.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
