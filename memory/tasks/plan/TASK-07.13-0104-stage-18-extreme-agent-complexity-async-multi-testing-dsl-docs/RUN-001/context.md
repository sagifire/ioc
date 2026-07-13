# Контекст виконання: RUN-001

Related Task: [TASK-07.13-0104](../task.md)
Prepared: 2026-07-13
Prepared By: Task Package Creation Agent
Previous Run: none

## Мета run

Реалізувати testing, DSL, docs і export layer над завершеними production async multi
semantics без їх перевизначення.

## Ефективні вимоги

- Реалізувати append/replace overrides і fake modules тільки через public API.
- Зберегти one-to-one DSL parity з object API.
- Додати truth table, migration, examples і no-partial-versus-transaction explanation.
- Закрити export/smoke/quality gates і representative lifecycle/diagnostic fixtures.

## Попередники

- TASK-0103 і TASK-0108 мають бути `done`; їх final results і всі попередні shared
  contracts є input.

## Обсяг

- `@sagifire/ioc-testing`, DSL, docs/examples, exports, smoke consumers і regression fixtures.

## Поза обсягом

- Нова production semantics, private runtime mutation, parallel scheduler, versioning і publish.

## Критерії приймання

- [ ] Усі 12 task acceptance criteria traced у result.
- [ ] Testing helpers і DSL доведено делегують public object API semantics.
- [ ] Truth table, migration і no-partial-versus-transaction docs reviewed for accuracy.
- [ ] Independent audit findings закриті до review-ready.

## Обов'язковий контекст задачі

- `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/task.md`
- `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/RUN-001/result.md`
- `memory/reports/research/2026-07-12-stage-18-async-multi-provider-semantics-design.md`
- `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-001.md`
- `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-002.md`
- `memory/tasks/plan/TASK-07.13-0103-stage-18-extreme-agent-complexity-async-multi-resource-ownership-disposal/task.md`
- `memory/tasks/plan/TASK-07.13-0108-stage-18-extreme-agent-complexity-lifetime-scope-inspection-graph-export-v2/task.md`
- `memory/reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Вхідні файли та модулі

- `packages/ioc-testing/`, core/composer DSL surfaces, package exports, docs і examples.

## Обмеження

- Testing/DSL не визначають production semantics і не використовують private state mutation.
- Object API лишається first-class; documentation не обіцяє transactional side-effect rollback.

## Перевірки

- Focused testing/DSL/type tests; privacy collision, cycle, order і resource fixtures.
- Full build, test, typecheck, lint, format, export-map і package consumer smoke checks.
- Docs link/example validation та API parity review.

## Ризики

- Replace semantics можуть випадково обійти production cardinality або ownership gates.
- DSL overloads можуть розійтися з object API типами чи приховати lifecycle choice.
- Документація може помилково подати no-partial-results як transactional guarantee.
- Export surface може пройти internal tests, але зламатися для package consumer.

## Припущення

- TASK-0103 завершує stable production resource semantics і public API surface.
- Усі helpers можуть бути реалізовані без доступу до private runtime representation.

## Зміни від попереднього run

Не застосовується для RUN-001.
