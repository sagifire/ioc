# Контекст виконання: RUN-001

Related Task: [TASK-07.13-0107](../task.md)
Prepared: 2026-07-13
Prepared By: Task Package Creation Agent
Previous Run: none

## Мета run

Реалізувати static validation/coverage/diagnostics на completed TASK-0106 snapshot зі
stable severity та окремим blocking contract.

## Ефективні вимоги

- Реалізувати metadata gates, approved matrix, evidence і coverage semantics.
- Додати additive `off | report | enforce` без global `.ok` semantic change.
- Відрізнити non-blocking report findings від always-blocking invalid metadata.
- Зберегти no-factory-execution і private-safe diagnostics.

## Попередники

- [TASK-0106](../../TASK-07.13-0106-stage-18-extreme-agent-complexity-lifetime-metadata-provider-edge-foundation/task.md)
  має бути `done`; final result є implementation input.

## Обсяг

- `container.ts`, `composer.ts`, `diagnostics.ts`, `index.ts`, relevant focused/type tests.
- Validation reports, coverage aggregation, creation options і consumer regression inventory.

## Поза обсягом

- Scope-effective validation, graph export v2, DSL/testing/docs і default enforcement.

## Критерії приймання

- [ ] Усі 12 task acceptance criteria traced у result.
- [ ] Matrix/coverage/severity/blocking behavior доведено focused fixtures.
- [ ] Invalid metadata має окремий fixture для `off`, `report`, `enforce`.
- [ ] Independent audit findings закриті до review-ready.

## Обов'язковий контекст задачі

- `memory/tasks/plan/TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/task.md`
- `memory/tasks/plan/TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RUN-001/result.md`
- `memory/reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md`
- `memory/tasks/plan/TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md`
- `memory/tasks/plan/TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/result.md`
- `memory/reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md`
- `memory/tasks/plan/TASK-07.13-0106-stage-18-extreme-agent-complexity-lifetime-metadata-provider-edge-foundation/task.md`
- `memory/tasks/plan/TASK-07.13-0106-stage-18-extreme-agent-complexity-lifetime-metadata-provider-edge-foundation/RUN-001/result.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Вхідні файли та модулі

- Validator insertion points у container freeze/composer post-setup, diagnostics report
  contracts, creation options, public exports і relevant tests.

## Обмеження

- Severity не залежить від mode; policy керує operation blocking окремо.
- Invalid explicit metadata завжди блокує; unknown metadata ніколи не є unsafe.
- User factories/source parsing/runtime tracing заборонені як validation evidence.

## Перевірки

- Compile/type fixtures; full matrix, per-mode invalid metadata, `.ok` consumer regression.
- Focused/full tests, build, typecheck, lint, format, privacy і independent audit.

## Ризики

- Existing composer може приховано блокувати report через legacy `.ok` consumer.
- Policy-dependent severity створить snapshot drift, якщо separation порушено.
- Coverage summary може перетворитися на per-provider warning spam.

## Припущення

- TASK-0106 snapshot стабільний, immutable і достатній для static evaluation.
- Existing diagnostics type може бути additive extended без global semantic change.

## Зміни від попереднього run

Не застосовується для RUN-001.
