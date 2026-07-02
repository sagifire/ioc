# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0065-stage-16-version-0-0-1-stabilization-handoff/task.md`
- `memory/tasks/plan/TASK-07.02-0065-stage-16-version-0-0-1-stabilization-handoff/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0063-stage-16-codebase-audit-report/research/RSCH-001.md`
- `memory/tasks/plan/TASK-07.02-0064-stage-16-critical-fixes-from-audit/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.02-0066-stage-16-sync-factory-promise-guard/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.02-0067-stage-16-composer-duplicate-binding-validation/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.02-0068-stage-16-freeze-failure-retry-policy/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.02-0069-stage-16-changeset-status-docs/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.02-0062-stage-16-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

This is the final Stage 16 task. It should version the publishable package set at
`0.0.1` only after all audit blockers from the accepted review decision are closed and
validation is clean.

## Files / Modules to Inspect

- `.changeset/`
- root `package.json`
- publishable package manifests
- package changelogs
- `CHANGELOG.md`
- `README.md`
- package README files
- `docs/release.md`
- release validation scripts/results
- relevant Project Memory files

## Known Risks

- Versioning `0.0.1` while critical/high/medium/low audit blockers remain open.
- Updating versions manually in a way that conflicts with Changesets fixed-version group.
- Claiming npm publication when only version fixation happened.
- Running an accidental publish command.
