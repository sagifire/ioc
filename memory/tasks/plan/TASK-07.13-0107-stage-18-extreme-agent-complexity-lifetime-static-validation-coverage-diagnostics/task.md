# TASK-07.13-0107: [EXTREME AGENT COMPLEXITY] Stage 18 lifetime static validation, coverage and diagnostics

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
Blockers: TASK-0106 must be done
Blocked Phase: activation
Pending Decisions: none
Next Action: Активувати лише після human-approved completion TASK-0106.

## Мета

Реалізувати static lifetime validation, coverage aggregation, stable-severity typed
diagnostics і additive rollout policy на одному normalized provider-edge snapshot без
scope-effective substitution або global зміни `DiagnosticReport.ok`.

## Попередники

- [TASK-0106](../TASK-07.13-0106-stage-18-extreme-agent-complexity-lifetime-metadata-provider-edge-foundation/task.md)
  має бути `done`; його final normalized metadata/edge contract є implementation input.

## Вимоги

- Перевіряти metadata structure, target existence, cardinality і deferred handle/target contract.
- Реалізувати approved TASK-0097 lifetime/severity matrix і evidence classes.
- Агрегувати provider та graph coverage без трактування unknown як unsafe.
- Додати `off | report | enforce` policy до container/composer creation options.
- Зберегти stable diagnostic severity незалежно від policy.
- Відокремити lifetime operation `blocked` від чинного global `DiagnosticReport.ok`.
- У `report` не блокувати capture/coverage findings; в `enforce` блокувати proven unsafe.
- Блокувати structurally invalid explicit metadata у `off`, `report` і `enforce`.
- Не виконувати user factories під час validation.
- Санітизувати private identities, details, message і cause.

## Обсяг

- Static declaration/target/cardinality/lifetime validation і coverage aggregation.
- Container/composer rollout options, validation reports і blocking decision.
- Typed diagnostics, public additive exports, `.ok` consumer inventory і regression tests.
- Post-setup provider validation state для composed runtime inspection integration.

## Поза обсягом

- Child-scope effective substitution або scope creation validation.
- Provider inspection graph, graph export v2, DSL/testing helpers/docs.
- Default `report`/`enforce`, global `DiagnosticReport.ok` change, version/publish work.

## Критерії приймання

- [ ] TASK-0106 normalized snapshot є єдиним input validator без duplicate edge model.
- [ ] Metadata invalidity, missing target, cardinality і deferred contract мають typed errors.
- [ ] Кожен TASK-0097 matrix row та evidence class покрито behavioral tests.
- [ ] Unknown/incomplete coverage ніколи не класифікується proven unsafe.
- [ ] Default `off` не додає diagnostics або behavior changes existing metadata-free apps.
- [ ] Unsafe severity лишається `error` у `report` і `enforce`; policy змінює лише blocking.
- [ ] `report` не блокує capture/coverage, а `enforce` блокує proven unsafe capture.
- [ ] Invalid explicit metadata блокує `off`, `report`, `enforce` з fixture на кожний mode.
- [ ] Existing `DiagnosticReport.ok` semantics/consumers не змінені та мають regression gates.
- [ ] Static validation і report inspection не виконують user factories.
- [ ] Private sentinel відсутній у message/details/cause; full quality gates passed.
- [ ] Scope/export/DSL/testing/docs не реалізовані; independent audit passed.

## Пов'язана пам'ять

- [Approved TASK-0097](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/task.md)
- [TASK-0097 result](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RUN-001/result.md)
- [TASK-0097 design report](../../../reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md)
- [Approved TASK-0099 planning](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md)
- [TASK-0099 result](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/result.md)
- [TASK-0099 planning report](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)
- [Predecessor TASK-0106](../TASK-07.13-0106-stage-18-extreme-agent-complexity-lifetime-metadata-provider-edge-foundation/task.md)

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Static validation/coverage/diagnostics.

## Дослідження

Не очікується; formal research створюється лише за виявленого design blocker.

## Фіксації

Не очікуються; canonical changes потребують окремого approved `FIX-*`.

## Запити на рішення

Немає; rollout і severity/blocking contract approved planning report визначає exact.

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

