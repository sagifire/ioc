# TASK-06.30-0026: Stage 10 module cycle diagnostics

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-30
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати module-level cycle detection and typed diagnostics over Stage 10 dependency
edges.

## Product Context

Після `TASK-06.30-0025` module graph має explicit dependency edges. This task turns those
edges into validation behavior: cyclic module graphs must be rejected with readable
diagnostics, while valid acyclic graphs must continue to compose successfully.

## Scope

- Detect module-level cycles over module-to-module capability dependency edges.
- Add typed cycle diagnostic error, for example `ModuleCycleError` or equivalent.
- Add safe structured details for cycle diagnostics:
  - module ID path;
  - token/capability path;
  - edge kinds involved in the cycle.
- Include the repeated first module at the end of the cycle path where useful for
  readability.
- Integrate cycle diagnostics into:
  - `composer.validate()`;
  - `composer.inspect().validation`;
  - `composer.prepare()`;
  - `composer.compose()`;
  - composed runtime validation metadata where applicable.
- Ensure `ComposerValidationError.report` includes module cycle diagnostics when compose
  or prepare fails.
- Keep binding edges from creating module-to-module cycles by themselves.
- Ensure explicit bindings can satisfy required ports without producing false module cycle
  diagnostics.
- Keep provider-level cycles inside factories delegated to existing container diagnostics.
- Add runtime tests for simple cycles, longer cycles, acyclic graphs and binding-broken
  would-be cycles.
- Add type-level assertions for new diagnostic details/public error types if exported.
- Update package export smoke tests for cycle public types if exported.
- Update run result memory after implementation.

## Out of Scope

- Changing dependency edge public shape beyond what cycle diagnostics require.
- Executing factories to infer hidden dependencies.
- Implementing graph assertion helpers in `@sagifire/ioc-testing`.
- Implementing DSL helpers or Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Module-level cycles are detected by `composer.validate()`.
- [ ] Cycle diagnostics include module ID path.
- [ ] Cycle diagnostics include token/capability path or equivalent edge path.
- [ ] `composer.prepare()` and `composer.compose()` fail with typed validation error for
  cyclic module graphs.
- [ ] `ComposerValidationError.report` includes cycle diagnostics.
- [ ] Valid acyclic graphs compose successfully.
- [ ] Binding-satisfied required ports do not create false module cycles.
- [ ] Runtime tests cover simple, long and binding-broken cycle cases.
- [ ] Type-level assertions cover new cycle public API where applicable.
- [ ] Stage 10 task does not implement DSL, adapters or testing helpers.
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
- `memory/tasks/plan/TASK-06.30-0024-stage-10-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-06.30-0025-stage-10-dependency-edge-model/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Початковий autonomous implementation run для module cycle diagnostics.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після завершення і approval
`TASK-06.30-0025-stage-10-dependency-edge-model`.
