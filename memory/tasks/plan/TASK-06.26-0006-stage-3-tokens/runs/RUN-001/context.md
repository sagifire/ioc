# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-06.26-0006-stage-3-tokens/task.md`
- `memory/tasks/plan/TASK-06.26-0006-stage-3-tokens/runs/RUN-001/requirements.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Relevant Product Context

`@sagifire/ioc` має бути TypeScript-native, JavaScript-friendly бібліотекою для модульної
композиції залежностей. Stage 3 реалізує перший маленький шматок core API: typed tokens,
які надалі будуть identity mechanism для providers, capabilities і required ports.

## Relevant Domain Context

Token - typed dependency identity object with stable runtime `id`; object identity is not
required for matching. Token namespace creates stable prefixed IDs, for example
`contact-requests.public-api`.

## Relevant Technical Context

- Core package `@sagifire/ioc` має бути runtime-agnostic.
- Token contract у `memory/technical/architecture.md` є canonical baseline.
- `__type` є phantom metadata і не має використовуватись runtime.
- Token ID є canonical runtime identity.
- Stage 3 allowed scope обмежений token API, validation і tests.
- Full diagnostics layer починається у Stage 8, тому Stage 3 не має реалізовувати
  `DiagnosticReport` або formatter.
- Planned Stage 3 type-level assertion approach: Vitest `expectTypeOf`.

## Relevant Knowledge Packages

Немає обов'язкових reusable knowledge packages. Якщо під час implementation виникне
процесний конфлікт, перевірити `memory/knowledge/package-index.md`.

## Files / Modules to Inspect

- `packages/ioc/src/tokens.ts`
- `packages/ioc/src/index.ts`
- `packages/ioc/package.json`
- `packages/ioc/tsup.config.ts`
- `vitest.config.ts`
- `test/package-exports.test.ts`
- Existing package README/docs only if public API description becomes misleading.

## Known Risks

- Завчасно реалізувати container або dependency graph behavior під виглядом token matching.
- Зробити token identity object-based замість ID-based.
- Додати global mutable registry для uniqueness validation.
- Реалізувати diagnostics framework раніше Stage 8.
- Додати занадто широкий або нечіткий ID grammar без task-level фіксації.
- Зламати tree-shaking friendly subpath export boundary.

## Assumptions

- Stage 2 foundation build/test tooling вже працює.
- `TASK-06.26-0005` буде approved або користувач явно дозволить почати Stage 3
  implementation раніше.
- Якщо dependency installation або new dependency потребує мережі, агент попросить дозвіл.
