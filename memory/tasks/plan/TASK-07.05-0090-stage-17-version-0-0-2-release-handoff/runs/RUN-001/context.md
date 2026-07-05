# Context Package: RUN-001

## Required Reading

- `memory/agent-start.md`
- `memory/state.md`
- `memory/memory-rules.md`
- `memory/agents/rules.md`
- `memory/tasks/plan/progress.md`
- `memory/tasks/plan/TASK-07.05-0090-stage-17-version-0-0-2-release-handoff/task.md`
- `memory/tasks/plan/TASK-07.05-0090-stage-17-version-0-0-2-release-handoff/runs/RUN-001/requirements.md`

## Relevant Product Context

Stage 17 accepted and implemented the `0.0.2` scope through phased tasks. The full audit and
stabilization handoff are complete, and this run exists only to fix version/release state.

## Relevant Domain Context

No domain model changes are expected. The release must preserve project guardrails: explicit
composition, no hidden service locator and no framework coupling in the core package.

## Relevant Technical Context

- Publishable packages are fixed as a Changesets group:
  `@sagifire/ioc`, `@sagifire/ioc-next`, `@sagifire/ioc-testing`.
- The private root workspace package stays unpublished and is not the public package
  version.
- `pnpm release:validate` is the local non-publishing release validation path.
- Actual npm publish remains controlled by the GitHub `Release` workflow and explicit human
  action.

## Relevant Knowledge Packages

Не потрібні.

## Files / Modules to Inspect

- `.changeset/`
- `package.json`
- `packages/*/package.json`
- `CHANGELOG.md`
- `packages/*/CHANGELOG.md`
- `README.md`
- `packages/*/README.md`
- `docs/release.md`
- `memory/state.md`
- `memory/product/roadmap.md`
- `memory/tasks/plan/progress.md`

## Known Risks

- Do not claim npm publication without external verification.
- Do not run `pnpm release:publish` locally.
- Local Git may require temporary `safe.directory` config because of checkout ownership.

## Assumptions

- User request authorizes version/release preparation but not actual npm publish.
- Pushing the resulting commit is a human action outside this run.
