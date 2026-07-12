# TASK-07.12-0096: Stage 18 graph export docs, workflow and testing

Task Status: backlog
Type: implementation
Created: 2026-07-12
Owner Role: Documentation and Testing Agent
Current Run: RUN-001

## Поточний стан

Run Status: prepared
Progress: Task package prepared; очікує завершення TASK-07.12-0095.
Acceptance: 0/10
Blockers: TASK-07.12-0095 not done
Blocked Phase: sequencing
Pending Decisions: none
Next Action: Активувати після human-approved completion TASK-07.12-0095.

## Мета

Завершити graph export slice через schema/API documentation, runnable examples,
Project Memory snapshot/diff workflow і optional testing helpers поверх public APIs.

## Вимоги та обсяг

- Schema/version/compatibility/privacy reference і JSON/DOT/Mermaid usage docs.
- Example без filesystem behavior у core; recipes можуть писати files на application edge.
- Практичний provenance/snapshot/diff workflow для humans і coding agents.
- Optional `@sagifire/ioc-testing` helpers лише якщо вони додають value через public API.
- Package/export smoke, docs consistency, deterministic fixtures і privacy hardening.
- Migration guidance additive; `getGraph()` remains usable.

## Поза обсягом

- Automatic Project Memory mutation/commit, CLI, PNG/SVG, hosted viewer.
- Lifetime/async multi implementation, version bump, publish.

## Критерії приймання

- [ ] Schema/API/compatibility/privacy docs complete.
- [ ] JSON/DOT/Mermaid examples use public API.
- [ ] Snapshot/diff workflow records provenance and avoids automatic mutation.
- [ ] Agent workflow treats JSON, not renderer labels, as source of truth.
- [ ] Optional testing helpers do not read private internals.
- [ ] Migration/additive compatibility documented.
- [ ] Deterministic/privacy fixtures remain passing.
- [ ] Package/export/docs checks pass.
- [ ] No CLI/filesystem behavior added to core.
- [ ] Self-review and independent audit passed; task passed to human review.

## Пов'язана пам'ять

- `memory/tasks/plan/TASK-07.12-0095-stage-18-graph-export-dot-mermaid-renderers/task.md`
- `memory/reports/research/2026-07-12-stage-18-0-0-3-feature-portfolio.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - Docs/workflow/testing hardening.

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
