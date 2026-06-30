# TASK-06.30-0025: Stage 10 dependency edge model

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-30
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати першу частину Stage 10: explicit dependency edge model for module graph
inspection without module cycle validation yet.

## Product Context

Stage 9 inspection exposes modules, required ports, capabilities, bindings and validation
status, but intentionally does not expose dependency edges. Stage 10 starts by making those
edges first-class safe graph metadata before cycle detection starts using them.

## Scope

- Extend composer graph public types with dependency edge metadata.
- Add public edge types or equivalent stable shape:
  - capability dependency edge;
  - binding dependency edge;
  - shared base edge fields where useful.
- Extend `ModuleGraph`, `ComposerInspection` and graph-related inspection types with
  deterministic `edges` metadata.
- Infer capability dependency edges when a required port is satisfied by a provided
  capability from another module.
- Infer binding dependency edges when a required port is satisfied by explicit
  `composer.bind()` configuration.
- Preserve existing Stage 9 binding priority: if a required port is satisfied by a binding,
  record a binding edge and do not also create a capability edge for that required port.
- Keep optional required ports without satisfaction out of dependency edge collections or
  mark them explicitly only if the final shape remains simple and useful.
- Ensure edge metadata includes safe fields such as:
  - consumer module ID;
  - required token ID;
  - dependency kind;
  - provider module ID and capability token ID for capability edges;
  - binding token ID and binding kind for binding edges.
- Keep edge order deterministic and aligned with module/required port registration order.
- Do not execute module setup, provider factories, binding factories or async resources to
  infer hidden dependency edges.
- Keep module cycle validation and cycle diagnostics out of this task.
- Add runtime tests for edge metadata shape, determinism, binding priority and privacy.
- Add type-level assertions for public edge types.
- Update package export smoke tests for edge public types if exported at runtime/type
  boundary.
- Update minimal docs/README only if current public API text would otherwise become
  misleading.
- Update run result memory after implementation.

## Out of Scope

- Detecting module-level cycles.
- Adding cycle paths to diagnostics.
- Failing `composer.validate()`, `prepare()` or `compose()` because of cycles.
- Executing factories to discover hidden dependencies.
- Implementing DSL helpers.
- Implementing testing helpers or Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Module graph public types include dependency edge metadata.
- [x] `composer.getGraph()` includes deterministic dependency edges.
- [x] `composer.inspect()` includes deterministic dependency edges.
- [x] Capability dependency edges are inferred from required ports satisfied by provided
  capabilities.
- [x] Binding dependency edges are inferred from required ports satisfied by explicit
  composer bindings.
- [x] A binding-satisfied required port does not also create a capability edge.
- [x] Edge metadata does not expose provider values, resource instances, scope-local values
  or private runtime internals.
- [x] Factories are not executed to infer edges.
- [x] Runtime tests cover edge shape, ordering, binding priority and privacy.
- [x] Type-level assertions cover edge public API.
- [x] Stage 10 task does not implement cycle validation, DSL, adapters or testing helpers.
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
- `memory/tasks/plan/TASK-06.30-0024-stage-10-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для dependency edge model.
  - Result: completed; prepared for review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval planning task
`TASK-06.30-0024-stage-10-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
