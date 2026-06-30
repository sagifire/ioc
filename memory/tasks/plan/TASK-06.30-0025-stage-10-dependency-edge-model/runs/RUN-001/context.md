# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.30-0025-stage-10-dependency-edge-model/task.md`
- `memory/tasks/plan/TASK-06.30-0025-stage-10-dependency-edge-model/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-06.30-0024-stage-10-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Stage 10 starts by making module dependency edges visible in inspection. This preserves the
project principle that DSL and ergonomics must not hide the dependency graph.

## Relevant Technical Context

- Stage 9 already implements `defineModule()`, `createComposer()`, `composer.validate()`,
  `composer.prepare()`, `composer.compose()`, `composer.inspect()`, `composer.getGraph()`
  and composed `runtime.inspect()`.
- Stage 9 `RequiredPortSatisfaction` already distinguishes `binding`, `capability`,
  `optional` and `missing`.
- Binding dependency edges in this run are static required-port -> composition-binding
  edges. Do not execute binding factories to infer internal dependencies.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/test/composer.test.ts`
- `test/package-exports.test.ts`
- `docs/composer.md`
- `docs/modules.md`

## Known Risks

- Accidentally adding cycle validation before edge metadata is stable.
- Exposing provider values or private runtime internals in graph metadata.
- Creating non-deterministic edge order through map/set iteration not tied to module order.
- Inferring binding factory dependencies by executing user code during validation.

## Assumptions

- If the exact public type names are awkward during implementation, prefer a small stable
  shape that keeps capability and binding edges discriminated.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
