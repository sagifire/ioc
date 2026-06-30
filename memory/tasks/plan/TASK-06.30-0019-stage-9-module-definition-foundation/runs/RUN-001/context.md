# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.30-0019-stage-9-module-definition-foundation/task.md`
- `memory/tasks/plan/TASK-06.30-0019-stage-9-module-definition-foundation/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-06.30-0018-stage-9-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

Stage 9 composer/modules starts with explicit object configuration. DSL ergonomics arrive
later and must not be required for module definitions.

## Relevant Technical Context

- `packages/ioc/src/composer.ts` is currently a placeholder.
- `Token<TValue>` from `tokens.ts` is the identity mechanism for capabilities and required
  ports.
- Stage 8 diagnostics foundation is available for typed errors.
- Composer must not make container import or know about modules.

## Files / Modules to Inspect

- `packages/ioc/src/composer.ts`
- `packages/ioc/src/tokens.ts`
- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `test/package-exports.test.ts`
- Existing `packages/ioc/test/*`

## Known Risks

- Accidentally implementing composer runtime behavior in the foundation task.
- Overfitting module ID validation to token ID validation without a documented reason.
- Adding DSL-like fluent helpers too early.
- Breaking tree-shaking by importing heavier layers into root or subpath exports
  unnecessarily.

## Assumptions

- If a module ID validation edge case is unclear, choose a conservative readable rule and
  document it in the run result.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
