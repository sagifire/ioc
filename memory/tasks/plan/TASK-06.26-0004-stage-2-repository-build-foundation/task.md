# TASK-06.26-0004: Stage 2 repository/build foundation

Status: backlog
Type: chore
Execution Mode: autonomous-implementation
Created: 2026-06-28
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати Stage 2 repository/build foundation для `@sagifire/ioc` без runtime/container
logic.

## Product Context

Stage 2 створює monorepo/package/build основу для подальших stages. Без стабільної
package foundation наступні implementation stages не матимуть перевірного способу
генерувати JS/types, тестувати package exports і підтримувати package boundaries.

## Scope

- Створити `pnpm` workspace.
- Створити package structure:
  - `packages/ioc`
  - `packages/ioc-next`
  - `packages/ioc-testing`
- Додати TypeScript configuration для workspace і packages.
- Додати ESLint, Prettier, Vitest і planned `tsup` build configuration.
- Додати package export placeholders для `@sagifire/ioc`, `@sagifire/ioc-next` і
  `@sagifire/ioc-testing`.
- Додати tree-shaking friendly `sideEffects: false` у package manifests.
- Додати README/docs skeleton без повної документації Stage 14.
- Додати CI-ready scripts у root і package manifests.
- Додати smoke/export/build plumbing tests лише там, де вони перевіряють foundation і
  не реалізують runtime behavior.

## Out of Scope

- Реалізовувати tokens, token namespaces або token validation.
- Реалізовувати container, providers, lifetimes, scopes або async model.
- Реалізовувати composer, modules, bindings, DSL або diagnostics behavior.
- Реалізовувати Next.js App Router helpers.
- Реалізовувати testing overrides, fake modules або graph assertions.
- Додавати release automation, changesets, npm publish workflow або provenance.
- Додавати filesystem auto-discovery.
- Імпортувати Next.js, React або Node-only APIs у `@sagifire/ioc`.

## Acceptance Criteria

- [ ] `pnpm install` works.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] All packages build independently.
- [ ] All configured package exports resolve correctly.
- [ ] `.d.ts` types are generated for all packages.
- [ ] `sideEffects: false` is configured for all package manifests.
- [ ] Core package does not import Next.js, React, Node-only APIs, decorators or
  `reflect-metadata`.
- [ ] Stage 2 does not implement container, tokens, composer, DSL, diagnostics behavior
  or adapters.
- [ ] README/docs skeleton exists without claiming unimplemented runtime behavior works.

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
  - Purpose: Початковий autonomous implementation run для Stage 2 foundation.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Якщо залежності не встановлені або `pnpm install` потребує мережі, агент має попросити
дозвіл на інсталяцію і не обходити це приховано.
