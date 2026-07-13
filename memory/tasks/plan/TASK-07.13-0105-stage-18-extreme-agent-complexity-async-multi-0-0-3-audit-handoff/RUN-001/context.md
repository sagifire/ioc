# Контекст виконання: RUN-001

Related Task: [TASK-07.13-0105](../task.md)
Prepared: 2026-07-13
Prepared By: Task Package Creation Agent
Previous Run: none

## Мета run

Виконати full-surface async multi audit, оформити evidence-based findings і передати
stabilization handoff без передчасного version/release claim.

## Ефективні вимоги

- Audit core/composer/scopes/resources/testing/DSL/docs/exports як одну наскрізну систему.
- Перевірити regression, compatibility, privacy, lifecycle і diagnostics.
- Запустити full quality gates і створити formal українськомовний audit report.
- Залучити незалежного subagent-аудитора; reconcile і закрити всі findings до review-ready.

## Попередники

- TASK-0104 і TASK-0109 мають бути `done`; TASK-0100..0104 та lifetime supporting-layer
  final results утворюють audit baseline.

## Обсяг

- Full async multi implementation audit, evidence matrix, quality gates, findings і handoff.

## Поза обсягом

- Version bump, publish, release workflow, whole-`0.0.3` readiness claim і нові features.

## Критерії приймання

- [ ] Усі 12 task acceptance criteria traced у result та detailed audit report.
- [ ] Cross-surface behavior і compatibility matrix мають reproducible evidence.
- [ ] Required findings мають explicit closure path і blocker classification.
- [ ] Independent subagent audit completed, reconciled і documented.

## Обов'язковий контекст задачі

- `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/task.md`
- `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/RUN-001/result.md`
- `memory/reports/research/2026-07-12-stage-18-async-multi-provider-semantics-design.md`
- `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-001.md`
- `memory/tasks/plan/TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-002.md`
- `memory/tasks/plan/TASK-07.13-0104-stage-18-extreme-agent-complexity-async-multi-testing-dsl-docs/task.md`
- `memory/tasks/plan/TASK-07.13-0109-stage-18-extreme-agent-complexity-lifetime-testing-dsl-docs-adoption/task.md`
- `memory/reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/technical/specification-trace.md`

## Вхідні файли та модулі

- `packages/ioc/`, `packages/ioc-testing/`, public DSL/composer surfaces, docs, examples,
  export maps, tests і build/release validation scripts.

## Обмеження

- Auditor не змінює approved semantics і не маскує findings broad refactor.
- Version/publish/release-ready actions потребують окремої задачі та explicit approval.
- Independent subagent audit є mandatory, а не optional same-agent substitute.

## Перевірки

- Focused truth-table, lifecycle, privacy, cycle, retry, ownership і disposal tests.
- Full build, test, typecheck, lint, format, package/export smoke та relevant pack checks.
- API/declaration diff, docs/example validation і predecessor acceptance trace.

## Ризики

- Cross-surface defect може мати значний blast radius і потребувати окремої fix task.
- Cleanup secondary errors або arbitrary factory side effects можуть лишитися residual risks.
- Package smoke може виявити export/type gaps, невидимі monorepo internal tests.
- Формальний handoff легко помилково трактувати як approval усього release `0.0.3`.

## Припущення

- TASK-0100..0104 завершені й approved до activation цього run.
- Full toolchain доступний локально; мережева інсталяція потребує окремого дозволу.

## Зміни від попереднього run

Не застосовується для RUN-001.
