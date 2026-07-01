# TASK-07.01-0030: Stage 11 defineApp DSL

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати app-level Stage 11 DSL: `defineApp()` and deterministic conversion to existing
composer configuration.

## Product Context

After module DSL foundation, Stage 11 needs an application composition DSL that wires
modules and bindings through the existing composer rather than a new runtime or global app
registry.

## Scope

- Implement `defineApp()` or equivalent app-level DSL entrypoint.
- Allow app DSL to collect module definitions created by object API or module DSL.
- Convert app DSL declarations deterministically to existing `createComposer()`,
  `composer.use()` and `composer.bind()` configuration.
- Expose or provide access to validation, graph inspection and compose behavior through
  existing composer semantics.
- Support composition-level bindings in the minimal existing provider forms needed for app
  conversion; keep richer bind helper ergonomics for `TASK-07.01-0031`.
- Preserve composer diagnostics, module cycle detection and dependency edge semantics.
- Avoid global app registry, service locator behavior, filesystem discovery or framework
  assumptions.
- Add runtime tests for app DSL conversion, validation and inspection parity with
  equivalent object API configuration.
- Add type-level assertions for module/app DSL composition inference.
- Update package export smoke tests for new app DSL API.
- Update run result memory after implementation.

## Out of Scope

- Implementing `adapt()` helper.
- Implementing final ergonomic bind helper DSL beyond minimal app conversion support.
- Implementing testing helpers or Next.js adapters.
- Changing container/composer runtime semantics.
- Adding decorators, `reflect-metadata`, constructor metadata or filesystem discovery.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] `defineApp()` creates deterministic composer configuration from explicit DSL input.
- [x] App DSL accepts module definitions from both object API and module DSL.
- [x] App DSL exposes validation/inspection/compose behavior through existing composer
  semantics.
- [x] Equivalent DSL and object API configurations produce equivalent graph metadata.
- [x] Object API remains fully usable without DSL.
- [x] No global app registry or hidden framework dependency is introduced.
- [x] Runtime tests cover conversion, validation, inspection parity and graph visibility.
- [x] Type-level assertions cover app DSL inference.
- [x] Stage 11 task does not implement `adapt()`, testing helpers or Next.js adapters.
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
- `memory/tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для `defineApp()` DSL.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval and completion of
`TASK-07.01-0029-stage-11-module-dsl-foundation`, якщо користувач явно не змінить
операційний порядок.
