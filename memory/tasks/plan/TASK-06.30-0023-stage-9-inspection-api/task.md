# TASK-06.30-0023: Stage 9 inspection API

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-30
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 9 inspection APIs for composer and composed runtime without implementing
Stage 10 module cycle detection.

## Product Context

Stage 9 acceptance requires useful module graph inspection. At this point module
definition, composer builder, setup/private providers and composed runtime should already
exist. This task exposes safe metadata useful for humans, tests and Codex.

## Scope

- Implement `composer.inspect()`.
- Implement `composer.getGraph()`.
- Implement `runtime.inspect()` for composed runtimes.
- Add public inspection types:
  - `ComposerInspection`;
  - `RuntimeInspection`;
  - `ModuleGraph`;
  - module node metadata;
  - required port metadata;
  - capability metadata;
  - binding metadata;
  - provider registration summary.
- Include safe metadata:
  - registered modules in deterministic order;
  - module IDs, versions and metadata only if safe;
  - declared required ports;
  - declared/provided capabilities;
  - composition bindings;
  - provider kinds and lifetimes where known;
  - validation status and diagnostics.
- Do not expose provider values, resource instances, scope-local values or private runtime
  internals.
- Include enough module graph shape for Stage 9 debugging without cycle detection.
- Ensure `runtime.inspect()` works after successful compose and reflects exported
  capability registry.
- Add runtime tests for inspection shape, determinism and privacy.
- Add type-level assertions for inspection public API.
- Update run result memory after implementation.

## Out of Scope

- Implementing module-level cycle detection.
- Implementing capability dependency edges.
- Implementing binding dependency edges.
- Adding cycle paths to diagnostics.
- Implementing graph assertion helpers in `@sagifire/ioc-testing`.
- Implementing DSL helpers or Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] `composer.inspect()` is implemented.
- [ ] `composer.getGraph()` is implemented.
- [ ] Composed `runtime.inspect()` is implemented.
- [ ] Inspection includes registered modules, required ports, capabilities, bindings and
  validation status.
- [ ] Inspection is deterministic.
- [ ] Inspection does not expose provider values or private runtime internals.
- [ ] Inspection shows enough graph shape to debug Stage 9 composition issues.
- [ ] Runtime tests cover inspection and privacy.
- [ ] Type-level assertions cover inspection public API.
- [ ] Stage 9 overall acceptance is still satisfied after this task.
- [ ] Stage 10 cycle detection behavior is not implemented.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Початковий autonomous implementation run для inspection API.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після завершення і approval
`TASK-06.30-0022-stage-9-composed-runtime-capabilities`.
