# Контекст виконання: RUN-001

Related Task: [TASK-07.15-0112](../task.md)
Prepared: 2026-07-15
Prepared By: Task Package Creation Agent
Previous Run: none

## Agent Role

Architecture Research Agent.

## Activation gate

RUN-001 не можна активувати, доки
[TASK-0111](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
не має статусу `done`. Після активації цей `context.md` стає immutable snapshot.

## Мета run

На основі source, tests, history й approved `APR-002` evidence сформувати decision-ready
рішення `no refactor | staged internal refactor` для великих integration state machines у
`container.ts` і `composer.ts`, з exact preservation чинної поведінки та без production змін.

## Ефективні вимоги

- Побудувати responsibility, state-transition, ownership та invariant maps.
- Виміряти coupling, complexity і change hotspots відтворюваним способом.
- Визначити semantic candidate seams, а не механічні extraction points за line count.
- Зіставити mapped transitions із characterization coverage й зафіксувати precise gaps.
- Порівняти no-refactor, staged internal-refactor і big-bang alternatives.
- Визначити go/no-go gates, sequencing, rollback і preservation matrix.
- Створити `RSCH-001`, detailed report і decision-ready recommendation.
- Підготувати bounded follow-up proposals; actual tasks створювати лише після окремого
  human approval.
- Провести self-review, language/upward-consistency gates та independent subagent audit.

## Обсяг

- `packages/ioc/src/container.ts` і `packages/ioc/src/composer.ts` як primary subjects.
- Shared provider identity, metadata, lifetime validation, graph, scope і resource ownership
  foundations, якщо вони визначають seam boundaries.
- Чинні container/composer/lifetime/async-multi/graph/scope tests як behavioral baseline.
- Reproducible source/history metrics, option analysis і formal research artifacts.

## Поза обсягом

- Будь-яка production code, public API/type або observable behavior change.
- Version, package, changelog, release, publish чи `0.0.3` handoff changes.
- Створення нової identity, graph, cache, scope або ownership model поруч із чинною.
- Автоматичне перетворення recommendation на refactor чи implementation task.

## Критерії приймання

- [ ] Усі 12 task acceptance criteria мають evidence trace у run result і research artifacts.
- [ ] Responsibility/state/ownership maps прив'язані до точних source anchors та tests.
- [ ] Metrics відтворювані, а їхні validity limits і confounders пояснені.
- [ ] Options порівняні через єдину preservation/risk/cost framework.
- [ ] Recommendation є decision-ready й не блокує `0.0.3`.
- [ ] Independent audit findings reconciled до `review-ready`.

## Заплановані результати

- Імплементація: none.
- Формальне дослідження: `RSCH-001`.
- Detailed report:
  `memory/reports/research/2026-07-15-stage-18-runtime-composition-state-machine-decomposition-research.md`.
- Memory fixation: exact unapplied proposals лише за підтвердженої canonical потреби.
- Follow-ups: bounded proposals у review package; actual tasks лише після separate approval.

## Обов'язковий контекст задачі

- [TASK-0111 task](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
- [TASK-0111 result](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RUN-001/result.md)
- [TASK-0111 RSCH-001](../../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RSCH-001.md)
- [TASK-0111 detailed report](../../../../reports/research/2026-07-15-stage-18-architecture-pressure-residual-risks-decision-research.md)
- [TASK-0110 audit result](../../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/RUN-001/result.md)
- [TASK-0110 audit report](../../../../reports/audits/2026-07-15-stage-18-lifetime-shared-foundation-audit-handoff.md)
- [Architecture](../../../../technical/architecture.md)
- [Technical rules](../../../../technical/rules.md)
- [Testing](../../../../technical/testing.md)
- [Definition of done](../../../../technical/definition-of-done.md)
- [Knowledge package index](../../../../knowledge/package-index.md)

## Вхідні файли та модулі

- `packages/ioc/src/container.ts`.
- `packages/ioc/src/composer.ts`.
- `packages/ioc/src/provider-identity.ts`.
- `packages/ioc/src/provider-metadata.ts`.
- `packages/ioc/src/lifetime-validation.ts`.
- Релевантні `packages/ioc/test/container.test.ts`, `composer.test.ts`, lifetime,
  async-multi, graph-export, scope-inspection і resource tests, уточнені через source trace.

## Інваріанти збереження

- `get()` завжди синхронний; async semantics не протікають у sync API.
- Runtime immutable після `freeze()` / `compose()`.
- Container не знає про modules; composer використовує container/context без parallel model.
- Resolution і collection ordering, error precedence та diagnostic identity детерміновані.
- Private providers, values, raw IDs, cache/resource internals і causes не протікають.
- Runtime/scope ownership, no-partial-return і disposal/failure cleanup semantics незмінні.
- Object-configuration API лишається first-class; package exports tree-shaking friendly.

## Перевірки

- Predecessor/status pair, UTF-8, wiki links і artifact registry.
- Reproducible metrics із exact commands, tool versions і limitations.
- Source-anchor та test-trace review для кожного mapped transition й invariant.
- Focused baseline regressions для container/composer/lifetime/async-multi/resource/graph paths.
- Build, typecheck, lint і formatting gates, якщо вони потрібні для evidence validation.
- Self-review, language/upward-consistency gates та independent audit перед review-ready.

## Ризики

- Structural metrics можуть переоцінити risk і не показують semantic cohesion.
- Churn history може бути спотворена generated/mechanical або staged-delivery changes.
- Extraction може збільшити state threading, cycles чи implicit contracts.
- Недостатня characterization coverage може приховати ordering, privacy або cleanup drift.
- Recommendation може вирости в broad refactor без bounded go/no-go gates.
- Research може бути помилково сприйняте як `0.0.3` release prerequisite.

## Припущення

- TASK-0111 буде завершено до активації RUN-001.
- TASK-0110 audit і focused regressions є baseline, але active run оновить metrics та source anchors.
- `APR-002` встановлює maintainability pressure, а не доведений runtime defect.
- Internal refactor є лише candidate option до окремого human decision.
- Research не блокує `0.0.3` і не змінює release sequencing.

## Зміни від попереднього run

Не застосовується для RUN-001.
