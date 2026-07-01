# TASK-07.02-0046: Stage 14 README and package docs

Status: backlog
Type: docs
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати першу частину Stage 14: product-oriented root README, package READMEs and
documentation navigation that reflect the completed Stage 13 API surface.

## Product Context

Current root/package READMEs still carry stage-tracking language. Stage 14 should make the
project understandable to library users without implying unimplemented Stage 15 release
automation or future runtime behavior.

## Scope

- Update root `README.md` into a concise product overview and quickstart.
- Update `packages/ioc/README.md`, `packages/ioc-next/README.md` and
  `packages/ioc-testing/README.md`.
- Add or update docs navigation if needed, for example `docs/README.md` or `docs/index.md`.
- Cover install/import shape, package roles, minimal token/container/composer/testing/Next
  examples and links to deeper docs.
- Mark examples and package docs as workspace/development docs if packages are not yet
  published.
- Keep object API first-class and describe DSL as optional convenience.
- Update only docs files and task run memory unless a broken docs link requires a narrow
  supporting change.

## Out of Scope

- Writing the full container, async, composer, testing, Next or migration guides.
- Adding new runtime behavior or changing public API.
- Creating Stage 14 example applications.
- Adding release automation, package versioning, changelog generation or publishing docs
  beyond a clear "not released yet" note if needed.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Root README explains what `@sagifire/ioc` is and which packages exist.
- [ ] README includes a minimal quickstart that uses implemented public API.
- [ ] Package READMEs describe each package's current public API and boundaries.
- [ ] Docs navigation points users to architecture, container, async, composer, modules,
  diagnostics, testing, Next integration and migration docs.
- [ ] Documentation does not claim Stage 15 release automation is implemented.
- [ ] Documentation does not describe unimplemented APIs as available.
- [ ] Links are relative and resolve inside the repository.
- [ ] Relevant docs formatting checks pass.
- [ ] `pnpm build`, `pnpm test`, `pnpm typecheck` and `pnpm lint` are run if affected
  files or repo workflow require them; otherwise the run result documents why not.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: pending
  - Purpose: Autonomous implementation run for README/package documentation.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
