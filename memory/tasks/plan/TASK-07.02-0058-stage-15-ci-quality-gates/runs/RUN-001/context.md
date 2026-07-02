# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0058-stage-15-ci-quality-gates/task.md`
- `memory/tasks/plan/TASK-07.02-0058-stage-15-ci-quality-gates/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/product/requirements.md`
- `memory/product/roadmap.md`
- `memory/technical/stack.md`
- `memory/technical/testing.md`

## Relevant Product Context

CI quality gates should validate repository health before package dry-run and publishing
workflows are added.

## Files / Modules to Inspect

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- existing `.github/` folder if one has appeared
- `README.md` or docs only if CI status documentation needs a narrow link

## Known Risks

- Accidentally adding publish behavior to CI.
- Running a command in CI that is not available locally.
- Skipping important gates because they are slow instead of documenting a concrete reason.
- Requiring secrets for ordinary pull request CI.
