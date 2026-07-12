# Контекст виконання: RUN-001

Related Task: [TASK-07.12-0096](../task.md)
Prepared: 2026-07-12
Prepared By: Planning Agent
Previous Run: none

## Мета run

Завершити adoption/hardening graph export після 0094-0095.

## Ефективні вимоги

- TASK-07.12-0095 must be done before activation.
- Docs/examples only for implemented public API.
- Project Memory workflow explicit, provenance-aware and non-mutating by default.
- Testing helpers public-API-only; full relevant quality/package checks.

## Поза обсягом

- Runtime semantic extensions, CLI/filesystem core behavior, version/publish.

## Обов'язковий контекст задачі

- Final artifacts 0094 and 0095.
- Stage 18 report, architecture/rules/testing/definition-of-done.
- Current docs/examples/testing package indexes.

## Перевірки

- Docs links/examples, build/test/typecheck/lint/format, package/export smoke.
- Snapshot repeatability/privacy and testing helper boundary checks.
- Self-review and independent audit.

## Ризики

- Docs можуть зробити schema stronger promise than implementation.
- Workflow може помилково автоматизувати canonical memory mutation.
