# TASK-07.13-0106: [EXTREME AGENT COMPLEXITY] Stage 18 lifetime metadata and provider-edge foundation

Task Status: done
Type: implementation
Created: 2026-07-13
Agent Complexity: extreme
Owner Role: Implementation Agent
Current Run: RUN-001

## Поточний стан

Run Status: completed
Progress: Human review approved; implementation finalized without fixations.
Acceptance: 12/12
Blockers: none
Blocked Phase: n/a
Pending Decisions: none
Next Action: Proceed to approved coordinated successor `TASK-07.13-0107` only by explicit command.

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

- [x] TASK-0100 final identity contract traced до implementation result.
- [x] Один canonical provider key використовується provider records, lifetime edges і async frames.
- [x] Private collection coordinate є окремою mapped coordinate, а не equality identity.
- [x] Interleaved private single/two-multi-collection fixture не має collisions або raw ID leaks.
- [x] Typed dependency options мають parity у core, module setup і composer object API.
- [x] Declarations атомарно зберігаються та клонуються разом із provider registration.
- [x] Single/multi/private/resource fixtures утворюють deterministic normalized snapshot.
- [x] Empty multi зберігає selector/coverage та створює нуль concrete edges.
- [x] Ownership edges derivable з owner facts і не декларуються consumer ownership transfer.
- [x] Normalization/freeze/inspection preparation не виконують user factories.
- [x] Existing one-argument registrations, build, tests, typecheck, lint і format проходять.
- [x] Validation, scope/export, DSL/testing/docs не реалізовані; independent audit passed.

## Пов'язана пам'ять

- [Approved TASK-0097](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/task.md)
- [TASK-0097 result](../TASK-07.12-0097-stage-18-lifetime-dependency-validation-design/RUN-001/result.md)
- [TASK-0097 design report](../../../reports/research/2026-07-12-stage-18-lifetime-dependency-validation-design.md)
- [Approved TASK-0099 planning](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md)
- [TASK-0099 result](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/result.md)
- [TASK-0099 planning report](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)
- [Predecessor TASK-0100](../TASK-07.13-0100-stage-18-extreme-agent-complexity-async-multi-identity-cycle-foundation/task.md)

## Прогони

- [RUN-001](RUN-001/index.md) - completed - Metadata/provider-edge foundation approved.

## Дослідження

Не очікується; formal research створюється лише за виявленого design blocker.

## Фіксації

Не очікуються; canonical changes потребують окремого approved `FIX-*`.

## Запити на рішення

Немає; task реалізує approved contracts після predecessor gate.

## Human Review

Status: approved
Requested: 2026-07-13
Reviewed: approved 2026-07-13
Approval Source: user message: "approve"

## Фінальний результат

Completed: 2026-07-13
Final Run: RUN-001
Summary: Shared lifetime metadata, canonical provider identity and normalized provider-edge foundation implemented and approved.
Residual Risks: Successor tasks must extend the same snapshot without parallel normalization; validation and scope-effective semantics remain intentionally unimplemented.
