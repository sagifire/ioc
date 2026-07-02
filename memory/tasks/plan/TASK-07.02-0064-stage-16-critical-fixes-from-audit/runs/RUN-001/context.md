# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0064-stage-16-critical-fixes-from-audit/task.md`
- `memory/tasks/plan/TASK-07.02-0064-stage-16-critical-fixes-from-audit/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0063-stage-16-codebase-audit-report/research/RSCH-001.md`
- `memory/tasks/plan/TASK-07.02-0062-stage-16-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

The audit report is the source of scope for this task. Version `0.0.1` must not be fixed
until critical findings are closed or explicitly reclassified with rationale.

## Files / Modules to Inspect

- Files referenced by critical findings in `RSCH-001`.
- Related tests and public docs.
- Package manifests only for verification; do not change versions.

## Known Risks

- Fixing symptoms without addressing root cause.
- Broadly refactoring unrelated code while chasing audit findings.
- Marking critical findings closed without regression coverage.
- Accidentally changing package versions before final Stage 16 handoff.
