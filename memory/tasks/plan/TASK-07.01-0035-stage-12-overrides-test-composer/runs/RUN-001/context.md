# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0035-stage-12-overrides-test-composer/task.md`
- `memory/tasks/plan/TASK-07.01-0035-stage-12-overrides-test-composer/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0033-stage-12-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Stage 12 overrides are for test configuration, not runtime mutation. Composer overrides
should satisfy required ports or explicit test wiring before composition.

## Relevant Technical Context

- `createComposer()` and `composer.bind()` already perform validation and graph inspection.
- `composer.bind()` is valid for required ports, not arbitrary public capability
  replacement.
- Replacing public capabilities should be modeled by fake modules or test modules in the
  next task, not by runtime patching.

## Files / Modules to Inspect

- `packages/ioc-testing/src/index.ts`
- `packages/ioc-testing/package.json`
- `packages/ioc/src/composer.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/dsl.ts`
- `packages/ioc/test/composer.test.ts`
- `packages/ioc/test/dsl.test.ts`
- `test/package-exports.test.ts`
- `docs/testing.md`

## Known Risks

- Treating overrides as a way to mutate already composed runtimes.
- Silently last-writing duplicate overrides and hiding test mistakes.
- Bypassing composer validation to make tests pass.

## Assumptions

- Prefer explicit failure for duplicate overrides unless implementation discovers a
  stronger reason for documented last-write semantics.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
