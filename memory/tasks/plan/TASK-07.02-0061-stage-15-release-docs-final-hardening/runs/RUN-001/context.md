# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.02-0061-stage-15-release-docs-final-hardening/task.md`
- `memory/tasks/plan/TASK-07.02-0061-stage-15-release-docs-final-hardening/runs/RUN-001/requirements.md`
- `memory/tasks/plan/TASK-07.02-0054-stage-15-implementation-planning/fixations/FIX-001.md`
- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`

## Relevant Product Context

This is the final Stage 15 implementation task. It should not add a new release subsystem;
it should verify and document the release/governance subsystem built by earlier Stage 15
tasks.

## Files / Modules to Inspect

- `README.md`
- package README files
- `docs/README.md`
- `LICENSE`
- `NOTICE`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `TRADEMARKS.md`
- `CHANGELOG.md`
- `.github/workflows/`
- `.changeset/` or equivalent
- package manifests
- dry-run validation scripts/results
- relevant Project Memory files

## Known Risks

- Claiming packages are published when only publish automation exists.
- Leaving stale "release automation not implemented" statements after Stage 15 work.
- Updating docs without final package dry-run/build verification.
- Marking Stage 15 complete in memory before task-level human review.
