# Контекст виконання: RUN-001

Related Task: [TASK-07.15-0113](../task.md)
Prepared: 2026-07-15
Prepared By: Task Package Creation Agent
Previous Run: none

## Agent Role

Graph Schema Stabilization Agent.

## Мета run

Реалізувати approved graph schema evolution policy у public docs, types і tests, зберігши
v1 default/byte contract, v2 opt-in contract та pre-`0.0.3` release boundary.

## Ефективні вимоги

- Не активувати run, доки TASK-0110 і TASK-0111 не мають статус `done`, а approved FIX-001
  TASK-0111 не має статус `applied`.
- Відобразити policy в public docs/types/tests без implementation schema v3.
- Додати per-supported-version canonical golden, unknown-envelope і default regressions.
- Документувати compatibility/removal/default-promotion/migration checklist.
- Перевірити v1/v2 serializer, DOT, Mermaid, privacy і determinism.
- Не виконувати package version, changelog, publish або release workflow.

## Попередники

- [TASK-0110 audit](../../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/task.md)
  — має бути `done` до activation.
- [TASK-0111 decision research](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
  — має бути `done`, а його approved `FIX-001` — `applied`, до activation.

## Обсяг

- `packages/ioc/src/graph-export.ts` і public export types/options лише в межах policy realization.
- `packages/ioc/test/graph-export.test.ts` та
  `packages/ioc/test/scope-inspection-graph-v2.test.ts` для versioned regression gates.
- `docs/graph-export.md` для public lifecycle, compatibility і migration checklist.
- Focused/full verification та independent audit.

## Поза обсягом

- Schema v3, v2 default promotion, provider semantics.
- Package version bump, changelog release entry, publish/release workflow.
- Whole-portfolio або whole-`0.0.3` release-ready claim.

## Критерії приймання

- [ ] Усі 12 task acceptance criteria мають one-to-one trace у result.
- [ ] V1 default і byte contract та v2 opt-in behavior збережені.
- [ ] Per-version golden, unknown-envelope, default, renderer, privacy і determinism gates пройдені.
- [ ] Compatibility/removal/default-promotion/migration checklist є public і actionable.
- [ ] Focused/full quality та public export/type smoke gates пройдені.
- [ ] Independent audit findings закриті до review-ready.

## Обов'язковий контекст задачі

- [TASK-0111 task](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
- [TASK-0111 result](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RUN-001/result.md)
- [TASK-0111 RSCH-001](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RSCH-001.md)
- [TASK-0111 detailed report](../../../../reports/research/2026-07-15-stage-18-architecture-pressure-residual-risks-decision-research.md)
- [TASK-0111 FIX-001](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/FIX-001.md)
- [TASK-0110 task](../../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/task.md)
- [TASK-0110 result](../../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/RUN-001/result.md)
- [TASK-0110 formal audit](../../../../reports/audits/2026-07-15-stage-18-lifetime-shared-foundation-audit-handoff.md)
- [Graph export source](../../../../../packages/ioc/src/graph-export.ts)
- [Core public exports](../../../../../packages/ioc/src/index.ts)
- [Graph export tests](../../../../../packages/ioc/test/graph-export.test.ts)
- [Scope inspection graph v2 tests](../../../../../packages/ioc/test/scope-inspection-graph-v2.test.ts)
- [Graph export docs](../../../../../docs/graph-export.md)
- [Technical architecture](../../../../technical/architecture.md)
- [Technical rules](../../../../technical/rules.md)
- [Testing strategy](../../../../technical/testing.md)
- [Definition of Done](../../../../technical/definition-of-done.md)

## Обмеження

- Published v1/v2 schema contracts не мутуються несумісно.
- Unknown envelopes не reinterpret-яться як default або supported version.
- Default promotion і old-version removal потребують окремого human-reviewed decision.
- Runtime privacy/determinism мають однакові gates для кожної supported version.
- TASK-0113 є blocker release handoff, але сама не авторизує жодної release action.

## Перевірки

- Focused graph-export і scope-inspection v2 tests, включно з JSON/DOT/Mermaid matrices.
- Canonical golden/byte/order/default/unknown-envelope/privacy/determinism regressions.
- Build, full tests, typecheck, lint, format і релевантний public export/type consumer smoke.
- Independent audit всього run та artifact scope перед human review.

## Ризики

- Тестова fixture може зафіксувати випадковий output замість canonical semantic contract.
- Shared serializer/renderer dispatch може непомітно reinterpret unknown envelope або змінити v1 bytes.
- Type widening може зробити unknown version compile-time допустимою всупереч runtime rejection.
- Checklist може змішати schema version із package version або неявно дозволити default promotion.
- Maintenance cost зростає з кожною supported version; removal лишається окремим breaking decision.

## Припущення

- TASK-0111 завершує application exact approved FIX-001 без зміни reviewed decision body.
- Current v1/v2 implementation є baseline, підтверджений TASK-0110 audit.
- Policy realization не потребує нової schema version або зміни provider semantics.

## Зміни від попереднього run

Не застосовується для RUN-001.
