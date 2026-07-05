# RUN-001 Requirements

## Task

`TASK-07.05-0088-stage-17-0-0-2-stabilization-handoff`

## Goal

Закрити release-blocking audit finding `H-001`, виконати lightweight smoke hardening для
`L-001` і підготувати repository / Project Memory handoff перед `0.0.2` review.

## Functional Requirements

- Виправити `examples/next-app-router` stale single/multi declaration для `REQUEST_TAGS`.
- Зберегти semantics explicit у code/docs: request tags are multi request values.
- Додати або розширити automated example coverage для documented direct Node run.
- Розширити package export або packed smoke coverage для new `0.0.2` public helpers and
  diagnostics exports.
- Закрити всі critical/high release-blocking audit findings або зафіксувати rationale /
  blocking follow-up task.
- Синхронізувати Project Memory з final stabilization state.

## Constraints

- Не виконувати actual npm publish без explicit human approval.
- Не додавати features beyond audit closure.
- Не робити broad refactors unrelated to audit findings.
- Не редагувати historical source snapshots.
- Changelog/versioning artifacts змінювати тільки якщо це явно потрібно accepted release
  scope.

## Verification

- Запустити focused Next example compile and direct Node run.
- Запустити package export / packed smoke checks where available.
- Запустити full relevant validation: build, tests, typecheck, lint/format and release
  validation if available.
