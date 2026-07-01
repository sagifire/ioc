# TASK-07.01-0029: Stage 11 module DSL foundation

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати першу частину Stage 11: `module()` DSL foundation over existing
`defineModule()` object-configuration API.

## Product Context

Stage 11 starts the ergonomic DSL layer. The first implementation task must establish the
module-level DSL without changing composer/runtime semantics and without making DSL
required for object API users.

## Scope

- Implement `module()` or equivalent module DSL entrypoint in `packages/ioc/src/dsl.ts`.
- Keep `module()` output compatible with existing `ModuleDefinition` and `defineModule()`.
- Preserve explicit required port and capability declarations.
- Support module metadata, version, required ports, provided capabilities and setup
  function with the same runtime semantics as `defineModule()`.
- Reuse existing module validation and typed errors where possible instead of adding a
  parallel validation model.
- Export the initial DSL API from `@sagifire/ioc/dsl`; root export may be added if it
  remains tree-shaking friendly and consistent with existing root exports.
- Add runtime tests for DSL-to-module-definition conversion and validation behavior.
- Add type-level assertions for DSL inference of required port and capability token values.
- Add package export smoke tests for `@sagifire/ioc/dsl`.
- Update minimal docs/README only if public API text would otherwise be misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing `defineApp()`.
- Implementing `adapt()`.
- Implementing composition-level bind helper DSL beyond what is strictly needed by module
  setup parity.
- Changing composer/runtime graph semantics.
- Implementing testing helpers or Next.js adapters.
- Adding decorators, `reflect-metadata`, constructor metadata or filesystem discovery.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] `module()` DSL creates valid `ModuleDefinition` values compatible with
  `createComposer().use()`.
- [x] Required ports and capabilities remain explicit and inspectable.
- [x] Existing `defineModule()` object API remains fully usable without DSL.
- [x] Invalid DSL module declarations reuse typed module validation diagnostics where
  practical.
- [x] DSL does not add decorators, `reflect-metadata`, filesystem discovery or global
  registries.
- [x] Runtime tests cover module DSL conversion, validation and composer compatibility.
- [x] Type-level assertions cover module DSL token inference.
- [x] `@sagifire/ioc/dsl` export smoke test covers the new API.
- [x] Stage 11 task does not implement `defineApp()`, `adapt()`, testing helpers or
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
- `memory/tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для module DSL foundation.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval planning task
`TASK-07.01-0028-stage-11-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
