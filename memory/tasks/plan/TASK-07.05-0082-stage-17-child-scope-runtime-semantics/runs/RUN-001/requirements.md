# RUN-001 Requirements

Task: `TASK-07.05-0082-stage-17-child-scope-runtime-semantics`
Agent Role: Implementation Agent
Started: 2026-07-05

## Мета run

Реалізувати runtime semantics для child scopes: value inheritance, override precedence,
multi-value merge and separate scoped provider cache.

## Functional Requirements

- Child scope має резолвити parent scope-local single values.
- Child scope-local single values мають override-ити inherited parent values.
- Child scope має резолвити parent scope-local multi values.
- Child scope-local multi values мають append-итися після parent multi values.
- Child scope має мати окремий scoped provider cache.
- Child scope не має reuse-ити parent scoped provider instances by default.
- Factories resolved through child scope мають бачити child values and overrides.
- Child lifecycle/disposal behavior із `TASK-07.05-0081` має лишитися unchanged.

## Test Requirements

- Додати regression tests для inherited single values.
- Додати regression tests для child override precedence.
- Додати regression tests для multi-value inheritance and append order.
- Додати tests, що scoped provider instance для child відокремлений від parent instance.
- Додати tests, що child-resolved factories capture child overrides.
- Додати tests для transaction/preview/impersonation-like values without adding domain APIs.
- Запустити relevant core package checks and broader gates if feasible.

## Out Of Scope

- Domain-specific UnitOfWork, transaction, preview, tenant or impersonation APIs.
- Next.js-specific lifecycle helpers.
- `@sagifire/ioc-testing` helper additions.
- Docs/examples expansion beyond task memory.
