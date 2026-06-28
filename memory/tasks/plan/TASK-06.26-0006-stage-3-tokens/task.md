# TASK-06.26-0006: Stage 3 tokens

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-28
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 3 tokens у `@sagifire/ioc`: typed token contract, token factory,
namespace helper, token ID validation і тести без container або composer behavior.

## Product Context

Tokens є primary identity mechanism для dependency providers, capabilities, required ports
і multi-provider collections. Stage 3 має зробити цей identity layer стабільним перед
початком Stage 4 container implementation.

## Scope

- Реалізувати `Token<TValue>` у `packages/ioc/src/tokens.ts`.
- Реалізувати `token<TValue>(id, options?)`.
- Реалізувати `namespace(id)` helper для stable prefixed token IDs.
- Додати token ID validation.
- Додати мінімальний `InvalidTokenIdError` або еквівалентну token-specific typed error
  для invalid IDs без повного diagnostics layer.
- Експортувати token API з `@sagifire/ioc/tokens`.
- Експортувати token API з root `@sagifire/ioc`, якщо це не порушує tree-shaking boundary.
- Додати runtime tests для token creation, namespaces і invalid IDs.
- Додати type-level assertions для token inference через Vitest `expectTypeOf`.
- Переконатися, що existing package export smoke tests лишаються зеленими.

## Out of Scope

- Реалізовувати container, provider registration/resolution, lifetimes або `freeze()`.
- Реалізовувати multi-provider behavior, scopes, async providers, resources або disposal.
- Реалізовувати composer, modules, capabilities registry, required ports або bindings.
- Реалізовувати DSL helpers.
- Реалізовувати full diagnostics layer: `SagifireIocError`, `Diagnostic`,
  `DiagnosticReport` або `formatDiagnostics()`.
- Змінювати `@sagifire/ioc-next` або `@sagifire/ioc-testing`, крім випадку, коли Stage 3
  token exports вимагають test-only import adjustment.
- Додавати decorators, `reflect-metadata`, Node-only APIs, filesystem access або global
  mutable token registry.
- Редагувати `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] `Token<TValue>` public type доступний з `@sagifire/ioc` і `@sagifire/ioc/tokens`.
- [ ] `token<TValue>(id, options?)` повертає token з stable `id` і optional
  `description`.
- [ ] `Token<TValue>` зберігає type inference для `TValue` без runtime use of phantom
  type metadata.
- [ ] Namespaces створюють stable prefixed IDs, наприклад
  `namespace('contact-requests').token('public-api').id === 'contact-requests.public-api'`.
- [ ] Token ID є canonical runtime identity; implementation не покладається на object
  identity або global registry.
- [ ] Invalid token IDs і namespace IDs rejected через readable token-specific error.
- [ ] `@sagifire/ioc/tokens` import не тягне container/composer/DSL/adapters behavior.
- [ ] Stage 3 не реалізує container, composer, DSL, diagnostics report/formatter,
  Next.js adapters або testing helpers.
- [ ] Runtime tests покривають token creation, namespace IDs і invalid IDs.
- [ ] Type-level assertions покривають token value inference.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Початковий autonomous implementation run для Stage 3 tokens.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Stage 3 починається тільки після task-level human review approval planning task
`TASK-06.26-0005-stage-3-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
