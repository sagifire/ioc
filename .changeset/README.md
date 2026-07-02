# Changesets

This repository uses Changesets to collect human-reviewable release notes before package
versions are updated.

## Commands

- `pnpm changeset` creates a new changeset.
- `pnpm changeset:status` shows pending version and changelog changes for a branch whose
  `HEAD` can be compared with the configured `baseBranch` (`master`).
- `pnpm changeset:version` applies package version bumps and updates package changelogs.

`changeset:status` is a branch-aware helper, not an unconditional local release-readiness
check. Use it from a feature or release branch with a synced and Git-trusted local
`master`. If Changesets cannot resolve the merge base against `master` because the base
branch is missing, unsynced, unsafe for the current Git user, shallow, or otherwise has no
usable comparison point, the command can fail with `Failed to find where HEAD diverged from
"master"`. On a clean trusted `master`, it may simply report that no packages would be
bumped.

Use `pnpm release:validate` for the stable local non-publishing validation path.

## Versioning Strategy

The publishable packages are configured as a fixed Changesets group:

- `@sagifire/ioc`
- `@sagifire/ioc-next`
- `@sagifire/ioc-testing`

They release with synchronized public versions. The root workspace package stays private and
is not published.

Publishing is handled by the manual `Release` workflow. A push to `master` creates or
updates the Changesets release PR only; npm publish requires an explicit workflow dispatch
with `publish_to_npm` set to `publish`.
