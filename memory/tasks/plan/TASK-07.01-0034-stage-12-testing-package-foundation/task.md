# TASK-07.01-0034: Stage 12 testing package foundation

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати першу частину Stage 12: foundation public API для `@sagifire/ioc-testing`
and isolated test runtime helper.

## Product Context

Stage 12 starts testing helpers in a separate package. The first implementation task must
replace the Stage 2 placeholder with a small useful public surface while preserving package
boundaries and runtime immutability.

## Scope

- Implement initial public exports in `packages/ioc-testing/src/index.ts`.
- Implement `createTestRuntime()` or an equivalent isolated test runtime factory over
  existing `createContainer()` / `freeze()` semantics.
- Ensure every helper call creates fresh configuration and a fresh runtime.
- Support explicit test container configuration through a callback or options object.
- Preserve token value inference for test runtime resolution APIs.
- Add package-local runtime tests for isolated runtime creation and disposal.
- Add Vitest `expectTypeOf` assertions for public helper inference.
- Add package export smoke coverage for `@sagifire/ioc-testing`.
- Update minimal package README/docs only if public API text would otherwise be misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing override declarations.
- Implementing `createTestComposer()`.
- Implementing fake modules or module harnesses.
- Implementing graph or diagnostic assertion helpers.
- Mutating an existing frozen `ContainerRuntime` or `ComposedRuntime`.
- Changing `@sagifire/ioc` core runtime semantics.
- Implementing Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] `@sagifire/ioc-testing` exports a non-placeholder testing package foundation.
- [ ] Isolated test runtime helper creates fresh configuration/runtime per call.
- [ ] Helper does not mutate existing frozen runtimes.
- [ ] Helper reuses existing core container APIs instead of duplicating resolution logic.
- [ ] Token value inference is preserved through the public testing helper surface.
- [ ] Runtime tests cover isolated runtime creation, provider registration and disposal.
- [ ] Type-level assertions cover testing helper inference.
- [ ] Package export smoke tests cover `@sagifire/ioc-testing`.
- [ ] Stage 12 task does not implement overrides, test composer, harnesses, graph
  assertions or Next.js adapters.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

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
  - Status: planned
  - Purpose: Початковий autonomous implementation run для testing package foundation.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval planning task
`TASK-07.01-0033-stage-12-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
