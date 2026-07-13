# RSCH-001: Async multi-provider semantics design

Status: completed
Related Task: [TASK-07.12-0098](task.md)
Related Run: [RUN-001](RUN-001/index.md)
Created: 2026-07-13
Disposition: final-result

## Питання

Яка collection-resolution model додає async multi-providers без зміни sync `getAll()`,
втрати deterministic registration order, створення collection-level cache/ownership або
нечесної transactional rollback обіцянки?

## Висновок

Рекомендовано declarative sync-eligibility зі scope/sync preflight: `getAll()` може читати
sync contributions та eager singleton async contributions після успішного `freeze()`, але
до виконання будь-якого contribution відхиляє collection із lazy, transient або scoped
async contribution. Назва explicit async collection accessor цим design не фіксується;
його semantic signature — token to `Promise` of a fresh ordered array.

Explicit async collection resolution виконує contributions послідовно в per-token
registration order і зупиняється на першій помилці. Collection promise/cache/owner не
створюється:
in-flight deduplication, retry, lifetime, resource ownership і disposal лишаються
per-provider. Результат або повертається повністю, або не повертається взагалі; arbitrary
factory side effects не мають transactional rollback.

Async factory contributions входять у перший implementation slice після окремого
planning approval. Async resource contributions мають визначену target ownership model,
але реалізуються наступним slice: singleton resource належить runtime, scoped resource —
effective scope, transient resource заборонений. Lazy partial failure не dispose-ить
успішні owner-managed resources; failed eager freeze відхиляє candidate runtime і
звільняє всі створені ним runtime-owned resources.

Cycle state розділяє active collection frame і concrete provider frame. Outward failure
identity для module-private contribution використовує module ID + stable private
collection ordinal + contribution index без raw private token ID.

## Результати

- Truth table sync/eager/lazy/mixed/scope-local behavior.
- Candidate comparison для sync boundary, concurrency, failure, retry та resources.
- Deterministic sequential fail-fast policy.
- Per-provider cache, ownership, retry й disposal contract.
- Composer, module setup, testing, DSL та inspection implications.
- Phased implementation recommendation без створення implementation tasks.

## Detailed report

[2026-07-12-stage-18-async-multi-provider-semantics-design.md](../../../reports/research/2026-07-12-stage-18-async-multi-provider-semantics-design.md)
