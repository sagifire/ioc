# Контекст виконання: RUN-001

Related Task: [TASK-07.12-0095](../task.md)
Prepared: 2026-07-12
Prepared By: Planning Agent
Previous Run: none

## Мета run

Реалізувати deterministic safe DOT/Mermaid renderers поверх завершеного v1 document.

## Ефективні вимоги

- TASK-07.12-0094 must be done before activation.
- Render only v1 DTO; no parallel traversal/model.
- Central escaping, stable IDs, semantic order, privacy and no-execution boundaries.
- Tests/docs/exports proportional to public behavior.

## Поза обсягом

- Schema redesign, filesystem/CLI, image rendering, version/publish.

## Обов'язковий контекст задачі

- TASK-07.12-0094 final artifacts and implemented API.
- Stage 18 report, approved FIX-002, architecture/rules/testing.

## Перевірки

- Relevant build/test/typecheck/lint/format/package smoke.
- Golden, escaping, collisions, Unicode, privacy and cross-renderer provenance.
- Self-review and independent audit.

## Ризики

- Syntax injection, unstable IDs, renderer divergence або accidental private labels.
