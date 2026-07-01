# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.01-0037-stage-12-graph-diagnostic-assertions/task.md`
- `memory/tasks/plan/TASK-07.01-0037-stage-12-graph-diagnostic-assertions/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.01-0033-stage-12-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Assertions should make module graph and diagnostics checks readable in tests. They should
not create a second graph model or read private internals.

## Relevant Technical Context

- `ModuleGraph`, `ComposerInspection` and `RuntimeInspection` are public graph shapes.
- `DiagnosticReport` is the public diagnostics shape.
- Formatting must be deterministic and safe; provider values and private internals should
  not be exposed.

## Files / Modules to Inspect

- `packages/ioc-testing/src/index.ts`
- `packages/ioc/src/composer.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/test/composer.test.ts`
- `packages/ioc/test/dsl.test.ts`
- `docs/testing.md`
- `docs/diagnostics.md`

## Known Risks

- Building assertions against internal private runtime structures.
- Making assertion failures depend on object key order or nondeterministic formatting.
- Pulling Vitest internals into the runtime dependency surface unnecessarily.

## Assumptions

- Plain thrown errors are acceptable for Vitest usability unless implementation finds a
  stronger reason for a peer dependency or optional matcher integration.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
