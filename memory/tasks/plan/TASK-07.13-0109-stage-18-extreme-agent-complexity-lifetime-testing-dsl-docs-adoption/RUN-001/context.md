# Контекст виконання: RUN-001

Related Task: [TASK-07.13-0109](../task.md)
Prepared: 2026-07-13
Prepared By: Task Package Creation Agent
Previous Run: none

## Мета run

Додати public testing/DSL/docs/adoption support після стабілізації async supporting і
lifetime scope/export production surfaces.

## Ефективні вимоги

- Use public production APIs for all testing helpers and fixtures.
- Project dependency options one-to-one through DSL and testing declarations.
- Document matrix/privacy/coverage/v2 and staged adoption without false proof claims.
- Preserve production defaults and avoid release/version actions.

## Попередники

- [TASK-0104](../../TASK-07.13-0104-stage-18-extreme-agent-complexity-async-multi-testing-dsl-docs/task.md)
  має бути `done`.
- [TASK-0108](../../TASK-07.13-0108-stage-18-extreme-agent-complexity-lifetime-scope-inspection-graph-export-v2/task.md)
  має бути `done`.

## Обсяг

- `packages/ioc-testing/src/index.ts`, package manifest/tests, `dsl.ts`, public exports,
  docs/examples, root type tests and package consumer smoke.

## Поза обсягом

- New production/default/schema/version/publish semantics або private-internal helpers.

## Критерії приймання

- [ ] Усі 12 task acceptance criteria traced у result.
- [ ] Testing/DSL parity through public object API is verified.
- [ ] Docs/adoption/privacy/export/package gates passed.
- [ ] Independent audit findings закриті до review-ready.

## Обов'язковий контекст задачі

- `memory/tasks/plan/TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/task.md`
- `memory/tasks/plan/TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RUN-001/result.md`
- `memory/reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md`
- `memory/tasks/plan/TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md`
- `memory/tasks/plan/TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/result.md`
- `memory/reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md`
- `memory/tasks/plan/TASK-07.13-0104-stage-18-extreme-agent-complexity-async-multi-testing-dsl-docs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.13-0108-stage-18-extreme-agent-complexity-lifetime-scope-inspection-graph-export-v2/RUN-001/result.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Вхідні файли та модулі

- Testing helpers/fixtures, DSL definitions/compiler, docs/examples, exports/manifests and smoke tests.

## Обмеження

- Helpers access only public APIs and do not mutate frozen runtime.
- Object API remains first-class; DSL/testing cannot invent semantics.
- No default rollout/schema, version, publish or release-ready claims.

## Перевірки

- Focused testing/DSL/type/privacy fixtures; docs/examples compile.
- Export/package consumer smoke; full build/test/typecheck/lint/format; independent audit.

## Ризики

- Supporting wrapper може втратити metadata або змінити cardinality/order.
- Docs можуть подати coverage як proof factory body behavior.
- Export map може не включити additive public types consistently.

## Припущення

- TASK-0104 і TASK-0108 production/support surfaces stable and approved.
- Documentation може пояснити rollout без changing canonical default.

## Зміни від попереднього run

Не застосовується для RUN-001.
