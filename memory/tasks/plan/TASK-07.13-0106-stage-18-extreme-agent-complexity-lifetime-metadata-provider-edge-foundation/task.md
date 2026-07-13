# TASK-07.13-0106: [EXTREME AGENT COMPLEXITY] Stage 18 lifetime metadata and provider-edge foundation

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
Blockers: TASK-0100 must be done
Blocked Phase: activation
Pending Decisions: none
Next Action: Активувати лише після human-approved completion TASK-0100.

## Мета

Реалізувати explicit dependency metadata, один canonical provider key і один immutable
normalized provider-edge snapshot на shared identity foundation без validation policy,
public inspection/export або alternative graph model.

## Попередники

- [TASK-0100](../TASK-07.13-0100-stage-18-extreme-agent-complexity-async-multi-identity-cycle-foundation/task.md)
  має бути `done`; його final result і reconciled identity/cycle contract є обов'язковим
  implementation input.

## Вимоги

- Повторно використати canonical public/private provider keys із TASK-0100.
- Лишити private collection cycle coordinate окремим типом із one-to-one mapping на
  canonical private provider key.
- Додати typed dependency options до explicit core/composer/module factory і resource API.
- Зберігати immutable declarations атомарно в provider record і clone/freeze paths.
- Нормалізувати provider nodes, selectors, concrete single/multi edges і coverage snapshot.
- Виводити ownership edges із managed-resource registration/owner facts.
- Передавати private-safe identity через composer registration bridge без module knowledge у container.
- Не виконувати user factories під час metadata normalization.
- Зберегти чинні one-argument registration calls і runtime behavior.
- Не створювати composer-local identity, side-map або parallel provider graph.

## Обсяг

- Core provider records, registration/clone/freeze paths і dependency option types.
- Module/setup/private registration bridge та composed context wrappers у `composer.ts`.
- Deterministic single/multi/private/resource normalization, selectors, edges і coverage.
- Public additive type exports, package export boundary, focused/type/privacy tests.

## Поза обсягом

- Severity evaluation, blocking validation або rollout policy.
- Scope-effective substitution, public inspection або graph export.
- DSL, `@sagifire/ioc-testing`, docs/examples, version або publish changes.
- Async multi factory/resource implementation, крім reuse completed identity contract.

## Критерії приймання

- [ ] TASK-0100 final identity contract traced до implementation result.
- [ ] Один canonical provider key використовується provider records, lifetime edges і async frames.
- [ ] Private collection coordinate є окремою mapped coordinate, а не equality identity.
- [ ] Interleaved private single/two-multi-collection fixture не має collisions або raw ID leaks.
- [ ] Typed dependency options мають parity у core, module setup і composer object API.
- [ ] Declarations атомарно зберігаються та клонуються разом із provider registration.
- [ ] Single/multi/private/resource fixtures утворюють deterministic normalized snapshot.
- [ ] Empty multi зберігає selector/coverage та створює нуль concrete edges.
- [ ] Ownership edges derivable з owner facts і не декларуються consumer ownership transfer.
- [ ] Normalization/freeze/inspection preparation не виконують user factories.
- [ ] Existing one-argument registrations, build, tests, typecheck, lint і format проходять.
- [ ] Validation, scope/export, DSL/testing/docs не реалізовані; independent audit passed.

## Пов'язана пам'ять

- [Approved TASK-0097](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/task.md)
- [TASK-0097 result](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RUN-001/result.md)
- [TASK-0097 design report](../../../reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md)
- [Approved TASK-0099 planning](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md)
- [TASK-0099 result](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/result.md)
- [TASK-0099 planning report](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)
- [Predecessor TASK-0100](../TASK-07.13-0100-stage-18-extreme-agent-complexity-async-multi-identity-cycle-foundation/task.md)

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Metadata/provider-edge foundation.

## Дослідження

Не очікується; formal research створюється лише за виявленого design blocker.

## Фіксації

Не очікуються; canonical changes потребують окремого approved `FIX-*`.

## Запити на рішення

Немає; task реалізує approved contracts після predecessor gate.

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

