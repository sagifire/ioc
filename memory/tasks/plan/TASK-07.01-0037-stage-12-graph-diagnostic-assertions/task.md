# TASK-07.01-0037: Stage 12 graph and diagnostic assertions

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 12 graph assertion helpers and diagnostic assertion helpers in
`@sagifire/ioc-testing`.

## Product Context

After test runtime, test composer and module harness helpers exist, Stage 12 needs readable
assertions for module graph and diagnostics. Assertions must use public inspection and
diagnostic data only.

## Scope

- Implement graph assertion helpers over `ModuleGraph`, `ComposerInspection` and
  `RuntimeInspection`.
- Cover common assertions for modules, capabilities, required ports, bindings and
  dependency edges.
- Implement diagnostic assertion helpers over `DiagnosticReport` and typed error-derived
  diagnostics.
- Produce deterministic readable assertion messages usable from Vitest.
- Avoid depending on private provider values or internal runtime storage.
- Avoid requiring Vitest internals as a runtime dependency unless explicitly justified in
  `result.md`.
- Add runtime tests for passing and failing assertion messages.
- Add type-level assertions for graph/diagnostic assertion helper inputs.
- Update run result memory after implementation.

## Out of Scope

- Implementing Next.js adapter assertions.
- Reading private runtime internals.
- Adding hidden dependency inference.
- Mutating graph/inspection inputs.
- Changing core graph or diagnostics semantics.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Graph assertion helpers operate on public inspection graph data.
- [ ] Diagnostic assertion helpers operate on public diagnostics data.
- [ ] Assertion failures produce deterministic readable messages.
- [ ] Helpers are usable from Vitest tests.
- [ ] Helpers do not mutate graph, inspection, runtime or diagnostic inputs.
- [ ] Runtime tests cover passing and failing assertion paths.
- [ ] Type-level assertions cover assertion helper input inference.
- [ ] Stage 12 task does not implement Next.js adapter assertions or core graph changes.
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
  - Purpose: Початковий autonomous implementation run для graph and diagnostic assertions.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після approval
`TASK-07.01-0036-stage-12-module-harness-fake-modules`, якщо користувач явно не змінить
порядок.
