# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0057-stage-15-changesets-versioning-changelog/task.md`
- `memory/tasks/plan/TASK-07.02-0057-stage-15-changesets-versioning-changelog/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`

## Relevant Product Context

The repository has three related publishable packages. Versioning/changelog setup should
prepare release automation without publishing.

## Files / Modules to Inspect

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `CHANGELOG.md`
- package manifests
- existing `.changeset/` folder if one has appeared

## Known Risks

- Installing release tooling without required permission.
- Creating an actual version bump when only setup is intended.
- Choosing independent versions without documenting why.
- Introducing publish workflow behavior that belongs to a later Stage 15 task.
