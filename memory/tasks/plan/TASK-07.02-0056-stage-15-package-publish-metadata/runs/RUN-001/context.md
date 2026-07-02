# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0056-stage-15-package-publish-metadata/task.md`
- `memory/tasks/plan/TASK-07.02-0056-stage-15-package-publish-metadata/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`

## Relevant Product Context

This task follows governance artifacts and prepares package metadata before versioning,
dry-run and publish workflow tasks.

## Files / Modules to Inspect

- `package.json`
- `packages/ioc/package.json`
- `packages/ioc-next/package.json`
- `packages/ioc-testing/package.json`
- root and package README files if metadata needs docs sync
- root/package LICENSE and NOTICE files from the previous task

## Known Risks

- Accidentally making the root workspace publishable.
- Broadly changing package exports while intending only metadata readiness.
- Duplicating release/versioning work that belongs to the Changesets task.
- Letting package manifests drift between packages.
