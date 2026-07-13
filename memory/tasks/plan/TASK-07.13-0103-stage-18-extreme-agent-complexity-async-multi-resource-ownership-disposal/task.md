# TASK-07.13-0103: [EXTREME AGENT COMPLEXITY] Stage 18 async multi resource ownership and disposal

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
Blockers: TASK-0102 must be done
Blocked Phase: activation
Pending Decisions: cleanup secondary-error representation if existing typed error contract is insufficient
Next Action: Активувати лише після human-approved completion TASK-0102.

## Мета

Додати async resource contributions до multi collections із per-provider runtime/scope
ownership, exactly-once acquisition/disposal і визначеною поведінкою для eager/lazy,
partial failure, pending resolution та cleanup failure.

## Попередники

- [TASK-0102](../TASK-07.13-0102-stage-18-extreme-agent-complexity-async-multi-composer-inspection-integration/task.md)
  має бути `done` після human review; його composed surfaces, ordering, safe identity та
  declarative inspection є обов'язковим implementation input.

## Вимоги

- Додати async resource contributions до core, module setup і composer multi object API
  з parity approved async factory registration/access surfaces.
- Singleton resource має належати runtime; scoped resource — effective resolving scope;
  transient async multi resource має бути відхилений typed validation.
- Підтримати eager singleton і lazy singleton/scoped resource initialization без
  collection-level owner, cache, promise або disposer.
- Після lazy partial failure зберігати успішні resources у cache/ledger їх owner для reuse
  і подальшого owner-led disposal.
- Під час failed eager `freeze()` очистити всі unpublished candidate runtime resources,
  включно з успішними multi contributions, без публікації runtime.
- Dispose-ити у reverse actual owner-ledger acquisition order, не в registration,
  completion чи collection-call order.
- Визначити dispose-during-pending: owner чекає/координує pending acquisition і не залишає
  late unowned resource після завершення disposal.
- Concurrent collection/direct resolution має reuse-нути per-provider in-flight state та
  зареєструвати/dispose-ити resource exactly once.
- Додати derived ownership edges до єдиного shared provider-edge snapshot без окремої
  resource ownership graph model.
- Зберегти sequential fail-fast collection resolution і no-partial-array semantics.
- Визначити typed primary failure та cleanup failure behavior без втрати safe provider
  identity або витоку private token/cause.
- Додати adversarial lifecycle, concurrency, retry, privacy та disposal tests.

## Обсяг

- Core/module/composer async multi resource registration і resolution object API.
- Singleton runtime owner, scoped effective-scope owner і transient rejection.
- Eager/lazy initialization, failed eager cleanup і lazy partial-failure retention.
- Owner ledger, reverse actual acquisition disposal, pending/disposal coordination.
- Concurrent collection/direct exactly-once semantics, typed cleanup failures і tests.
- Minimal public exports/API contract notes, прямо потрібні resource operation.

## Поза обсягом

- Parallel/configurable collection scheduler, cancellation fan-out або aggregate resolution.
- Rollback arbitrary user factory side effects чи transaction semantics.
- Async scope-local resource factories/contributions.
- `@sagifire/ioc-testing`, DSL і повні docs/examples окрім minimal required notes/tests.
- Широкий redesign single-provider resource semantics без доведеного root-cause blocker.

## Критерії приймання

- [ ] Core, module setup і composer multi object API підтримують async resources через погоджені factory-slice surfaces.
- [ ] Singleton resource owner є runtime, scoped resource owner є effective scope, а transient registration typed-rejected.
- [ ] Eager singleton і lazy singleton/scoped contributions резолвляться sequential fail-fast без collection-owned state.
- [ ] Lazy partial failure не повертає partial array і лишає успішні resources у owner cache/ledger для reuse та disposal.
- [ ] Failed eager freeze не публікує candidate runtime й очищує всі acquired candidate resources exactly once.
- [ ] Runtime/scope disposal використовує reverse actual owner-ledger acquisition order без brittle global registration-order guarantee.
- [ ] Dispose-during-pending не завершується до безпечної координації acquisition та не залишає late unowned resource.
- [ ] Concurrent collection/direct resolution deduplicates singleton/scoped work per provider та реєструє/dispose-ить resource exactly once.
- [ ] Failed provider cache reset/retry і successful cache reuse відповідають existing per-provider lifecycle semantics.
- [ ] Primary resolution/disposal і cleanup failures мають typed readable private-safe attribution без втрати cause boundary.
- [ ] Eager/lazy, partial failure, retry, concurrency, pending disposal, privacy та full quality gates passed.
- [ ] Parallel scheduler, transactional side-effect rollback, async scope-local resources, testing package і DSL не реалізовані; independent audit passed.

## Пов'язана пам'ять

- [Approved TASK-0098](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/task.md)
- [TASK-0098 result](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/RUN-001/result.md)
- [Detailed design report](../../../reports/research/2026-07-12-stage-18-async-multi-provider-semantics-design.md)
- [TASK-0098 FIX-001](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-001.md)
- [TASK-0098 FIX-002](../TASK-07.12-0098-stage-18-async-multi-provider-semantics-design/FIX-002.md)
- [Predecessor TASK-0102](../TASK-07.13-0102-stage-18-extreme-agent-complexity-async-multi-composer-inspection-integration/task.md)
- [Technical architecture](../../../technical/architecture.md)
- [Technical rules](../../../technical/rules.md)
- [Technical testing](../../../technical/testing.md)
- [Approved lifetime implementation report](../../../reports/research/2026-07-13-stage-18-lifetime-validation-implementation-planning.md)

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Async multi resource ownership and disposal.

## Дослідження

- Не очікуються; cleanup secondary-error formal design створюється лише якщо current typed
  error contract не дозволяє deterministic implementation без semantic invention.

## Фіксації

- Не очікуються; canonical зміни потребують окремого approved `FIX-*`.

## Запити на рішення

- Якщо existing cleanup error model не представляє primary та secondary failures без
  втрати cause, implementation зупиняється на explicit design decision, а не приховує failure.

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
