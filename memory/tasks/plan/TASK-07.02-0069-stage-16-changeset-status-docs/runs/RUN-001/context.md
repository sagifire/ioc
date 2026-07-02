# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0069-stage-16-changeset-status-docs/task.md`
- `memory/tasks/plan/TASK-07.02-0069-stage-16-changeset-status-docs/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0063-stage-16-codebase-audit-report/research/RSCH-001.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

Stage 15 introduced Changesets workflow and local release validation docs. The audit found
that `pnpm changeset:status` can fail locally when `HEAD` has no divergence from `master`,
so docs need to avoid presenting it as an unconditional local status check.

## Files / Modules to Inspect

- `.changeset/README.md`
- `docs/release.md`
- root `package.json`
- Changesets CLI behavior/output where practical.

## Known Risks

- Papering over the command failure with wording that still implies it is reliable on
  clean `master`.
- Changing scripts without verifying how Changesets interprets `--since`.
- Touching package versions or changelogs while only closing docs/workflow finding.
