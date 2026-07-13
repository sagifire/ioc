# Контекст виконання: RUN-001

Related Task: [TASK-07.13-0108](../task.md)
Prepared: 2026-07-13
Prepared By: Task Package Creation Agent
Previous Run: none

## Мета run

Реалізувати scope-effective validation, safe inspection і opt-in provider graph v2 після
completed async factory/resource ownership chain.

## Ефективні вимоги

- Incorporate TASK-0101..0103 final contracts before code changes.
- Validate effective scopes before publication/execution with domain-aware substitution.
- Preserve singleton base targets, scoped cache isolation and private-safe inspection.
- Keep v1 frozen; add canonical JSON v2 and pure DOT/Mermaid parity.

## Попередники

- [TASK-0103](../../TASK-07.13-0103-stage-18-extreme-agent-complexity-async-multi-resource-ownership-disposal/task.md)
  має бути `done`.
- TASK-0101..0103 final results є mandatory implementation inputs.

## Обсяг

- `context.ts`, `container.ts`, composed wrappers in `composer.ts`, `graph-export.ts`,
  exports/manifests, scope/composer/export/type tests.

## Поза обсягом

- Testing package, DSL, docs/adoption, default v2/enforcement і release actions.

## Критерії приймання

- [ ] Усі 12 task acceptance criteria traced у result.
- [ ] Scope timing, singleton state parity and cache isolation fixtures passed.
- [ ] v1 byte stability and deterministic/private-safe v2 parity passed.
- [ ] Independent audit findings закриті до review-ready.

## Обов'язковий контекст задачі

- `memory/tasks/plan/TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/task.md`
- `memory/tasks/plan/TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RUN-001/result.md`
- `memory/reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md`
- `memory/tasks/plan/TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md`
- `memory/tasks/plan/TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/result.md`
- `memory/reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md`
- `memory/tasks/plan/TASK-07.13-0101-stage-18-extreme-agent-complexity-async-multi-core-factory-resolution/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.13-0102-stage-18-extreme-agent-complexity-async-multi-composer-inspection-integration/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.13-0103-stage-18-extreme-agent-complexity-async-multi-resource-ownership-disposal/RUN-001/result.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Вхідні файли та модулі

- Scope normalization/linking/cache paths, runtime/composer inspection, graph export schema,
  renderers, package exports і relevant tests.

## Обмеження

- `createScope()` synchronous; validation before child publication and factory execution.
- Singleton base-target rule independent of readiness; no hidden current scope.
- v1 has no provider nodes/edges/coverage; inspection excludes mutable/private state.

## Перевірки

- Scope inherited/override/cache fixtures; ready/uninitialized singleton parity.
- Golden v1 bytes; canonical v2 JSON and DOT/Mermaid parity/privacy.
- Full build/test/typecheck/lint/format, package/export smoke, independent audit.

## Ризики

- Effective substitution може створити false singleton capture або cache rebinding.
- v2 projection може drift від validator snapshot або leak private identity.
- Async ownership edges можуть не відповідати owner ledger semantics.

## Припущення

- TASK-0101..0103 стабілізували provider kinds, identity, order and ownership.
- Existing v1 fields достатні для allowed TASK-0102 new-input summaries.

## Зміни від попереднього run

Не застосовується для RUN-001.
