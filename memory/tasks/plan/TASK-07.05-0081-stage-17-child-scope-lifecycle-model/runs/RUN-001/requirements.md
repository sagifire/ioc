# RUN-001 Requirements

Task: `TASK-07.05-0081-stage-17-child-scope-lifecycle-model`
Agent Role: Implementation Agent
Started: 2026-07-05

## Мета run

Додати explicit parent/child scope lifecycle API і ownership policy без прихованого
global/current scope.

## Functional Requirements

- Додати public API `scope.createChildScope(options?)`.
- Додати public API `scope.withChildScope(options, callback)`.
- `withChildScope()` має dispose child scope у `finally` на success and failure paths.
- Disposing child scope не має dispose parent scope.
- Parent scope має локально відстежувати active children.
- Parent disposal має dispose active children in reverse creation order.
- Child creation from disposed parent має fail typed error.
- Resolution from disposed child має fail typed error.
- Disposal має лишатися idempotent.

## Test Requirements

- Додати tests для explicit child creation.
- Додати tests для `withChildScope()` success and failure disposal.
- Додати tests, що disposing child не dispose parent.
- Додати tests для parent disposal child order.
- Додати async failure-path tests для child disposal.
- Додати tests для typed errors on disposed parent child creation and disposed child
  resolution.
- Запустити relevant core checks and broader quality gates if feasible.

## Out Of Scope

- Parent scoped provider cache sharing.
- Child value inheritance, override and multi-value merge semantics.
- Domain-specific scope concepts such as transaction, tenant, preview or impersonation.
- Next.js-specific helpers.
- Documentation examples beyond minimal API reference.
