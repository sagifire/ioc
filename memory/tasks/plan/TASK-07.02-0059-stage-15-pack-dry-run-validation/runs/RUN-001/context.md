# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0059-stage-15-pack-dry-run-validation/task.md`
- `memory/tasks/plan/TASK-07.02-0059-stage-15-pack-dry-run-validation/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/testing.md`

## Relevant Product Context

Dry-run validation bridges CI and publish workflow. It should answer whether built packages
would be structurally valid if published.

## Files / Modules to Inspect

- `package.json`
- package manifests
- package `files` entries
- `dist` output after build
- root/package README, LICENSE and NOTICE files
- existing scripts under `scripts/` if such folder appears

## Known Risks

- Treating source-tree imports as proof that packed package exports work.
- Accidentally publishing instead of dry-running.
- Committing generated tarballs or temporary smoke-test directories.
- Hiding packaging defects instead of documenting and fixing their cause.
