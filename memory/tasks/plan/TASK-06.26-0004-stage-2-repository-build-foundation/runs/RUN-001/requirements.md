# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-28

## Goal for This Run

Створити Stage 2 repository/build foundation для `@sagifire/ioc`: monorepo workspace,
package skeletons, TypeScript/build/test/lint/format tooling, package export placeholders
і README/docs skeleton.

## Clarified Requirements

- Використовувати `pnpm` workspace.
- Використовувати TypeScript/ESM.
- Використовувати planned build tool `tsup`, якщо під час implementation не виявиться
  конкретний blocker.
- Пакети:
  - `@sagifire/ioc`
  - `@sagifire/ioc-next`
  - `@sagifire/ioc-testing`
- Усі package manifests мають мати `type: module` і `sideEffects: false`.
- Package exports мають бути tree-shaking friendly і resolve-ready.
- Core package не має імпортувати Next.js, React, Node-only APIs, decorators або
  `reflect-metadata`.
- Tests у Stage 2 мають перевіряти foundation plumbing, а не runtime behavior.

## Scope for This Run

- Root workspace files:
  - `package.json`
  - `pnpm-workspace.yaml`
  - TypeScript configs
  - ESLint config
  - Prettier config
  - Vitest config
  - build/test/typecheck/lint scripts
- Package folders and manifests for all three planned packages.
- Placeholder source entrypoints and subpath export files.
- Build configuration for independent package builds and type generation.
- Smoke/export tests if they validate package/build/export plumbing.
- README/docs skeleton matching implemented foundation only.

## Out of Scope for This Run

- Runtime behavior for tokens, container, context, composer, DSL, diagnostics, lifecycle,
  Next.js helpers or testing helpers.
- Meaningful API implementation beyond placeholders needed for export/build validation.
- Release automation.
- Full documentation or examples beyond skeletons.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria for This Run

- [ ] `pnpm install` works or dependency installation blocker is explicitly reported.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works if a typecheck script is created.
- [ ] `pnpm lint` works if a lint script is created.
- [ ] Each package can build independently.
- [ ] Package exports resolve for configured entrypoints.
- [ ] Types are generated.
- [ ] `sideEffects: false` is present in package manifests.
- [ ] No Stage 3+ runtime behavior is implemented.

## Changes from Previous Run

Не застосовується для RUN-001.
