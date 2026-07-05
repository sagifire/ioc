# TASK-07.05-0087: `0.0.2` full audit

Status: backlog
Type: research
Execution Mode: autonomous-research
Created: 2026-07-05
Owner Role: Audit Agent
Current Run: n/a
Current Research: n/a
Current Fixation: n/a

## Мета

Провести повний аудит проекту після implementation і documentation phases перед final
`0.0.2` stabilization handoff.

## Phase

Phase 7: Full audit and stabilization. Це остання фаза.

## Scope

- Audit public API consistency across:
  - `@sagifire/ioc`;
  - `@sagifire/ioc-testing`;
  - `@sagifire/ioc-next`.
- Audit implementation against all accepted decisions from `TASK-07.05-0073`.
- Audit tests, type tests, docs, examples, diagnostics and package exports.
- Verify adapter-aware cycle detection is implemented before release handoff.
- Verify docs/examples reflect implemented behavior only.
- Classify findings by severity: `critical`, `high`, `medium`, `low`.
- Produce Ukrainian audit report in `research/RSCH-001.md`.
- Do not modify code during audit task.

## Out Of Scope

- Fixing findings during audit.
- Changing package versions/changelogs.
- Actual npm publish.

## Acceptance Criteria

- [ ] Audit report exists in `research/RSCH-001.md`.
- [ ] Audit covers all `0.0.2` phases.
- [ ] Audit verifies accepted decisions from `FIX-001`.
- [ ] Audit classifies findings by severity.
- [ ] Audit identifies release blockers.
- [ ] Code/runtime/package changes are not performed during audit.
- [ ] Follow-up stabilization scope is clear for `TASK-07.05-0088`.

## Dependencies

- Depends on `TASK-07.05-0086`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/technical/rules.md`
- `memory/technical/definition-of-done.md`

## Research

Research artifacts треба створити під час запуску задачі.
