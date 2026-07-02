# Result: RUN-001

Status: completed
Prepared For Review: yes
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Task Status After Run: done

## Summary

RUN-001 додав repeatable package dry-run validation path for all publishable packages.

Implemented validation command:

- `pnpm pack:dry-run`

Validation behavior:

- runs `pnpm build` before package validation;
- packs `@sagifire/ioc`, `@sagifire/ioc-next` and `@sagifire/ioc-testing` through
  `pnpm pack` into `.tmp/package-dry-run/tarballs`;
- inspects each tarball with `tar` and validates required package contents:
  `package.json`, `README.md`, `LICENSE`, `NOTICE`, `CHANGELOG.md`, declared `files`
  entries and export target files;
- validates package metadata in packed manifests: package name/version, ESM module type,
  `Apache-2.0`, `sideEffects: false`, public publish access, repository/homepage/bugs and
  absence of `workspace:` dependency ranges after packing;
- creates a clean smoke project under `.tmp/package-dry-run/smoke`;
- installs the local tarballs with `npm install` using workspace-local npm cache under
  `.tmp/package-dry-run/smoke/.npm-cache`;
- runs runtime ESM import smoke checks for root and subpath core exports,
  `@sagifire/ioc-next` and `@sagifire/ioc-testing`;
- runs TypeScript declaration smoke checks against the installed tarball packages.

No npm publish, release workflow, npm token, GitHub secret, credential handling, runtime
behavior, public API or package export changes were added.

## Changed Files

- Added `scripts/pack-dry-run.mjs`.
- Updated `package.json` with `pack:dry-run`.
- Updated `eslint.config.js` with Node globals for `.mjs` scripts.
- Updated task memory status/result/progress/state for review handoff.

## Verification

- `pnpm pack:dry-run` - passed.
  - Built all three packages.
  - Packed all three publishable packages.
  - Verified tarball contents and metadata.
  - Installed local tarballs into `.tmp/package-dry-run/smoke`.
  - Ran runtime ESM export smoke checks.
  - Ran TypeScript declaration smoke checks through `pnpm exec tsc`.
- `pnpm format` - passed.
- `pnpm lint` - passed.
- `pnpm typecheck` - passed.
- `pnpm test` - passed; 19 test files and 211 tests passed.

Initial dry-run attempts exposed issues in the new validation script rather than package
metadata defects:

- Windows `pnpm` / `npm` `.cmd` execution needed an explicit `cmd.exe /c` runner.
- `npm install` needed workspace-local cache under `.tmp` instead of writing to the user
  npm cache.
- The first runtime smoke DSL sample declared an invalid composition binding; the sample
  was corrected to bind a declared required port.

No package contents, package metadata, export target or packed dependency defects remain
known after the passing dry-run.

## Acceptance Criteria Check

- [x] Package dry-run command/script exists.
- [x] Dry-run validation is run and recorded.
- [x] Package contents are checked.
- [x] Package exports/types are smoke-tested where practical.
- [x] No publish action is performed.

## Agent Self-Review

- [x] Validation covers all three publishable packages.
- [x] Validation builds before packing.
- [x] Validation uses `.tmp/package-dry-run` and does not commit generated tarballs or
      smoke project files.
- [x] Validation inspects packed artifacts rather than source-tree files.
- [x] Packed manifests are checked for publish metadata and no `workspace:` dependency
      leakage.
- [x] Runtime exports and TypeScript declarations are smoke-tested from installed local
      tarballs.
- [x] No actual publish command, publish workflow, tokens, secrets or credentials were
      added.
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
  `TASK-07.02-0060-stage-15-npm-publish-workflow-provenance`.

## Human Review

Status: approved
Reviewer Role: Product Lead Hat
Reviewed: 2026-07-02
Approval Scope: whole-task-review
Approval Source: Користувач повідомив: "Я зробив ревю, можеш завершувати задачу."

Задачу переведено в `done` після explicit task-level human review approval.
