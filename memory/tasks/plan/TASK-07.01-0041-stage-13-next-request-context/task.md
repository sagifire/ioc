# TASK-07.01-0041: Stage 13 Next request context

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати другу частину Stage 13: request context helper and request-scoped values for
`@sagifire/ioc-next`.

## Product Context

After the cached runtime foundation exists, the adapter needs an explicit way to map
Next/App Router request or operation data into existing core scopes. This task should add
the context data layer without implementing route handler or server action wrappers.

## Scope

- Implement `createNextRequestContext()` or an equivalent request context helper in
  `packages/ioc-next/src/index.ts`.
- Represent request-specific data as explicit token/value pairs compatible with existing
  `CreateScopeOptions`, `scopeValue()` and `scopeMultiValue()` semantics.
- Support request-local single values and multi values where the core scope API supports
  them.
- Preserve token value inference for request context declarations.
- Keep request context immutable after creation from the public adapter API perspective.
- Avoid hidden async-local context, global request registry or framework-level service
  locator behavior.
- Keep helper usable with Web standard request-like objects and do not require a hard
  Next.js import unless the implementation task documents a concrete public type need.
- Add package-local runtime tests for context creation, scope option conversion, token
  inference, duplicate/conflict behavior delegated to core and immutability.
- Add Vitest `expectTypeOf` assertions for request context helper inference.
- Update minimal package README/docs only if public API text would otherwise be
  misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing route handler scope helper.
- Implementing server action scope helper.
- Implementing App Router examples beyond minimal request context API text.
- Adding hidden AsyncLocalStorage or implicit current-request access.
- Adding Next.js or React imports to `@sagifire/ioc`.
- Adding filesystem auto-discovery, route scanning or module discovery.
- Mutating existing frozen `ContainerRuntime` or `ComposedRuntime`.
- Changing core scope semantics.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Request context helper is implemented in `@sagifire/ioc-next`.
- [ ] Helper converts explicit context entries to existing core scope options.
- [ ] Single request-local values preserve token value inference.
- [ ] Multi request-local values preserve token value inference where supported.
- [ ] Duplicate/conflict behavior is deterministic and delegates to existing core scope
  validation where appropriate.
- [ ] Request context data is not mutated through public adapter APIs after creation.
- [ ] No hidden current-request service locator or async-local dependency is introduced.
- [ ] Core package does not import Next.js, React or `@sagifire/ioc-next`.
- [ ] Runtime tests cover request context behavior.
- [ ] Type-level assertions cover request context inference.
- [ ] Package export smoke tests remain valid for `@sagifire/ioc-next`.
- [ ] Stage 13 task does not implement route handler or server action wrappers.
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
- `memory/tasks/plan/TASK-07.01-0040-stage-13-next-runtime-foundation/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Початковий autonomous implementation run для Next request context helpers.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval і завершення
`TASK-07.01-0040-stage-13-next-runtime-foundation`, якщо користувач явно не змінить
операційний порядок.
