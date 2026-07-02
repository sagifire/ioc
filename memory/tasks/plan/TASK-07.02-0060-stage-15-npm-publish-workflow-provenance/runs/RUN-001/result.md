# Result: RUN-001

Status: completed
Prepared For Review: yes
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Task Status After Run: done

## Summary

RUN-001 додав npm release workflow with explicit human-controlled publish path and
provenance support.

Implemented release workflow:

- `.github/workflows/release.yml`

Workflow behavior:

- on `push` to `master`, runs `pnpm release:validate` and uses `changesets/action@v2` to
  create or update the Changesets release PR;
- push-triggered release PR path does not publish to npm and does not receive npm token
  credentials;
- on manual `workflow_dispatch`, `dry-run` runs release validation only;
- on manual `workflow_dispatch` with `publish_to_npm` set to `publish` from
  `refs/heads/master`, publish job runs after validation, targets GitHub environment
  `npm-publish`, re-runs `pnpm release:validate` immediately before publish and then runs
  `pnpm release:publish`;
- publish job references `${{ secrets.NPM_TOKEN }}` only through environment variables and
  does not contain credential values;
- publish job grants `id-token: write` only to the npm publish job and sets
  `NPM_CONFIG_PROVENANCE=true` for Changesets/npm publish provenance.

Docs added or updated:

- `docs/release.md` documents release PR flow, manual publish control, local validation,
  required external GitHub/npm settings and provenance assumptions/limitations;
- `docs/README.md`, `.changeset/README.md`, root/package READMEs were narrowly synced so
  they no longer claim publishing automation is not implemented.

No actual npm publish was executed. No npm token, GitHub secret, credential value, runtime
behavior, public API or package export change was added.

## Changed Files

- Added `.github/workflows/release.yml`.
- Added `docs/release.md`.
- Updated `package.json` with `release:validate` and `release:publish`.
- Updated `.changeset/README.md`.
- Updated `docs/README.md`.
- Updated root `README.md`.
- Updated package README release-status text for:
  - `packages/ioc/README.md`;
  - `packages/ioc-next/README.md`;
  - `packages/ioc-testing/README.md`.
- Updated task memory status/result/progress/state for review handoff.

## Verification

- Official npm provenance docs checked for current GitHub Actions provenance requirements:
  GitHub-hosted runner, `id-token: write`, npm CLI provenance support and
  `NPM_CONFIG_PROVENANCE=true` as the supported path for third-party publish tools.
- Official `changesets/action` metadata checked for current input names; workflow uses
  `version`, not stale `version-script`.
- `pnpm format` - passed.
- `pnpm release:validate` - passed.
  - `pnpm build` passed.
  - `pnpm typecheck` passed.
  - `pnpm format` passed.
  - `pnpm lint` passed.
  - `pnpm test` passed: 19 test files and 211 tests.
  - `pnpm pack:dry-run` passed for `@sagifire/ioc`, `@sagifire/ioc-next` and
    `@sagifire/ioc-testing`, including packed runtime/type smoke checks.

No actual publish command was run outside the workflow definition. `pnpm release:publish`
was not executed locally because it would attempt real npm publishing.

## Acceptance Criteria Check

- [x] Publish workflow exists.
- [x] Workflow references secrets safely.
- [x] Workflow supports npm provenance through publish-job `id-token: write` and
      `NPM_CONFIG_PROVENANCE=true`.
- [x] Workflow validates before publish.
- [x] No unapproved publish action is performed.

## Agent Self-Review

- [x] Workflow integrates with Changesets release PR/versioning flow.
- [x] Publish is manual-only and additionally constrained to `refs/heads/master`.
- [x] Push-triggered release PR path cannot publish and does not receive npm credentials.
- [x] Publish job uses `${{ secrets.NPM_TOKEN }}` references only and commits no secrets.
- [x] Publish job uses GitHub-hosted Ubuntu runner and `id-token: write` for provenance.
- [x] Release validation includes build, typecheck, format, lint, tests and package
      dry-run validation before publish.
- [x] External settings and provenance limitations are documented.
- [x] Runtime behavior, public API and package exports were not changed.
- [x] `memory/sources/SPEC.md` was not edited.
- [x] General-level memory impact was checked.

## Memory Sync

- Product memory: not needed
- Domain memory: not needed
- Technical memory: not needed
- Knowledge memory: not needed
- Task memory: updated
- Wiki indexes: not needed
- State file: updated
- General-level memory documents: checked

## Follow-up Tasks

- After task-level human review approval, continue with
  `TASK-07.02-0061-stage-15-release-docs-final-hardening`.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-07-02
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачу."

Задачу переведено в `done` після explicit task-level human review approval.
