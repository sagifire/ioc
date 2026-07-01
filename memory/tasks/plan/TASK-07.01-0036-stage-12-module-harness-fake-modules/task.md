# TASK-07.01-0036: Stage 12 module harness and fake modules

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 12 fake module helpers and module harness for isolated module tests.

## Product Context

After package foundation, overrides and test composer exist, Stage 12 needs ergonomic but
explicit helpers for testing one module with fake required ports or support modules. These
helpers must preserve module isolation and graph visibility.

## Scope

- Implement `fakeModule()` or equivalent helper that creates explicit module definitions
  for tests.
- Support fake provided capabilities with value/factory/async factory setup where it maps
  to existing module setup APIs.
- Implement `createModuleHarness()` or equivalent helper for composing one module under
  test with fake ports/support modules.
- Allow harness configuration to provide fake required ports through explicit overrides or
  fake modules.
- Preserve private provider isolation: harness must not expose module internals through
  public runtime access.
- Preserve graph visibility through existing composer/runtime inspection APIs.
- Add runtime tests for single module harness, fake required ports, support modules,
  private provider isolation and async/scoped behavior where relevant.
- Add type-level assertions for fake module and harness token inference.
- Update run result memory after implementation.

## Out of Scope

- Implementing graph assertion helpers.
- Implementing diagnostic assertion helpers.
- Adding hidden fixture auto-discovery or filesystem discovery.
- Mutating composed runtimes.
- Changing core module/private provider semantics.
- Implementing Next.js adapters.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] Fake module helper creates explicit `ModuleDefinition` values.
- [x] Module harness composes a single module with fake required ports.
- [x] Harness works with support modules when needed.
- [x] Harness preserves module-private provider isolation.
- [x] Harness exposes public capabilities through normal composed runtime APIs.
- [x] Harness graph remains inspectable through existing APIs.
- [x] Runtime tests cover fake modules, fake ports and private provider isolation.
- [x] Type-level assertions cover fake module and harness inference.
- [x] Stage 12 task does not implement graph assertions, diagnostic assertions or
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
  - Purpose: Початковий autonomous implementation run для module harness and fake modules.
  - Result: completed, approved after task-level human review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після approval `TASK-07.01-0035-stage-12-overrides-test-composer`,
якщо користувач явно не змінить порядок.
