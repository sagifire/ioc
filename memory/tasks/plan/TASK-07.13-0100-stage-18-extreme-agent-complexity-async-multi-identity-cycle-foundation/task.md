# TASK-07.13-0100: [EXTREME AGENT COMPLEXITY] Stage 18 async multi identity and cycle foundation

Task Status: backlog
Type: implementation
Created: 2026-07-13
Agent Complexity: extreme
Owner Role: Implementation Agent
Current Run: RUN-001

## Поточний стан

Run Status: prepared
Progress: Task package reconciled with approved lifetime planning; ready for explicit activation.
Acceptance: 0/12
Blockers: none
Blocked Phase: activation
Pending Decisions: none
Next Action: Активувати RUN-001 окремою explicit командою як першу задачу coordinated chain.

## Мета

Створити internal/shared foundation concrete contribution identity і cycle frames для
майбутніх async multi-provider slices без другого identity/graph model та без зміни
чинного sync/public async multi API.

## Попередники та activation gate

- Design predecessor: [TASK-07.12-0098](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/task.md) має статус `done`.
- Approved result
  [TASK-07.13-0099](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md)
  і human-reviewed shared-foundation reconciliation є обов'язковим implementation contract.
- Async multi identity є shared foundation для єдиної normalized lifetime provider
  identity/edge model і не створює parallel model.

## Вимоги

- Додати canonical public key `tokenId + per-token registrationIndex` і canonical private
  key `moduleId + module-wide registrationIndex` для single та multi registrations.
- Тримати `privateCollectionOrdinal + contributionIndex` окремою async cycle coordinate,
  детерміновано mapped one-to-one до canonical private provider key.
- Розділити active `collection` і concrete `provider` resolution frames.
- Відхиляти re-entrant resolution тієї самої collection до запуску nested siblings.
- Не трактувати ordinary siblings одного token як cycle.
- Не використовувати collection coordinate як provider equality identity.
- Не допускати raw private token ID у outward message, details або cause.
- Узгодити identity з TASK-0099/lifetime normalized provider foundation.
- Зберегти чинні sync single/multi resolution, cache і cycle semantics.
- Додати typed diagnostic/cycle tests і private-collection collision fixture.
- Не додавати public async multi registration або collection accessor у цьому slice.

## Обсяг

- Internal provider/contribution records та stable indexes.
- Collection/provider resolution frames і sanitized cycle paths.
- Composer-to-container internal safe identity bridge лише настільки, наскільки потрібно
  для foundation без public async multi surface.
- Focused regression, collision, privacy і cycle tests.

## Поза обсягом

- Public async multi registration/access API, async multi factory execution або eager multi init.
- Resource ownership/disposal, composer public integration, DSL, testing helpers чи docs.
- Друга provider identity, dependency-edge або inspection graph model.
- Зміна approved TASK-0098 semantics чи застосування нових canonical FIX changes.

## Критерії приймання

- [ ] Activation gate задокументовано доказом approved TASK-0099 result або explicit reconciliation decision.
- [ ] Concrete contribution identity стабільна й містить per-token contribution index.
- [ ] Private identity використовує stable private collection ordinal і не колізиться між двома private collections module.
- [ ] Cycle state має окремі collection/provider frames.
- [ ] Re-entrant self-collection fail-ить до виконання nested sibling.
- [ ] Ordinary siblings одного token резолвляться без false cycle.
- [ ] Public/private cycle diagnostics typed, readable і не розкривають raw private token/cause.
- [ ] Identity foundation reconciled із lifetime normalized provider-edge foundation без parallel model.
- [ ] Existing sync single/multi resolution, ordering, caches і cycle tests не регресували.
- [ ] Public async multi registration/access, resource і composer feature surfaces не додано.
- [ ] Relevant build, test, typecheck, lint і format checks passed.
- [ ] Self-review та independent subagent audit закрили architecture/privacy findings до human review.

## Пов'язана пам'ять

- [Approved TASK-0098](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/task.md)
- [TASK-0098 result](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/RUN-001/result.md)
- [Detailed design report](../../../reports/research/2026-07-12-stage-18-async-multi-provider-semantics-design.md)
- [TASK-0098 FIX-001](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-001.md)
- [TASK-0098 FIX-002](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-002.md)
- [TASK-0099 planning gate](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/task.md)
- [TASK-0099 result](../TASK-07.13-0099-stage-18-lifetime-validation-implementation-planning/RUN-001/result.md)
- [Approved lifetime implementation report](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Internal identity/cycle foundation.

## Дослідження

- Не очікується; task реалізує approved design після activation reconciliation gate.

## Фіксації

- Не очікуються; canonical changes потребують окремого approved `FIX-*`.

## Запити на рішення

- Activation reconciliation decision потрібен, якщо approved TASK-0099 result ще недоступний.

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
