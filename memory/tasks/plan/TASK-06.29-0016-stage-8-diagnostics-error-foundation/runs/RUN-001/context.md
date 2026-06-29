# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/task.md`
- `memory/tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/runs/RUN-001/requirements.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

`@sagifire/ioc` має бути TypeScript-native, JavaScript-friendly бібліотекою with readable
and actionable diagnostics. Stage 8 starts the diagnostics layer after tokens, container,
multi-provider, scopes and async resource lifecycle are implemented.

## Relevant Domain Context

- Diagnostic - structured error or report that explains validation or runtime failure with
  actionable details.
- Token ID is canonical runtime identity and should be present in token/provider failures.
- Provider cycle diagnostics should include token ID path.
- Scope errors should identify disposed scope or scoped provider without active scope.
- Async access errors should guide users toward `getAsync()` or eager initialization.

## Relevant Technical Context

- `packages/ioc/src/diagnostics.ts` is currently a Stage 2 placeholder.
- Stage 3 introduced `InvalidTokenIdError`.
- Stage 4 introduced container-specific typed errors.
- Stage 5 introduced single/multi-provider mismatch behavior.
- Stage 6 introduced scope-specific typed errors.
- Stage 7 introduced async/disposal typed errors.
- Existing errors already have `code` fields using `SAGIFIRE_IOC_...`.
- Stage 8 should preserve existing code strings unless there is a direct conflict.
- Full report/formatter work is deferred to `TASK-06.29-0017`.

## Relevant Knowledge Packages

Немає обов'язкових reusable knowledge packages. Якщо під час implementation виникне
процесний конфлікт, перевірити `memory/knowledge/package-index.md`.

## Files / Modules to Inspect

- `packages/ioc/src/diagnostics.ts`
- `packages/ioc/src/tokens.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/context.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/test/tokens.test.ts`
- `packages/ioc/test/container.test.ts`
- `packages/ioc/test/scope.test.ts`
- `packages/ioc/test/async-providers.test.ts`
- `test/package-exports.test.ts`
- Existing README/docs only if public diagnostics API text becomes misleading.

## Known Risks

- Accidentally change runtime behavior while migrating error classes.
- Break `instanceof` checks for existing concrete errors.
- Rename existing `code` strings and create unnecessary public API churn.
- Put provider values, resource instances or scope-local values into `details`.
- Introduce import cycles between diagnostics and container/context/tokens.
- Make root exports import more than necessary and weaken tree-shaking boundaries.
- Rely on Node-only `Error` or formatting behavior.
- Start implementing reports/formatter in this task and enlarge scope.
- Add composer/module diagnostics before composer exists.

## Assumptions

- Stage 7 async providers/resources implementation has passed task-level human review.
- `TASK-06.29-0015` буде approved або користувач явно дозволить почати implementation
  раніше.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
