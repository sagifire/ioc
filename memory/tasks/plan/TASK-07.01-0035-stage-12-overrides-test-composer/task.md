# TASK-07.01-0035: Stage 12 overrides and test composer

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 12 override declarations and test composer helper in
`@sagifire/ioc-testing`.

## Product Context

Testing package foundation має існувати перед цією задачею. This task adds the controlled
configuration layer that lets tests satisfy required ports or container tokens before
runtime creation without mutating frozen production runtime.

## Scope

- Implement explicit override declarations, preferably `override(token)` or equivalent.
- Support value, factory, class and async factory override forms where they map cleanly to
  existing core APIs.
- Apply overrides to fresh test runtime configuration before `freeze()`.
- Implement `createTestComposer()` or equivalent helper over existing `createComposer()`.
- Support modules, existing composer bindings and test overrides applied before
  `compose()`.
- Preserve existing composer validation, diagnostics and graph inspection behavior.
- Fail duplicate override declarations deterministically instead of silently last-writing.
- Add runtime tests for override ordering, duplicate override rejection, test composer
  validation and pre-compose application.
- Add type-level assertions for override token inference and test composer helper types.
- Update run result memory after implementation.

## Out of Scope

- Mutating an existing frozen runtime or composed runtime.
- Replacing exported public capabilities by patching runtime internals.
- Implementing fake module helpers or module harnesses.
- Implementing graph/diagnostic assertion helpers.
- Changing core composer/runtime binding semantics.
- Implementing Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Override declarations are explicit and token-typed.
- [x] Overrides apply before `freeze()` / `compose()`.
- [x] Duplicate overrides fail with readable diagnostics or testing-package error.
- [x] `createTestComposer()` creates fresh composer configuration per call.
- [x] Test composer reuses existing `createComposer()` semantics.
- [x] Composer validation and graph inspection remain visible after overrides.
- [x] Frozen runtime is never mutated by overrides.
- [x] Runtime tests cover container-level and composer-level override behavior.
- [x] Type-level assertions cover override and test composer inference.
- [x] Stage 12 task does not implement fake modules, harnesses, graph assertions or
  Next.js adapters.
- [x] `pnpm build` works.
- [x] `pnpm test` works.
- [x] `pnpm typecheck` works.
- [x] `pnpm lint` works.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/tasks/plan/TASK-07.01-0033-stage-12-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для overrides and test composer.
  - Result: completed, approved after task-level human review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після approval `TASK-07.01-0034-stage-12-testing-package-foundation`,
якщо користувач явно не змінить порядок.
