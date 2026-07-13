# TASK-07.13-0104: [EXTREME AGENT COMPLEXITY] Stage 18 async multi testing DSL and docs

Task Status: backlog
Type: implementation
Created: 2026-07-13
Agent Complexity: extreme
Owner Role: Implementation Agent
Current Run: RUN-001

## Поточний стан

Run Status: prepared
Progress: Task package prepared; predecessor pending.
Acceptance: 0/12
Blockers: TASK-0103 and TASK-0108 must be done
Blocked Phase: activation
Pending Decisions: none
Next Action: Активувати лише після human-approved completion TASK-0103 і TASK-0108.

## Мета

Провести погоджені async multi semantics у `@sagifire/ioc-testing`, DSL, документацію,
публічні exports і smoke coverage без створення альтернативної production-моделі.

## Попередники

- [TASK-0103](../TASK-07.13-0103-stage-18-extreme-agent-complexity-async-multi-resource-ownership-disposal/task.md)
  має бути `done` після human review.
- [TASK-0108](../TASK-07.13-0108-stage-18-extreme-agent-complexity-lifetime-scope-inspection-graph-export-v2/task.md)
  має бути `done` після human review, щоб testing/docs використовували final scope/export surface.

## Вимоги

- Додати async multi append/replace overrides і fake modules у `@sagifire/ioc-testing`.
- Будувати testing helpers виключно через public production API, без мутації frozen runtime.
- Забезпечити one-to-one DSL projection на object-configuration API без нової семантики.
- Документувати sync/async truth table, migration, examples і error precedence.
- Чітко відрізнити no-partial-results return atomicity від transactional rollback.
- Додати fixtures для order, cycles, privacy collision, retry та resource lifecycle.
- Перевірити package exports, smoke consumers, build, typecheck, lint і tests.
- Не змінювати production semantics у testing або DSL шарах.

## Обсяг

- `@sagifire/ioc-testing` async multi append/replace overrides і fake module helpers.
- DSL-фасади, що точно делегують object API registrations/access contract.
- Core/composer/testing package docs, migration notes та focused examples.
- Public export maps, type/compile smoke і package consumer smoke checks.
- Privacy collision, collection/provider cycle, registration order та resource fixtures.

## Поза обсягом

- Перевизначення core/composer/scope/resource async multi semantics.
- Доступ до private runtime internals із testing helpers або DSL magic.
- Parallel/configurable scheduler, aggregate errors чи transactional factory rollback.
- Version bump, publish, release workflow або твердження про повну готовність `0.0.3`.

## Критерії приймання

- [ ] Testing append override додає async multi contributions у deterministic order лише через public API.
- [ ] Testing replace override явно замінює collection і не мутує frozen production runtime.
- [ ] Fake modules підтримують async factory/resource multi fixtures через public module/composer API.
- [ ] Testing helpers зберігають production cardinality, preflight, retry, ownership і failure semantics.
- [ ] DSL має one-to-one mapping на object API для всіх підтриманих async multi registrations/options.
- [ ] Object-configuration API лишається повністю usable без DSL, а DSL не додає hidden dependency resolution.
- [ ] Документація містить complete sync/async, eager/lazy, lifetime і scope truth table.
- [ ] Migration/examples пояснюють explicit async accessor, ordering, retry та no-partial-results behavior.
- [ ] Docs прямо відрізняють return atomicity від transaction/rollback arbitrary factory side effects.
- [ ] Privacy collision, cycle-frame, order і resource ownership/disposal fixtures проходять у testing package.
- [ ] Exports, compile/type smoke, package smoke, build, typecheck, lint, format і full tests passed.
- [ ] Production semantics не перевизначені; predecessor contracts traced і independent audit passed.

## Пов'язана пам'ять

- [Approved TASK-0098](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/task.md)
- [TASK-0098 result](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/RUN-001/result.md)
- [Detailed design report](../../../reports/research/2026-07-12-stage-18-async-multi-provider-semantics-design.md)
- [TASK-0098 FIX-001](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-001.md)
- [TASK-0098 FIX-002](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-002.md)
- [Predecessor TASK-0103](../TASK-07.13-0103-stage-18-extreme-agent-complexity-async-multi-resource-ownership-disposal/task.md)
- [Predecessor TASK-0108](../TASK-07.13-0108-stage-18-extreme-agent-complexity-lifetime-scope-inspection-graph-export-v2/task.md)
- [Approved lifetime implementation report](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Testing, DSL, docs and export hardening.

## Дослідження

- Не очікуються; formal research створюється лише за виявленої design ambiguity.

## Фіксації

- Не очікуються; змістові canonical memory changes потребують окремого approved `FIX-*`.

## Запити на рішення

- Немає на етапі підготовки.

## Human Review

Status: not-requested
Requested: n/a
Reviewed: n/a
Approval Source: n/a

## Фінальний результат

Completed: pending
Final Run: pending
Summary: pending
Residual Risks: pending
