# TASK-07.13-0109: [EXTREME AGENT COMPLEXITY] Stage 18 lifetime testing, DSL, docs and adoption

Task Status: backlog
Type: implementation
Created: 2026-07-13
Agent Complexity: extreme
Owner Role: Implementation Agent
Current Run: RUN-001

## Поточний стан

Run Status: prepared
Progress: Task package prepared; predecessors pending.
Acceptance: 0/12
Blockers: TASK-0104 and TASK-0108 must be done
Blocked Phase: activation
Pending Decisions: none
Next Action: Активувати лише після human-approved completion TASK-0104 і TASK-0108.

## Мета

Провести stabilized lifetime validation semantics у `@sagifire/ioc-testing`, DSL,
documentation, examples і adoption workflow без перевизначення production object API,
default enforcement або graph schema defaults.

## Попередники

- [TASK-0104](../TASK-07.13-0104-stage-18-extreme-agent-complexity-async-multi-testing-dsl-docs/task.md)
  має бути `done`.
- [TASK-0108](../TASK-07.13-0108-stage-18-extreme-agent-complexity-lifetime-scope-inspection-graph-export-v2/task.md)
  має бути `done`.

## Вимоги

- Додати public-API assertions/fixtures provider edges, coverage, diagnostics і scope inspection.
- Проводити dependency options через overrides/fake modules без mutation frozen runtime.
- Не читати private internals із testing helpers.
- Додати one-to-one DSL projection на stabilized object options.
- Зберегти object API fully usable без DSL і hidden dependency resolution.
- Документувати lifetime matrix, deferred handles, ownership, coverage і privacy.
- Документувати graph v2 opt-in та v1 compatibility.
- Дати migration/adoption workflow: opt-in report, coverage review, correction, enforce.
- Не стверджувати, що declarations доводять factory body honesty.
- Перевірити exports, type/package/example consumer smoke і full quality gates.

## Обсяг

- `@sagifire/ioc-testing` assertions, overrides, fake modules and fixtures.
- DSL metadata/options projection без alternative semantics.
- Core/testing docs, migration, examples, package exports і smoke coverage.
- Adoption guidance та staged enforcement documentation.

## Поза обсягом

- New production semantics, provider graph internals або frozen runtime mutation.
- Default `report`/`enforce`, default schema v2, strict coverage gate.
- Version bump, publish, release workflow або whole-`0.0.3` readiness claim.

## Критерії приймання

- [ ] TASK-0104 і TASK-0108 final contracts traced до result.
- [ ] Provider-edge/coverage/diagnostic/scope assertions use public APIs only.
- [ ] Overrides/fake modules preserve metadata without frozen production mutation.
- [ ] Helpers preserve production cardinality, identity, lifetime and scope semantics.
- [ ] DSL maps one-to-one to every supported object dependency option.
- [ ] Object API remains fully usable without DSL and DSL has no hidden resolution.
- [ ] Docs include matrix, deferred handles, derived ownership, coverage and privacy.
- [ ] Docs explain v1 freeze, opt-in v2 and deterministic safe projection.
- [ ] Migration begins with report/coverage review before explicit enforce adoption.
- [ ] Docs state declaration coverage is not proof of factory implementation behavior.
- [ ] Export/type/package/example/full quality gates and privacy fixtures pass.
- [ ] Production/default/release semantics unchanged; independent audit passed.

## Пов'язана пам'ять

- [Approved TASK-0097](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/task.md)
- [TASK-0097 result](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RUN-001/result.md)
- [TASK-0097 design report](../../../reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md)
- [Approved TASK-0099 planning](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md)
- [TASK-0099 result](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/result.md)
- [TASK-0099 planning report](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)
- [Predecessor TASK-0104](../TASK-07.13-0104-stage-18-extreme-agent-complexity-async-multi-testing-dsl-docs/task.md)
- [Predecessor TASK-0108](../TASK-07.13-0108-stage-18-extreme-agent-complexity-lifetime-scope-inspection-graph-export-v2/task.md)

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Testing/DSL/docs/adoption.

## Дослідження

Не очікується; supporting layers не визначають production semantics.

## Фіксації

Canonical memory changes потребують окремого approved `FIX-*`, якщо виявляться потрібними.

## Запити на рішення

Немає; default enforcement/schema/version changes не входять у task.

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

