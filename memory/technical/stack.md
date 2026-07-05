# Технічний стек

Оновлено: 2026-07-05

## Роль документа

Цей документ описує технологічні межі для `@sagifire/ioc` і пов'язаних пакетів. Він не
замінює `memory/technical/rules.md`; правила з `rules.md` мають вищий пріоритет, коли між
документами є напруга.

## Мова та формат модулів

- Основна мова: TypeScript.
- Формат модулів: ESM.
- JavaScript callers мають лишатися підтриманими через runtime-friendly API і зрозумілі
  package exports.
- Декоратори не є required API.
- `reflect-metadata` не використовується.
- Публічні типи мають бути стабільними й достатньо виразними для TypeScript inference.
- `any` треба уникати; якщо він неминучий, причина має бути локально зрозуміла.

## Runtime environments

Core package має працювати без Node-only assumptions:

- modern Node.js;
- browser-compatible runtimes;
- Edge-compatible environments;
- середовища, сумісні з Workers, де це практично можливо.

Core package не імпортує:

- `fs`;
- `path`;
- `process`;
- `Buffer`;
- Next.js;
- React;
- testing helpers;
- `reflect-metadata`.

Node-specific або framework-specific behavior належить окремим пакетам чи прикладам.

## Package layout

### `@sagifire/ioc`

Core package містить:

- tokens і namespaces;
- container runtime;
- scope runtime;
- module definitions;
- composer;
- diagnostics;
- object-configuration API;
- DSL поверх object-configuration API.

Core package не знає про Next.js, React, filesystem discovery, decorators або global mutable
container.

### `@sagifire/ioc-next`

Next adapter package містить лише Next.js App Router helpers:

- cached runtime helper;
- explicit request context helper;
- route handler scope helper;
- server action scope helper;
- приклади інтеграції на boundary framework.

Пакет не змінює core API і не створює прихований service locator.

### `@sagifire/ioc-testing`

Testing package містить:

- isolated test runtime;
- overrides;
- test composer;
- fake modules;
- module harnesses;
- graph assertions;
- diagnostic assertions.

Testing helpers працюють через public API і не мутують frozen production runtime.

## Package exports

`@sagifire/ioc` має підтримувати tree-shaking friendly exports:

```text
@sagifire/ioc
@sagifire/ioc/tokens
@sagifire/ioc/container
@sagifire/ioc/context
@sagifire/ioc/composer
@sagifire/ioc/diagnostics
@sagifire/ioc/dsl
```

Subpath exports не повинні тягнути зайві runtime layers. Наприклад, token-only import не має
підвантажувати composer або DSL.

## Build tooling

Базові інструменти:

- `pnpm` для workspace;
- TypeScript для compile/typecheck;
- ESLint для static checks;
- Prettier для formatting;
- Vitest для runtime і type-level tests;
- Changesets для versioning/changelog;
- GitHub Actions або equivalent CI для quality gates.

Build scripts мають бути package-boundary aware. Кожен package повинен мати незалежну
перевірку там, де це має сенс.

## Formatting і code style

- Indent: 4 spaces.
- Quotes: single quotes.
- Semicolons: none.
- Trailing commas: none.
- Орієнтовний print width: 100.
- Letter spacing у frontend/docs examples не стосується core package.
- `undefined` треба обробляти явно.
- Braces використовуються завжди.

## Documentation artifacts

Публічна документація включає:

- root `README.md`;
- package README для core/testing/next packages;
- `docs/architecture.md`;
- `docs/container.md`;
- `docs/scopes.md`;
- `docs/modules.md`;
- `docs/diagnostics.md`;
- `docs/testing.md`;
- `docs/next.md`;
- `docs/migration-from-di-container.md`;
- examples у `examples/`.

Docs мають описувати implemented public API. Future ideas мають бути clearly marked або
винесені в Project Memory tasks.

## Verification

Рекомендовані перевірки:

- `pnpm build`;
- `pnpm test`;
- `pnpm lint`;
- `pnpm typecheck`, якщо script існує;
- package dry-run validation перед release;
- docs/example checks для snippets where practical.

Якщо dependencies не встановлені або команда потребує network access, агент має попросити
дозвіл, а не обходити проблему прихованими способами.

## Release tooling

Release readiness включає:

- Apache 2.0 license artifacts;
- publish metadata;
- Changesets;
- changelog;
- CI quality gates;
- package pack/dry-run checks;
- manual npm publish workflow.

Actual npm publish не виконується без explicit human approval. Provenance support бажаний
where practical, але зовнішні repository/npm settings не треба вигадувати як наявні.

## Stage-specific technical notes

### Stage 2

Stage 2 створює тільки foundation монорепозиторію: workspace, package structure,
TypeScript, ESLint, Prettier, Vitest, build scripts, package export placeholders,
README/docs skeleton і CI-ready scripts. Container logic не реалізується.

### Stage 3

Stage 3 додає typed tokens і namespaces. Tests мають перевіряти token ID validation,
namespace prefixing і type inference для token values.

### Stage 4

Stage 4 додає основу синхронного single-provider container: `bind()`, `toValue()`,
`toFactory()`, `toClass()`, `freeze()`, `get()` і `tryGet()`. `freeze()` лишається
async-compatible, навіть коли providers синхронні.

### Stage 5

Stage 5 додає multi-provider behavior: `add()`, `getAll()`, deterministic order і strict
single/multi validation. `getAll()` повертає fresh array і не відкриває internal storage.

### Stage 6

Stage 6 додає sync scopes, scoped lifetime і scope-local values. Single/multi token kind
conflicts мають fail, а не silently convert token mode.

### Stage 7

Stage 7 додає async providers/resources, `getAsync()`, `tryGetAsync()` і disposal rules.
Sync `get()` ніколи не повертає `Promise`.

### Stage 8

Stage 8 додає `SagifireIocError`, diagnostic reports і deterministic formatting.
Diagnostic codes використовують namespace `SAGIFIRE_IOC_*`.

### Stage 9

Stage 9 додає module definition і composer. Container не знає про modules; composer
використовує container/context для assembly application graph.

### Stage 10

Stage 10 додає dependency edge metadata і module cycle diagnostics без execution user
factories. Inspection не має відкривати provider values або private runtime internals.

### Stage 11

Stage 11 додає DSL як optional layer поверх explicit object configuration. Object API
лишається first-class і supported.

### Stage 12

Stage 12 додає testing package. Helpers мають працювати через public inspection/override
surfaces і не залежати від private graph internals.

### Stage 13

Stage 13 додає Next adapter package. Helpers мають лишатися на framework boundary і не
створювати hidden current request/action APIs.

### Stage 14

Stage 14 додає documentation і examples. Docs snippets мають відповідати implemented API;
examples мають використовувати найменший достатній шлях перевірки.

### Stage 15

Stage 15 додає release automation і governance readiness. npm publish лишається ручним
кроком з explicit human approval.

### Stage 16

Stage 16 додає pre-`0.0.1` stabilization audit, fixes і release handoff. Critical findings
закриваються або явно reclassified with rationale.

### Stage 17

Stage 17 є audit/decision gate для `0.0.2` feature request. Implementation tasks мають
зберегти package boundaries, diagnostic namespace, object API parity і заборону hidden graph
inference.
