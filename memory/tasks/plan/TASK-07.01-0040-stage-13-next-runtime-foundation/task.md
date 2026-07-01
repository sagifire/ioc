# TASK-07.01-0040: Stage 13 Next runtime foundation

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати першу частину Stage 13: foundation public API для `@sagifire/ioc-next` and
cached runtime helper.

## Product Context

Stage 13 starts the Next.js adapter package. The first implementation task must replace
the Stage 2 placeholder with a small useful helper that safely caches runtime creation at
the application/framework boundary while keeping `@sagifire/ioc` core free of Next.js and
React imports.

## Scope

- Implement initial public exports in `packages/ioc-next/src/index.ts`.
- Implement `createNextRuntime()` or an equivalent cached runtime helper over existing
  `@sagifire/ioc` public runtime/composer/app APIs.
- Make cache ownership instance-local to the helper returned by `createNextRuntime()`;
  do not introduce a package-level global mutable container registry.
- Deduplicate in-flight async runtime initialization.
- Ensure failed runtime initialization does not permanently poison the cache unless the
  implementation documents a stronger retry policy in `result.md`.
- Preserve the runtime type returned by the user-provided factory.
- Keep the helper framework-boundary oriented and independent from request/route/action
  scope helpers.
- Add package-local runtime tests for cache reuse, in-flight de-duplication, failure retry
  and disposal/reset behavior if such behavior is public.
- Add Vitest `expectTypeOf` assertions for `createNextRuntime()` inference.
- Add package export smoke coverage for `@sagifire/ioc-next`.
- Update minimal package README/docs only if placeholder text would otherwise be
  misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing request context helpers.
- Implementing route handler scope helper.
- Implementing server action scope helper.
- Implementing App Router examples beyond minimal README/API text.
- Adding Next.js or React imports to `@sagifire/ioc`.
- Adding filesystem auto-discovery, route scanning or module discovery.
- Mutating existing frozen `ContainerRuntime` or `ComposedRuntime`.
- Changing `@sagifire/ioc` core runtime semantics.
- Changing `@sagifire/ioc-testing` helper surface.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] `@sagifire/ioc-next` exports a non-placeholder Next adapter foundation.
- [ ] `createNextRuntime()` or equivalent cached runtime helper is implemented.
- [ ] Runtime cache is owned by the helper instance and not by a hidden global registry.
- [ ] Successful runtime initialization is reused by later calls.
- [ ] Concurrent calls share in-flight initialization.
- [ ] Failed initialization can be retried or has a documented explicit cache policy.
- [ ] Helper preserves user runtime type inference.
- [ ] Core package does not import Next.js, React or `@sagifire/ioc-next`.
- [ ] Runtime tests cover cache behavior and package boundary.
- [ ] Type-level assertions cover helper inference.
- [ ] Package export smoke tests cover `@sagifire/ioc-next`.
- [ ] Stage 13 task does not implement request, route or server action helpers.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/tasks/plan/TASK-07.01-0039-stage-13-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Початковий autonomous implementation run для Next runtime foundation.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval planning task
`TASK-07.01-0039-stage-13-implementation-planning`, якщо користувач явно не змінить
операційний порядок.
