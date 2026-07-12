# TASK-07.12-0094: Stage 18 graph export v1 schema and safe projection

Task Status: backlog
Type: implementation
Created: 2026-07-12
Owner Role: Implementation Agent
Current Run: RUN-001

## Поточний стан

Run Status: prepared
Progress: Task package prepared; implementation не розпочато.
Acceptance: 0/12
Blockers: none
Blocked Phase: n/a
Pending Decisions: none
Next Action: Активувати RUN-001 після завершення TASK-07.12-0093.

## Мета

Реалізувати versioned `GraphExportDocument v1` як safe projection чинного normalized
`ModuleGraph` / `RuntimeInspection` і canonical deterministic JSON representation без
створення другої graph model.

## Вимоги

- Object-configuration/public data API first; DSL не потрібен для використання export.
- Schema version окремий від package version; визначити omission/null і compatibility policy.
- Зберігати semantic registration order; стабілізувати лише non-semantic ordering.
- Не виконувати factories і не читати provider/resource/scope values.
- За замовчуванням не export-ити arbitrary metadata, private provider IDs, secrets,
  timestamps, random IDs або absolute paths.
- Надати canonical JSON data/serializer з deterministic key/whitespace/newline policy.
- Не додавати filesystem, Graphviz/Mermaid execution або Node-only dependencies у core.
- Додати behavioral, repeatability, privacy, schema compatibility і package export tests.
- Оновити relevant docs тільки для реалізованої v1 surface.

## Обсяг

- `GraphExportDocument v1` DTO/schema та safe projection.
- Canonical JSON serialization.
- Public exports, inspection integration за потреби, tests і minimal docs.

## Поза обсягом

- DOT/Mermaid renderers (`TASK-07.12-0095`).
- CLI/filesystem writes, PNG/SVG, hosted viewer або external renderer execution.
- Lifetime dependency edges чи async multi semantics.
- Automatic Project Memory mutation, version bump, publish.

## Критерії приймання

- [ ] V1 schema/DTO має окрему version identity і compatibility policy.
- [ ] Projection походить тільки з public safe inspection graph.
- [ ] Semantic ordering preservation задокументовано й протестовано.
- [ ] Canonical JSON повторюваний byte-for-byte для того самого input.
- [ ] Privacy boundary закрито sentinel tests.
- [ ] Factories/resources не виконуються під час export.
- [ ] Core не отримує Node-only/filesystem dependencies.
- [ ] Object API fully usable без DSL.
- [ ] Public exports і type tests оновлено.
- [ ] Relevant unit/integration/package smoke checks проходять.
- [ ] Docs описують лише implemented v1 behavior.
- [ ] Self-review та independent audit passed; task передано в human review.

## Пов'язана пам'ять

- `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/task.md`
- `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/FIX-002.md`
- `memory/reports/research/2026-07-12-stage-18-0-0-3-feature-portfolio.md`
- `memory/product/requirements.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Graph export v1 foundation implementation.

## Дослідження

- Немає; bounded implementation спирається на approved Stage 18 research.

## Фіксації

- Очікуються лише якщо implementation уточнить canonical behavior; не застосовувати без approval.

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
