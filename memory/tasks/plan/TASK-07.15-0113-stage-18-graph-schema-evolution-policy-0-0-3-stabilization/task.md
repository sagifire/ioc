# TASK-07.15-0113: [EXTREME AGENT COMPLEXITY] Stage 18 graph schema evolution policy 0.0.3 stabilization

Task Status: done
Type: stabilization
Created: 2026-07-15
Agent Complexity: extreme
Owner Role: Graph Schema Stabilization Agent
Current Run: RUN-001

## Поточний стан

Run Status: completed
Progress: Human review approved; RUN-001 finalized without fixations.
Acceptance: 12/12
Blockers: none; TASK-0110 і TASK-0111 done, FIX-001 applied.
Blocked Phase: n/a
Pending Decisions: none
Next Action: none

## Мета

Реалізувати схвалену graph schema evolution policy у public документації, типах і тестах до
будь-якого майбутнього `0.0.3` version/release handoff, зберігши v1 як default і його byte
contract, а v2 як explicit opt-in schema. Задача є обов'язковим predecessor і blocker будь-якої
майбутньої передачі `0.0.3` до version/release workflow.

## Попередники й порядок

- [TASK-0110](../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/task.md)
  має бути `done` до activation.
- [TASK-0111](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
  має бути `done`, а approved `FIX-001` — `applied`, до activation.
- TASK-0113 має завершитися до будь-якого майбутнього package version bump, changelog release
  entry, release handoff або publish action для `0.0.3`.

## Вимоги

- Реалізувати approved schema evolution policy без зміни чинного v1/v2 output contract.
- Відобразити policy в public docs, public graph-export types/options і regression tests.
- Для кожної supported schema version мати canonical golden, unknown-envelope і default gates.
- Задокументувати compatibility, removal, default-promotion та migration checklist для
  майбутніх schema versions.
- Перевірити serializer, DOT і Mermaid для v1 та v2 без fallback reinterpretation unknown schema.
- Зберегти privacy-safe projection, deterministic ordering і canonical serialization.
- Залишити v1 default і v2 opt-in; не створювати schema v3 і не просувати v2 до default.
- Виконати focused та full quality gates і незалежний аудит перед human review.

## Обсяг

- Public graph export documentation і migration/evolution checklist.
- Public graph schema/version types та options, лише якщо потрібне явне відображення
  схваленої policy без behavioral expansion.
- Per-supported-version JSON golden fixtures і regressions для canonical bytes/order.
- Unknown schema/version envelope rejection та default-schema regressions.
- Serializer, DOT і Mermaid support для v1/v2.
- Privacy/determinism parity для всіх supported versions.

## Поза обсягом

- Schema v3 або будь-яка інша нова graph schema version.
- Promotion v2 до default або зміна default schema behavior.
- Provider, lifetime, scope, module composition чи resolution semantics.
- Package version bump, changelog release entry або release notes.
- Publish, registry, tagging чи інший release workflow.
- Whole-portfolio або whole-`0.0.3` release-ready claim.

## Критерії приймання

- [x] TASK-0110 і TASK-0111 мають статус `done`; approved `FIX-001` має статус `applied`, а
  їхні graph-evolution findings і decisions простежені до RUN-001 result.
- [x] Public docs фіксують, що schema version є окремим compatibility contract, published
  version не мутується несумісно, а incompatible field/type/meaning/closed-enum/semantic-order
  change потребує нової schema version.
- [x] Public graph types/options лишають v1 і v2 explicit closed supported versions та не
  послаблюють unknown schema/version envelope до silently accepted або reinterpreted value.
- [x] V1 лишається default; canonical v1 JSON projection і frozen byte contract не змінені.
- [x] V2 лишається explicit opt-in; serializer, DOT і Mermaid підтримують v2 без зміни
  documented graph semantics.
- [x] Кожна supported version має canonical golden fixtures для field semantics, semantic
  array ordering, LF/final-newline policy і byte stability на frozen inputs.
- [x] Serializer, DOT і Mermaid мають regression gates для explicit typed rejection невідомих
  schema/version envelopes без fallback до default або найближчої supported version.
- [x] Окремий default-schema regression доводить v1 default і запобігає неявному promotion v2
  через додавання version constant, union member або test fixture.
- [x] V1 і v2 проходять однакові privacy та determinism gates без витоку private token,
  provider cause/value, cache/disposer чи іншої runtime-private інформації.
- [x] Public docs містять actionable checklist для introduction, compatibility review,
  migration, old-version support/removal і окремого human-reviewed default-promotion decision.
- [x] Focused graph suite та повні build, test, typecheck, lint і format gates проходять; package
  exports/public type consumer smoke перевірено пропорційно зміненій surface.
- [x] Незалежний аудит підтверджує всі 12 критерії, відсутність schema v3/default promotion/
  provider-semantic/release змін і відсутність відкритих findings перед human review.

## Пов'язана пам'ять

- [TASK-0111 contract](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/task.md)
- [TASK-0111 result](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RUN-001/result.md)
- [TASK-0111 RSCH-001](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/RSCH-001.md)
- [TASK-0111 detailed report](../../../reports/research/2026-07-15-stage-18-architecture-pressure-residual-risks-decision-research.md)
- [TASK-0111 FIX-001](../TASK-07.15-0111-stage-18-architecture-pressure-residual-risks-decision-research/FIX-001.md)
- [TASK-0110 audit task](../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/task.md)
- [TASK-0110 audit result](../TASK-07.13-0110-stage-18-extreme-agent-complexity-lifetime-shared-foundation-audit-handoff/RUN-001/result.md)
- [TASK-0110 formal audit](../../../reports/audits/2026-07-15-stage-18-lifetime-shared-foundation-audit-handoff.md)
- [Technical architecture](../../../technical/architecture.md)
- [Technical rules](../../../technical/rules.md)
- [Testing strategy](../../../technical/testing.md)
- [Definition of Done](../../../technical/definition-of-done.md)

## Вхідні source, tests і docs

- [Graph export source](../../../../packages/ioc/src/graph-export.ts)
- [Core public exports](../../../../packages/ioc/src/index.ts)
- [Graph export tests](../../../../packages/ioc/test/graph-export.test.ts)
- [Scope inspection graph v2 tests](../../../../packages/ioc/test/scope-inspection-graph-v2.test.ts)
- [Graph export public documentation](../../../../docs/graph-export.md)

## Прогони

- [RUN-001](RUN-001/index.md) - completed - Graph schema evolution policy stabilization.

## Дослідження

Окреме formal research не очікується: policy вже схвалена в TASK-0111. Якщо execution
виявить contract ambiguity, не вгадувати semantics, а оформити blocker або bounded proposal.

## Фіксації

Approved canonical policy вже міститься у `FIX-001` TASK-0111. Нові змістові зміни canonical
Project Memory поза exact approved policy потребують окремого `FIX-*` і human approval.

## Запити на рішення

Немає на prepared stage. Version/default/removal decisions не можна приймати неявно в цій задачі.

## Human Review

Status: approved
Requested: 2026-07-15
Reviewed: approved 2026-07-15
Approval Source: user message on 2026-07-15: `task-level рішення: approve`

## Фінальний результат

Completed: 2026-07-15.

- Graph schema evolution policy реалізовано в public docs/types/tests.
- V1 лишився default із frozen byte contract; v2 лишився explicit opt-in.
- Full quality/package gates та independent audit пройдено без open findings.
- Required/optional `FIX-*` і follow-up proposals відсутні.
- Version bump, changelog release entry, publish та release workflow не виконувалися.
- TASK-0113 є завершеним predecessor, але не whole-portfolio `0.0.3` release-ready claim.
