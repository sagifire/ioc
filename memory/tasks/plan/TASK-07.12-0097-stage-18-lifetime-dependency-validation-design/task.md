# TASK-07.12-0097: Stage 18 lifetime dependency validation design

Task Status: backlog
Type: design
Created: 2026-07-12
Owner Role: Design Agent
Current Run: RUN-001

## Поточний стан

Run Status: prepared
Progress: Design task package prepared.
Acceptance: 0/12
Blockers: none
Blocked Phase: n/a
Pending Decisions: lifetime dependency validation semantics
Next Action: Активувати RUN-001 і провести formal design research.

## Мета

Сформувати decision-ready дизайн lifetime dependency validation, який спирається на явну
metadata object-configuration API, відрізняє доведене небезпечне захоплення instance від
deferred та ownership edges і закриває відповідні питання approved `FIX-003` до створення
будь-яких implementation-задач.

## Вимоги

- Визначити варіанти explicit provider dependency metadata в object-configuration API без
  decorators, source parsing або виконання user factories.
- Розрізнити direct instance, deferred factory/handle та ownership edges.
- Побудувати lifetime/severity matrix щонайменше для singleton, scoped, ordinary transient,
  managed resource і child-scope capture.
- Визначити safe identity для private providers без витоку private token IDs.
- Розмежувати static та runtime coverage, proven unsafe capture і unknown/incomplete metadata.
- Узгодити diagnostics з inspection та graph/export projection без створення другої graph model.
- Порівняти candidate API options і надати аргументовану decision-ready рекомендацію.
- Підготувати exact `FIX-*` proposals для схвалених canonical змін; не застосовувати їх.
- Під час active run створити task-local `RSCH-001` і detailed report
  `memory/reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md`.
- Перед review виконати self-review і незалежний subagent audit.

## Обсяг

- Provider dependency metadata лише для explicit object configuration.
- Edge taxonomy, lifetime/severity matrix, coverage contract і diagnostic UX.
- Private-provider-safe identity та взаємодія з normalized inspection graph/export.
- Candidate API/design options, compatibility, adoption, testing і migration implications.
- Закриття релевантних lifetime-питань approved `FIX-003` та follow-up proposals після design decision.

## Поза обсягом

- Реалізація, зміни runtime/public API/package exports або version bump.
- Decorators, `reflect-metadata`, source parsing, factory execution чи runtime tracing як
  доказ static dependency edge.
- Створення implementation-задач до human approval design recommendation і відповідних `FIX-*`.
- Async multi-provider semantics та graph export implementation.

## Критерії приймання

- [ ] Explicit object-configuration metadata має порівняні candidate options.
- [ ] Direct instance, deferred factory/handle та ownership edges визначені однозначно.
- [ ] Lifetime/severity matrix охоплює всі заявлені lifetime та scope випадки.
- [ ] Proven unsafe capture відділено від unknown/incomplete coverage.
- [ ] Private providers отримують diagnostic-safe identity без витоку private IDs.
- [ ] Static/runtime coverage boundary визначена без source parsing або factory execution.
- [ ] Diagnostics узгоджені з inspection і graph/export boundaries.
- [ ] Compatibility, testing, migration, adoption і architecture pressure оцінено.
- [ ] Релевантні lifetime-питання approved `FIX-003` закриті decision-ready відповідями.
- [ ] Створено `RSCH-001`, detailed українськомовний report і exact `FIX-*` proposals за потреби.
- [ ] Виконано self-review, language/upward-consistency gates та independent subagent audit.
- [ ] Реалізацію й public API changes не розпочато; результат передано в human review.

## Пов'язана пам'ять

- `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/task.md`
- `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/FIX-002.md`
- `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/FIX-003.md`
- `memory/reports/research/2026-07-12-stage-18-0-0-3-feature-portfolio.md`
- `memory/domain/open-questions.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/specification-trace.md`

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Lifetime dependency validation formal design.

## Дослідження

- Очікується `RSCH-001` під час active RUN-001.

## Фіксації

- Очікуються лише за результатами design; застосування потребує окремого human approval.

## Запити на рішення

- Немає до завершення RUN-001.

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

