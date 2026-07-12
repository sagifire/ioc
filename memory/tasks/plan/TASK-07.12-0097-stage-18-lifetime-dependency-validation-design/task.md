# TASK-07.12-0097: Stage 18 lifetime dependency validation design

Task Status: done
Type: design
Created: 2026-07-12
Owner Role: Design Agent
Current Run: RUN-001

## Поточний стан

Run Status: completed
Progress: Task approved; FIX-001..002 applied and upward consistency verified.
Acceptance: 12/12
Blockers: none
Blocked Phase: n/a
Pending Decisions: none
Next Action: Optional human decision to create bounded phased implementation tasks.

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

- [x] Explicit object-configuration metadata має порівняні candidate options.
- [x] Direct instance, deferred factory/handle та ownership edges визначені однозначно.
- [x] Lifetime/severity matrix охоплює всі заявлені lifetime та scope випадки.
- [x] Proven unsafe capture відділено від unknown/incomplete coverage.
- [x] Private providers отримують diagnostic-safe identity без витоку private IDs.
- [x] Static/runtime coverage boundary визначена без source parsing або factory execution.
- [x] Diagnostics узгоджені з inspection і graph/export boundaries.
- [x] Compatibility, testing, migration, adoption і architecture pressure оцінено.
- [x] Релевантні lifetime-питання approved `FIX-003` закриті decision-ready відповідями.
- [x] Створено `RSCH-001`, detailed українськомовний report і exact `FIX-*` proposals за потреби.
- [x] Виконано self-review, language/upward-consistency gates та independent subagent audit.
- [x] Реалізацію й public API changes не розпочато; результат передано в human review.

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

- [RUN-001](RUN-001/index.md) - completed - Design approved and FIX-001..002 applied.

## Дослідження

- [RSCH-001](RSCH-001.md) - completed; disposition `final-result`.

## Фіксації

- [FIX-001](FIX-001.md) - applied - technical design.
- [FIX-002](FIX-002.md) - applied - design gate disposition.

## Запити на рішення

- Task: `approve | request changes | cancel`.
- FIX-001: `approve | reject`.
- FIX-002: `approve | reject`.

## Human Review

Status: approved
Requested: 2026-07-12
Reviewed: approved 2026-07-12
Approval Source: user message: "task approve, FIX-001 approve, FIX-002 approve"
Approved Fixations: FIX-001, FIX-002

## Фінальний результат

Completed: 2026-07-12
Final Run: RUN-001
Summary: Explicit dependency, severity, coverage, privacy and graph design approved; FIX-001..002 applied.
Residual Risks: Metadata може drift від factory body; exact public names та enforcement default лишаються implementation decisions.
