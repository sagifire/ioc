# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.29-0010-stage-5-multi-provider/task.md`
- `memory/tasks/plan/TASK-06.29-0010-stage-5-multi-provider/runs/RUN-001/requirements.md`
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
модульної композиції залежностей. Stage 5 додає collection/contribution-style provider
resolution до вже реалізованого Stage 4 sync container foundation.

## Relevant Domain Context

- Token - typed dependency identity object with stable runtime `id`; object identity is
  not required for matching.
- Provider - registration that knows how to produce a token value.
- Single provider token - token registered through `bind(token)` where exactly one
  provider is expected.
- Multi-provider token - token registered through `add(token)` where multiple providers
  are collected through `getAll()`.
- Container builder - mutable configuration phase API used before `freeze()`.
- Runtime - frozen immutable container output used for dependency resolution.
- Singleton - one instance/value per frozen runtime.
- Transient - new instance/value per resolution.

## Relevant Technical Context

- Core package `@sagifire/ioc` має бути runtime-agnostic.
- Container does not know about modules.
- Stage 4 already implemented sync single-provider `bind()`, `get()` and `tryGet()`.
- Stage 5 starts multi-provider `add()` and `getAll()`.
- Context/scopes start at Stage 6.
- Async providers/resources start at Stage 7.
- Full diagnostics layer starts at Stage 8.
- `get()` must never perform hidden async behavior.
- `freeze()` is async-compatible by public API design.
- Token ID is canonical provider identity.

## Relevant Knowledge Packages

Немає обов'язкових reusable knowledge packages. Якщо під час implementation виникне
процесний конфлікт, перевірити `memory/knowledge/package-index.md`.

## Files / Modules to Inspect

- `packages/ioc/src/tokens.ts`
- `packages/ioc/src/container.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/tsup.config.ts`
- `packages/ioc/test/container.test.ts`
- `test/package-exports.test.ts`
- Existing package README/docs only if public API description becomes misleading.

## Known Risks

- Зробити `getAll()` permissive для single-provider tokens і стерти межу між `bind()` та
  `add()`.
- Дозволити змішування single-provider і multi-provider registrations для одного token ID.
- Повернути internal provider array з `getAll()` і дозволити caller mutation runtime state.
- Втратити deterministic registration order.
- Реалізувати `add().toClass()`, scopes або async APIs раніше відповідних stages.
- Зробити provider matching через token object identity замість stable token ID.
- Приглушити provider errors у `getAll()` замість кидати provider/cycle failures.
- Реалізувати diagnostics framework раніше Stage 8.
- Додати mutable runtime APIs або global provider state.
- Зламати tree-shaking friendly subpath export boundary.

## Assumptions

- Stage 4 container sync provider foundation already passed task-level human review.
- `TASK-06.29-0009` буде approved або користувач явно дозволить почати Stage 5
  implementation раніше.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
