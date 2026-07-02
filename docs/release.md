# Release Workflow

This repository uses Changesets for versioning and changelog updates, GitHub Actions for
release validation and npm publishing, and npm provenance for published packages where the
npm/GitHub environment supports it.

## Release PR

On each push to `master`, `.github/workflows/release.yml` runs the local release validation
script and then uses `changesets/action` to create or update a version PR when unreleased
changesets exist.

The release PR updates package versions and package changelogs. It does not publish to npm.

## Manual Publish

Actual npm publishing is only wired to a manual workflow dispatch:

1. Merge the reviewed Changesets version PR into `master`.
2. Open the `Release` workflow in GitHub Actions.
3. Run the workflow from `master`.
4. Choose `dry-run` to validate only, or choose `publish` to publish after validation.

The `publish` option runs `pnpm release:validate` before `pnpm release:publish`. The publish
job also re-runs validation in the same job immediately before publishing.

## Local Verification

Use this command for the same non-publishing validation path used by the workflow:

```sh
pnpm release:validate
```

It runs build, typecheck, formatting check, lint, tests and package dry-run validation.

## Required External Settings

Publishing requires repository and npm settings that are not stored in this repository:

- GitHub repository secret `NPM_TOKEN` with permission to publish the three public packages.
- GitHub Actions enabled for the repository.
- A GitHub environment named `npm-publish`; maintainers should configure required reviewers
  for that environment before the first real publish.
- npm package ownership and organization settings that allow publishing
  `@sagifire/ioc`, `@sagifire/ioc-next` and `@sagifire/ioc-testing`.

The workflow references `${{ secrets.NPM_TOKEN }}` but does not contain token values.

## Provenance

The publish job runs on a GitHub-hosted Ubuntu runner, grants `id-token: write` only to the
publish job and sets `NPM_CONFIG_PROVENANCE=true` for `changeset publish`. This follows npm
guidance for package publishing tools that do not directly expose an `npm publish
--provenance` command.

Provenance still depends on external npm/GitHub conditions:

- the package `repository` metadata must point to the public source repository;
- the publish must run on the supported GitHub-hosted workflow path;
- the npm CLI available with Node.js 24 must continue to support provenance publishing;
- npm account, organization and token settings must permit the publish operation.

If any external condition is missing, the workflow should fail rather than publish without
the expected provenance path.
