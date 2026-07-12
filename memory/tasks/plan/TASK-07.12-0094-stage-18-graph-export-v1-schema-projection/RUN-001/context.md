# Контекст виконання: RUN-001

Related Task: [TASK-07.12-0094](../task.md)
Prepared: 2026-07-12
Prepared By: Planning Agent
Previous Run: none

## Мета run

Реалізувати bounded graph export v1 foundation із safe projection та canonical JSON.

## Ефективні вимоги

- Виконати всі 12 task acceptance criteria.
- Використовувати `ModuleGraph` / safe inspection як єдине semantic source.
- Version schema окремо від package; semantic order не сортувати глобально.
- Privacy/non-execution/Node-free boundaries є release blockers.
- Behavioral changes покрити tests; object API first.

## Обсяг

- Export DTO/schema, projection, canonical JSON, exports, tests, minimal docs.

## Поза обсягом

- Renderers, CLI/filesystem, lifetime/async multi, version/publish.

## Обов'язковий контекст задачі

- `memory/reports/research/2026-07-12-stage-18-0-0-3-feature-portfolio.md`
- `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/FIX-002.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- Relevant `packages/ioc/src/composer.ts`, tests and docs discovered by indexes.

## Перевірки

- build, test, typecheck, lint/format і package/export smoke checks.
- Repeatability, schema compatibility, privacy sentinel, non-execution and semantic order tests.
- UTF-8, links, task status, self-review and independent audit.

## Ризики

- Accidental unstable public schema, privacy leakage або semantic-order corruption.
- Duplication of graph semantics instead of projection.

## Припущення

- Exact public names may be refined in implementation while preserving approved semantics.
