# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0031-stage-11-bind-adapt-dsl/task.md`
- `memory/tasks/plan/TASK-07.01-0031-stage-11-bind-adapt-dsl/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.01-0030-stage-11-define-app-dsl/runs/RUN-001/result.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Bind/adapt DSL is a convenience layer for explicit composition adapters. It must preserve
the consumer-owned required port model.

## Relevant Technical Context

- Existing composer bindings support value, factory, class and async-factory forms.
- Stage 10 binding dependency edges represent required-port -> explicit binding edges.
- Validation/inspection must not execute user factories.
- `TASK-07.01-0030` should define app-level DSL conversion hooks available to this run.

## Files / Modules to Inspect

- `packages/ioc/src/dsl.ts`
- `packages/ioc/src/composer.ts`
- `packages/ioc/src/index.ts`
- DSL tests added by previous Stage 11 tasks
- `packages/ioc/test/composer.test.ts`
- `test/package-exports.test.ts`
- `docs/composer.md`
- `docs/modules.md`
- `packages/ioc/README.md`

## Known Risks

- Making `adapt()` too magical by hiding dependencies or token ownership.
- Creating graph edges by executing adapter factories.
- Type inference regressions around adapter output and context access.
- Duplicating composer binding validation in a divergent DSL-specific path.

## Assumptions

- Prefer a small explicit adapter API over broad magic shorthand.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
