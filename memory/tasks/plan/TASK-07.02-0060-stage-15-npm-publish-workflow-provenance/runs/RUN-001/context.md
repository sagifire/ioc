# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0060-stage-15-npm-publish-workflow-provenance/task.md`
- `memory/tasks/plan/TASK-07.02-0060-stage-15-npm-publish-workflow-provenance/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

Publish workflow should come after CI and dry-run validation so the release path can reuse
validated checks rather than becoming a separate unverified path.

## Files / Modules to Inspect

- `.github/workflows/`
- `.changeset/` or equivalent release tooling config
- `package.json`
- package manifests
- dry-run validation scripts from the previous task
- `CHANGELOG.md`

## Known Risks

- Publishing accidentally during implementation.
- Committing tokens or secrets.
- Adding provenance claims that the workflow cannot support.
- Letting publish workflow bypass package dry-run validation.
- Depending on external repository/npm settings without documenting them.
