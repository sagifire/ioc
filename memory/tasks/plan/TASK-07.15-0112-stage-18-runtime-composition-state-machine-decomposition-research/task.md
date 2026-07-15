# TASK-07.15-0112: [EXTREME AGENT COMPLEXITY] Stage 18 runtime composition state-machine decomposition research

Task Status: backlog
Type: research
Created: 2026-07-15
Agent Complexity: extreme
Owner Role: Architecture Research Agent
Current Run: RUN-001

## Поточний стан

Run Status: prepared
Progress: Пакет підготовлено за approved `DTP-APR-002`; predecessor виконано, research ще не активовано.
Acceptance: 0/12
Blockers: none; TASK-0111 completed.
Blocked Phase: n/a
Pending Decisions: none before research execution.
Next Action: Активувати RUN-001 лише за окремою explicit command, потім виконати
  evidence-driven decomposition research.

## Мета

Сформувати decision-ready, evidence-driven рішення щодо того, чи слід лишити великі
integration state machines у `packages/ioc/src/container.ts` і
`packages/ioc/src/composer.ts` без structural refactor або виконати поетапний внутрішній
refactor, і якщо так — через які безпечні seams із точним збереженням чинної поведінки.

## Попередник і activation gate

- [TASK-0111](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
  має бути `done` до активації RUN-001.
- Approval task result, classification `APR-002` і `DTP-APR-002` уже отримано; це дозволяє
  створення пакета, але не скасовує predecessor gate.

## Release boundary

Ця research-задача явно не блокує `0.0.3` release handoff. Вона не авторизує production
refactor, version bump, publish або зміну release sequencing; будь-яка implementation work
потребує окремого human-reviewed рішення й окремої bounded task.

## Вимоги

- Побудувати responsibility map для `container.ts` і `composer.ts` із явними integration
  boundaries, входами, виходами, mutable/immutable state та shared foundations.
- Побудувати state-transition і ownership map для resolution, composition, scope,
  caching, resource acquisition/disposal, inspection та validation paths.
- Зафіксувати інваріанти переходів і ownership, порушення яких змінить observable behavior,
  privacy, ordering, diagnostics або resource safety.
- Зібрати відтворювані coupling, change-hotspot і complexity metrics; не використовувати
  line count як самодостатній доказ refactor.
- Визначити candidate seams і для кожного оцінити parameter/state coupling, dependency
  direction, duplication risk, testability, compatibility та blast radius.
- Зіставити чинні tests з mapped transitions та визначити characterization-test gaps,
  потрібні перед будь-яким extraction.
- Порівняти щонайменше `no refactor` і bounded staged internal-refactor options із
  go/no-go gates, cost, sequencing, rollback та residual-risk analysis.
- Зберегти exact public API, public type behavior, sync `get()`, runtime immutability,
  deterministic ordering, diagnostic identity, private-provider sanitation й ownership/
  disposal semantics у кожному рекомендованому варіанті.
- Під час active run створити task-local `RSCH-001` і detailed українськомовний report
  `memory/reports/research/2026-07-15-stage-18-runtime-composition-state-machine-decomposition-research.md`.
- До human review виконати self-review, language/upward-consistency gates та independent
  subagent audit; усі findings reconcile у reviewed artifacts.
- Follow-up proposals мають бути bounded і decision-specific; actual follow-up tasks можна
  створювати лише після окремого human approval research result і відповідного proposal.

## Обсяг

- Responsibility, state-transition, ownership та invariant maps для runtime container і
  module composer integration paths.
- Reproducible complexity, coupling і change-hotspot evidence.
- Candidate seam analysis і characterization-test coverage/gap matrix.
- Порівняння no-refactor та staged internal-refactor options.
- Formal research artifacts, decision-ready recommendation і approval-gated bounded
  follow-up proposals.

## Поза обсягом

- Production refactor або будь-які зміни `container.ts`, `composer.ts` чи іншого runtime code.
- Зміни public API, observable behavior, diagnostics contract, package exports або types.
- Зміни version, changelog, release workflow, publish чи release-ready claim.
- Big-bang rewrite, parallel identity/graph/ownership model або extraction заради line count.
- Створення чи виконання implementation tasks до окремого human review й approval.

## Критерії приймання

- [ ] Перед активацією підтверджено `TASK-0111 = done`, а `APR-002`, `DTP-APR-002`, TASK-0110 audit і baseline evidence мають двосторонній trace у research artifacts.
- [ ] Для `container.ts` і `composer.ts` створено responsibility map із entry/exit points, dependency direction, shared foundations та ownership of state без пропуску ключових integration responsibilities.
- [ ] Побудовано явну state-transition map для configuration/freeze/compose, sync/async single/multi resolution, scope, validation/inspection і disposal paths із normal та failure transitions.
- [ ] Для cache, in-flight work, scope/runtime resources, unpublished candidates і private identity зафіксовано ownership/lifetime invariants та failure cleanup boundaries.
- [ ] Coupling, complexity і change-hotspot metrics отримано відтворюваними командами; report пояснює обмеження кожної metric і не трактує line count як достатню причину refactor.
- [ ] Кожен candidate seam має evidence-based оцінку cohesion, parameter/state coupling, dependency cycles, duplication/parallel-model risk, testability, compatibility і blast radius.
- [ ] Чинні tests зіставлено з mapped transitions; кожен material characterization gap має precise pre-refactor test proposal, а відсутність gap не заявлено без evidence.
- [ ] Exact-behavior preservation matrix охоплює public API/types, sync `get()`, immutability, ordering, error precedence/diagnostics, privacy, caches, ownership, disposal і no-partial-return semantics.
- [ ] Порівняно `no refactor` та щонайменше один staged internal-refactor option із cost, dependencies, sequence, rollback, go/no-go gates і residual risks; big-bang rewrite окремо оцінено й не прийнято без сильніших доказів.
- [ ] Recommendation однозначно визначає `no refactor | staged internal refactor`, пояснює evidence threshold і не перетворює maintainability pressure на непідтверджений behavioral defect.
- [ ] Створено й узгоджено `RSCH-001` та detailed українськомовний report; canonical memory impacts мають `included | not-needed | blocked`, а змістові зміни оформлено лише як unapplied exact `FIX-*` proposals за потреби.
- [ ] Self-review, language/upward-consistency gates та independent subagent audit завершено без open findings; задача лишається non-blocking для `0.0.3`, production changes відсутні, а actual follow-up tasks не створено до окремого human approval.

## Перевірка

- Перевірити predecessor/status pair, artifact registry, UTF-8 і всі локальні wiki links.
- Записати exact команди та tool/version assumptions для source metrics і hotspot analysis.
- Звірити responsibility/transition/ownership maps із source anchors і чинними tests.
- Запустити релевантні focused regressions як baseline, а за потреби `npm test`, build,
  typecheck, lint і formatting gates без зміни production code.
- Перевірити decision matrix на повне покриття preservation invariants, options, risks,
  release boundary та follow-up approval gates.
- Перед `review-ready` виконати self-review й independent audit усіх research artifacts.

## Ризики

- Line count або branch count може створити false precision і підмінити semantic coupling.
- Git churn може відображати staged delivery чи formatting, а не реальний change hotspot.
- Невдала seam може збільшити parameter coupling або створити parallel state/ownership model.
- Green regressions без transition-level characterization можуть не помітити error precedence,
  privacy, ordering або disposal drift.
- Надто широкий staged plan може фактично стати big-bang rewrite і збільшити blast radius.
- Research може помилково стати release gate; non-blocking boundary треба зберігати явно.

## Пов'язана пам'ять

- [TASK-0111](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
- [TASK-0111 result](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RUN-001/result.md)
- [TASK-0111 RSCH-001](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RSCH-001.md)
- [TASK-0111 detailed report](../../../reports/research/2026-07-15-stage-18-architecture-pressure-residual-risks-decision-research.md)
- [TASK-0110 audit result](../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/RUN-001/result.md)
- [TASK-0110 audit report](../../../reports/audits/2026-07-15-stage-18-lifetime-shared-foundation-audit-handoff.md)
- [Architecture](../../../technical/architecture.md)
- [Technical rules](../../../technical/rules.md)
- [Testing](../../../technical/testing.md)
- [Definition of done](../../../technical/definition-of-done.md)

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Evidence-driven decomposition decision research.

## Дослідження

- `RSCH-001` - planned for active RUN-001.
- Detailed report - planned at
  `memory/reports/research/2026-07-15-stage-18-runtime-composition-state-machine-decomposition-research.md`.

## Фіксації

Немає на preparation stage. Якщо research вимагатиме змістових canonical changes, вони
мають бути оформлені як exact `FIX-*` proposals і не застосовані до human approval.

## Запити на рішення

Після завершення research: task-level `approve | request changes | cancel`; окремі рішення
для кожного `FIX-*` і кожного bounded follow-up proposal.

## Human Review

Status: not-requested

## Фінальний результат

Не завершено.
