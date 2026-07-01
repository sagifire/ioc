# TASK-07.02-0051: Stage 14 async-db-resource and testing-overrides examples

Status: backlog
Type: docs
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Create Stage 14 examples for async resource lifecycle and testing override workflows.

## Product Context

Roadmap Stage 14 requires examples for `async-db-resource` and `testing-overrides`.
These examples should demonstrate lifecycle safety and testing package usage without
mutating frozen runtime.

## Scope

- Add `examples/async-db-resource` demonstrating async resource initialization,
  `runtime.getAsync()` or `scope.getAsync()`, failure/retry assumptions where useful and
  disposal.
- Use an in-memory fake database/resource unless a real dependency is explicitly justified.
- Add `examples/testing-overrides` demonstrating `createTestRuntime()`,
  `createTestComposer()`, `override()`, `fakeModule()`, `createModuleHarness()` and
  graph/diagnostic assertions where practical.
- Include concise READMEs and verification commands.
- Verify examples by running tests/typecheck where practical.
- Update docs navigation and root README links if needed.
- Update task run result memory after implementation.

## Out of Scope

- Basic Node or module-composition examples already covered by previous task.
- Next App Router example hardening.
- Installing database servers or external services.
- Mutating frozen runtimes or adding runtime monkey-patching.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] `examples/async-db-resource` exists and demonstrates async resource lifecycle.
- [ ] `examples/testing-overrides` exists and demonstrates testing helpers.
- [ ] Examples avoid external service requirements by default.
- [ ] Examples do not mutate frozen `ContainerRuntime` or `ComposedRuntime`.
- [ ] Example READMEs explain commands and expected behavior.
- [ ] Examples are runnable or typechecked through documented commands where practical.
- [ ] Verification is recorded in run result.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: pending
  - Purpose: Autonomous implementation run for async-db-resource and testing-overrides
    examples.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
