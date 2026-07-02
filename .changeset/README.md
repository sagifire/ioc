# Changesets

This repository uses Changesets to collect human-reviewable release notes before package
versions are updated.

## Commands

- `pnpm changeset` creates a new changeset.
- `pnpm changeset:status` shows pending version and changelog changes.
- `pnpm changeset:version` applies package version bumps and updates package changelogs.

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
