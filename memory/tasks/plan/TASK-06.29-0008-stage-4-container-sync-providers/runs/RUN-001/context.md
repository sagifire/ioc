# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.29-0008-stage-4-container-sync-providers/task.md`
- `memory/tasks/plan/TASK-06.29-0008-stage-4-container-sync-providers/runs/RUN-001/requirements.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

`@sagifire/ioc` має бути TypeScript-native, JavaScript-friendly бібліотекою для явної
модульної композиції залежностей. Stage 4 реалізує перший executable container шар, але
ще не реалізує modules, composer, scopes, async providers або adapters.

## Relevant Domain Context

- Token - typed dependency identity object with stable runtime `id`; object identity is
  not required for matching.
- Provider - registration that knows how to produce a token value.
- Container builder - mutable configuration phase API used before `freeze()`.
- Runtime - frozen immutable container output used for dependency resolution.
- Singleton - one instance/value per frozen runtime.
- Transient - new instance/value per resolution.

## Relevant Technical Context

- Core package `@sagifire/ioc` має бути runtime-agnostic.
- Container does not know about modules.
- Context/scopes start at Stage 6.
- Multi-provider starts at Stage 5.
- Async providers/resources start at Stage 7.
- Full diagnostics layer starts at Stage 8.
- `get()` must never perform hidden async behavior.
- `freeze()` is async-compatible by public API design.
- `toClass()` must not use decorators, `reflect-metadata`, parameter names or constructor
  metadata.

## Relevant Knowledge Packages

Немає обов'язкових reusable knowledge packages. Якщо під час implementation виникне
процесний конфлікт, перевірити `memory/knowledge/package-index.md`.

## Files / Modules to Inspect

- `packages/ioc/src/tokens.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/tsup.config.ts`
- `packages/ioc/test/tokens.test.ts`
- `test/package-exports.test.ts`
- Existing package README/docs only if public API description becomes misleading.

## Known Risks

- Реалізувати constructor injection magic під виглядом `toClass()`.
- Зробити `freeze()` sync і створити майбутній breaking change для Stage 7.
- Підмішати `getAll()`, scopes або async provider APIs раніше відповідних stages.
- Зробити provider matching через token object identity замість stable token ID.
- Приглушити provider errors у `tryGet()` замість повертати `undefined` тільки для
  missing provider.
- Реалізувати diagnostics framework раніше Stage 8.
- Додати mutable runtime APIs або global provider state.
- Зламати tree-shaking friendly subpath export boundary.

## Assumptions

- Stage 3 tokens already provide stable `Token<TValue>` and valid token IDs.
- `TASK-06.29-0007` буде approved або користувач явно дозволить почати Stage 4
  implementation раніше.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
