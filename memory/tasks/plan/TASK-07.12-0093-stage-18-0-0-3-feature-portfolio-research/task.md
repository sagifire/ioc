# TASK-07.12-0093: Stage 18 `0.0.3` feature portfolio research and decision gate

Task Status: done
Type: research
Created: 2026-07-12
Owner Role: Research Agent
Current Run: RUN-001

## Поточний стан

Run Status: completed
Progress: Task approved; FIX-001..003 applied; bounded follow-up tasks 0094-0098 created and validated.
Acceptance: 16/16
Blockers: none
Blocked Phase: n/a
Pending Decisions: none
Next Action: Активувати TASK-07.12-0094 або один із design gates 0097/0098 за окремою інструкцією.

## Мета

Дослідити й сформувати погоджений невеликий пакет функціональності для
`@sagifire/ioc 0.0.3`, який розвиває власну продуктову та архітектурну візію Sagifire,
а також підготувати decision-ready рекомендацію без передчасної реалізації.

## Продуктовий контекст

Після завершення `0.0.2` наступна версія має поглиблювати сильні сторони продукту:
явну модульну композицію, контрольований dependency graph, lifecycle safety,
діагностичність і придатність до роботи людей та coding agents. Маркетингове дослідження
є вхідним референсом, а не автоматично прийнятою специфікацією. Конкурентні рішення
перевіряються поверхнево за актуальними primary sources лише для розуміння ринку,
відомих проблем і ризиків; сторонні API не копіюються.

## Вимоги

- Використовувати збережене маркетингове дослідження як immutable verbatim source snapshot
  `memory/sources/sagifire_ioc_0_0_3_market_research_uk.md`; не реконструювати його з
  task artifacts і не трактувати як автоматично прийняту специфікацію.
- Провести formal research трьох взаємопов'язаних кандидатів:
  - async multi-providers;
  - lifetime dependency validation;
  - graph export у JSON, DOT і Mermaid.
- Для кожного кандидата оцінити product/architecture fit, user problem, власну семантичну
  модель Sagifire, architecture pressure, blast radius, compatibility, ризики,
  відкриті питання, implementation/maintenance cost і користь.
- Оцінити документацію, приклади, migration guidance, diagnostic UX, adoption,
  architecture/testing workflows і користь для coding agents нарівні з runtime API.
- Розглядати graph export як детерміновану проєкцію normalized inspection graph, а не
  паралельну модель; дослідити versioned JSON schema, DOT/Mermaid renderers, safe data
  boundaries, diffability і Project Memory snapshot для людей та агентів.
- Підготувати candidate matrix і рішення `accept | design-first | defer | reject` для
  кожного кандидата, bounded portfolio recommendation та phased follow-up proposals.
- Створити task-local `RSCH-*` і детальний українськомовний report у
  `memory/reports/research/`.
- Підготувати exact `FIX-*` proposals для підтверджених canonical memory changes; не
  застосовувати їх без окремого human approval.
- Перед human review виконати self-review і незалежний subagent audit.

## Обсяг

- Аналіз async multi-provider semantics: sync/async contributions, eager/lazy resolution,
  lifetimes, resource ownership, disposal, concurrency, retry, partial failures,
  cardinality, composer, overrides, testing і DSL.
- Аналіз lifetime dependency validation: небезпечні dependency edges, resolution проти
  instance capture, singleton/scoped/transient, managed resources, static/runtime
  detection, factory/adapter metadata та severity diagnostics.
- Аналіз graph export: normalized graph, stable machine-readable schema, deterministic
  order, JSON/DOT/Mermaid, modules/ports/capabilities/bindings/adapters/cardinality/
  lifetimes, privacy boundary, schema compatibility, snapshots і diffs у Project Memory.
- Поверхнева актуальна перевірка ключових конкурентних тверджень за primary sources без
  запозичення API design.
- Рекомендація малого взаємопов'язаного пакета `0.0.3`, його sequencing, gates,
  deferred/rejected scope та follow-up proposals.
- Оцінка впливу Stage 18 на загальні й canonical документи пам'яті.

## Актуалізація Stage 18 у Project Memory

- Під час execution/review/finalization синхронізувати lifecycle Stage 18 у
  `memory/tasks/plan/progress.md`, task/run dashboards та релевантних operational indexes;
  ці updates не потребують `FIX-*`.
- Якщо analysis підтвердить релевантність, підготувати exact `FIX-*` для:
  `memory/state.md`, `memory/product/requirements.md`, `memory/product/roadmap.md`,
  `memory/technical/architecture.md`, `memory/technical/rules.md`,
  `memory/technical/specification-trace.md`, `memory/domain/open-questions.md` та
  безпосередньо пов'язаних indexes.
- Для кожного зазначеного документа явно зафіксувати disposition
  `included | not-needed | blocked` з обґрунтуванням.
- Canonical зміни застосовувати лише після task-level human review та окремого approval
  відповідних `FIX-*`; до approval Stage 18 залишається research/decision proposal.
- Під час finalization перевірити upward consistency між state, product, domain,
  technical memory, roadmap, specification trace, indexes і фактичним task lifecycle.

## Поза обсягом

- Реалізація досліджуваних features або зміна code/runtime/public API/package exports.
- Alias bindings, named/tagged bindings, activation/deactivation hooks, interception.
- Decorators, `reflect-metadata`, filesystem discovery або hidden current scope.
- Cycle-masking/lazy proxies і довільна plugin system.
- Version bump, release handoff, push, publish або створення implementation tasks без
  human approval follow-up proposals.
- Створення `RSCH-*`, detailed report або `FIX-*` під час підготовки цієї backlog-задачі;
  вони створюються лише в active RUN-001. Source snapshot уже імпортовано як обов'язковий
  самодостатній input task package.

## Критерії приймання

- [ ] Вхідне дослідження збережено verbatim як immutable source snapshot із provenance,
  датою та синхронізованим source index.
- [ ] Ключові конкурентні твердження поверхнево перевірено за актуальними primary sources.
- [ ] Жоден сторонній API не рекомендовано лише через його наявність у конкурента.
- [ ] Усі три кандидати мають аргументовану оцінку product/architecture fit.
- [ ] Для кожного кандидата визначено власні Sagifire semantics, risks, blast radius,
  open questions і cost/benefit.
- [ ] Async multi-providers охоплюють cardinality, resolution, lifecycle, concurrency,
  failure, disposal, composer, testing і DSL concerns.
- [ ] Lifetime validation розрізняє небезпечне instance capture та допустимі dependency
  edges і пропонує обґрунтовані detection/severity semantics.
- [ ] Graph export визначено як normalized inspection graph projection із JSON schema,
  DOT/Mermaid renderers, deterministic/safe output і compatibility policy.
- [ ] Описано практичний Project Memory snapshot/diff workflow для людей та агентів.
- [ ] Документацію, приклади, migration guidance, diagnostics і adoption оцінено нарівні
  з runtime functionality.
- [ ] Створено task-local `RSCH-*`, detailed українськомовний report і candidate matrix.
- [ ] Сформовано bounded recommendation, explicit deferred/rejected scope та phased
  follow-up proposals без їх автоматичного створення.
- [ ] Для всіх визначених загальних документів пам'яті зафіксовано
  `included | not-needed | blocked`; релевантні exact changes оформлено як `FIX-*`.
- [ ] Stage 18 lifecycle синхронізовано в `progress.md`, task/run dashboards та indexes на
  execution, review і finalization gates.
- [ ] Виконано self-review, language/upward-consistency gates і independent subagent audit;
  findings закрито до review.
- [ ] Реалізацію, versioning і publish не розпочато; задача передана в human review, а не
  завершена агентом самостійно.

## Пов'язана пам'ять

- `memory/state.md`
- `memory/product/vision.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/domain/open-questions.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/technical/specification-trace.md`
- `memory/knowledge/package-index.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/task.md`
- `memory/tasks/plan/TASK-07.05-0090-stage-17-version-0-0-2-release-handoff/task.md`
- `memory/sources/sagifire_ioc_0_0_3_market_research_uk.md`

Source provenance:

- Imported: 2026-07-12 during task-package correction before RUN-001 activation.
- Original attachment: `28f0bb32-7380-45e7-bf48-ff0d450f5f0a/pasted-text.txt`.
- SHA-256: `BD3FEF0A1802265110EEF536605CF76288A2BE8B2CF3ADCC9516ABE5447DC1FE`.
- Import verification: source and memory snapshot hashes were byte-identical.

## Прогони

- [RUN-001](RUN-001/index.md) - completed - Formal research, decision gate and approved finalization.

## Дослідження

- [RSCH-001](RSCH-001.md) - completed; disposition `final-result` - Feature portfolio research і decision summary.

## Фіксації

- [FIX-001](FIX-001.md) - applied -
  Stage 18 product/state/roadmap/source trace.
- [FIX-002](FIX-002.md) - applied -
  Target architecture and technical guardrails.
- [FIX-003](FIX-003.md) - applied -
  Canonical async multi/lifetime open questions.

## Запити на рішення

- Немає.

## Запропоновані follow-up задачі

- Graph export v1 schema and safe projection design/implementation.
- Deterministic JSON/DOT/Mermaid renderers and compatibility fixtures.
- Graph export docs, Project Memory workflow example and testing helpers.
- Provider dependency metadata design for lifetime analysis.
- Lifetime severity/diagnostic semantics and incremental implementation plan.
- Async multi-provider semantic design.
- Async multi-provider phased implementation after design approval.
- Final `0.0.3` audit, stabilization and release handoff after accepted slices.

Ці proposals не створені як tasks і потребують окремого human decision.

## Human Review

Status: approved
Requested: 2026-07-12
Reviewed: approved 2026-07-12
Approval Source: user message: "Задача: approve + Створи відповідні похідні задачі; FIX-001, FIX-002, FIX-003: approve"
Approved Fixations: FIX-001, FIX-002, FIX-003
Rejected Fixations: none
Follow-up Decisions: create appropriate derived tasks subject to approved design gates
Decision Notes: Reviewed content approved; exact fixations and bounded follow-up creation are finalizing.

## Фінальний результат

Completed: 2026-07-12
Final Run: RUN-001
Summary: Graph export accepted; lifetime validation and async multi marked design-first; FIX-001..003 applied; TASK-0094..0098 created.
Residual Risks: Lifetime/async-multi semantics remain unresolved until design tasks; graph schema/API details remain implementation decisions in TASK-0094.
