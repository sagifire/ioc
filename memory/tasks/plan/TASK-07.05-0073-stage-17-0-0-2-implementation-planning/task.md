# TASK-07.05-0073: Stage 17 `0.0.2` implementation planning

Status: done
Type: memory-update
Execution Mode: interactive-memory-update
Created: 2026-07-05
Owner Role: Memory Planning Agent
Current Run: n/a
Current Research: n/a
Current Fixation: FIX-001

## Мета

Зафіксувати рішення людини й агента після `TASK-07.04-0071` research audit і розкласти
прийняті `0.0.2` features на послідовні implementation phases з деталізованими backlog
tasks.

## Контекст

`TASK-07.04-0071` підтвердив, що `0.0.2` feature request містить цінні напрями, але не
може бути прийнятий wholesale. Після обговорення людина підтвердила базовий порядок і
додала конкретні API/validation/lifecycle рішення щодо cardinality, multi-dependency
semantics, adapter API, adapter cycles і child scope cache inheritance.

## Scope

- Зафіксувати рішення щодо:
  - `cardinality` у `provides` і `requires`;
  - `required: true | false` semantics для multi dependencies;
  - validation rules для single/multi declaration model;
  - registration kind mismatch між declared cardinality і `bind()` / `add()`;
  - composed runtime public surface gating для `get()` / `getAll()`;
  - deterministic ordering для module і composition-root contributions;
  - inspection model для multi-capability providers;
  - graph-aware adapter API без доступу до `{ get }` у `using()`;
  - adapter source validation і first-slice non-goal для adapter-aware cycles;
  - child scope cache inheritance policy.
- Розкласти реалізацію на phased backlog tasks.
- Додати penultimate docs/examples phase.
- Додати final full audit and stabilization phase перед `0.0.2` release handoff.
- Оновити `memory/state.md`, `memory/product/roadmap.md`, `memory/technical/rules.md`,
  `memory/tasks/plan/index.md` і `memory/tasks/plan/progress.md`.

## Out Of Scope

- Реалізовувати code/runtime/package changes.
- Змінювати public API, package exports, docs або examples у кодовій базі.
- Створювати або редагувати source snapshots у `memory/sources/`.
- Стверджувати actual npm release status без окремої перевірки.
- Виконувати actual npm publish.

## Acceptance Criteria

- [x] Рішення щодо `cardinality`, validation, runtime gating, ordering, adapters і child
      scopes зафіксовані у `FIX-001`.
- [x] План розкладений на кілька послідовних phases.
- [x] Для кожної phase створені деталізовані backlog task artifacts.
- [x] Docs/examples phase є передостанньою.
- [x] Full audit/stabilization phase є останньою.
- [x] `memory/product/roadmap.md` оновлено відповідно до phased plan.
- [x] `memory/technical/rules.md` містить актуальні `0.0.2` guardrails.
- [x] `memory/state.md`, `tasks/plan/index.md` і `tasks/plan/progress.md` синхронізовані.
- [x] Code/runtime/package changes не виконувалися.
- [x] Planning task переведена в `review`, не в `done`, до human review.
- [x] Задача переведена в `done` після explicit human review approval.

## Linked Memory

- `memory/state.md`
- `memory/product/roadmap.md`
- `memory/technical/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/research/RSCH-001.md`
- `memory/sources/sagifire_ioc_0_0_2_feature_request_uk.md`
- `memory/tasks/plan/TASK-07.05-0074-stage-17-multi-capability-cardinality-model/`
- `memory/tasks/plan/TASK-07.05-0075-stage-17-multi-capability-validation/`
- `memory/tasks/plan/TASK-07.05-0076-stage-17-multi-capability-runtime-gating/`
- `memory/tasks/plan/TASK-07.05-0077-stage-17-multi-capability-inspection-diagnostics/`
- `memory/tasks/plan/TASK-07.05-0078-stage-17-graph-aware-adapter-api/`
- `memory/tasks/plan/TASK-07.05-0079-stage-17-adapter-source-validation-inspection/`
- `memory/tasks/plan/TASK-07.05-0080-stage-17-adapter-cycle-diagnostics/`
- `memory/tasks/plan/TASK-07.05-0081-stage-17-child-scope-lifecycle-model/`
- `memory/tasks/plan/TASK-07.05-0082-stage-17-child-scope-runtime-semantics/`
- `memory/tasks/plan/TASK-07.05-0083-stage-17-testing-helpers-new-primitives/`
- `memory/tasks/plan/TASK-07.05-0084-stage-17-multitoken-contributiontoken-ergonomics/`
- `memory/tasks/plan/TASK-07.05-0085-stage-17-dsl-ergonomics-hardening/`
- `memory/tasks/plan/TASK-07.05-0086-stage-17-0-0-2-docs-examples/`
- `memory/tasks/plan/TASK-07.05-0087-stage-17-0-0-2-full-audit/`
- `memory/tasks/plan/TASK-07.05-0088-stage-17-0-0-2-stabilization-handoff/`

## Runs

Немає. Задача виконується як `interactive-memory-update`.

## Research

Немає. Використовується завершений research artifact `TASK-07.04-0071/.../RSCH-001.md`.

## Fixations

- [FIX-001](fixations/FIX-001.md)
  - Status: applied
  - Purpose: Зафіксувати `0.0.2` decisions і phased implementation backlog.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-07-05
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Добре, я зробив ревю, можеш завершувати задачу планування."

## Closure

Задача завершена після explicit task-level human review approval.
