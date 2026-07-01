# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0038-stage-12-testing-hardening-docs/task.md`
- `memory/tasks/plan/TASK-07.01-0038-stage-12-testing-hardening-docs/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0033-stage-12-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

This is the final Stage 12 hardening task. Its purpose is to stabilize and document the
testing package, not to begin framework adapter work.

## Relevant Technical Context

- Testing helpers live in `@sagifire/ioc-testing`.
- Core must not import testing package.
- Next.js adapters begin only in Stage 13.
- Docs should explain implemented helpers without implying unimplemented adapter examples.

## Files / Modules to Inspect

- `packages/ioc-testing/src/*`
- `packages/ioc-testing/package.json`
- `packages/ioc-testing/README.md`
- `packages/ioc/src/*`
- `packages/ioc-next/src/index.ts`
- `test/package-exports.test.ts`
- `docs/testing.md`
- `README.md`

## Known Risks

- Letting docs imply Stage 13 Next.js adapter behavior is already implemented.
- Missing export/type regression coverage for some helper.
- Accidentally adding a dependency from core to testing package.

## Assumptions

- Minimal docs sync is enough for Stage 12; full examples belong to Stage 14 unless
  needed to explain a public testing helper safely.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
