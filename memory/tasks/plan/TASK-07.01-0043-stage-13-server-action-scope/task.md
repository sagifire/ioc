# TASK-07.01-0043: Stage 13 server action scope

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати четверту частину Stage 13: server action scope helper for Next.js App Router
server action style operations.

## Product Context

Server actions have an operation boundary that is similar to request/route handling but
does not have the same request/response shape. This task should add a dedicated action
scope helper instead of overloading the route helper.

## Scope

- Implement `withServerActionScope()`, `createServerAction()` or an equivalent server
  action scope helper in `packages/ioc-next/src/index.ts`.
- Integrate with the Stage 13 cached runtime helper.
- Integrate with request/operation context helper for explicit action-local values.
- Create one core scope per server action invocation.
- Pass runtime, scope and action context explicitly to the action callback.
- Dispose the scope in a `finally` path on successful and failed action execution.
- Preserve action callback argument and return type inference.
- Keep the helper independent from route-specific request/response behavior.
- Add package-local runtime tests for successful action execution, thrown action disposal,
  scoped value visibility, async callback behavior and callback type inference.
- Add Vitest `expectTypeOf` assertions for server action helper inference.
- Update minimal package README/docs only if public API text would otherwise be
  misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing new route handler behavior.
- Implementing full Next.js application examples beyond minimal server action API text.
- Adding hidden current action/current scope APIs.
- Adding filesystem route/action scanning or auto-wrapping modules.
- Adding Next.js or React imports to `@sagifire/ioc`.
- Changing core scope or runtime disposal semantics.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Server action scope helper is implemented in `@sagifire/ioc-next`.
- [ ] Helper obtains runtime through the Stage 13 cached runtime helper.
- [ ] Helper creates exactly one scope per action invocation.
- [ ] Action context values are visible inside the action scope.
- [ ] Runtime and scope are passed explicitly to the action callback.
- [ ] Scope is disposed after successful action execution.
- [ ] Scope is disposed after failed action execution.
- [ ] Action argument and return type inference are preserved.
- [ ] Helper is independent from route-specific request/response behavior.
- [ ] No hidden current action/current scope API is introduced.
- [ ] Core package does not import Next.js, React or `@sagifire/ioc-next`.
- [ ] Runtime tests cover server action helper lifecycle.
- [ ] Type-level assertions cover callback inference.
- [ ] Stage 13 task does not implement broad docs/examples hardening.
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
- `memory/tasks/plan/TASK-07.01-0041-stage-13-next-request-context/task.md`
- `memory/tasks/plan/TASK-07.01-0042-stage-13-route-handler-scope/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Початковий autonomous implementation run для server action scope helper.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval і завершення
`TASK-07.01-0042-stage-13-route-handler-scope`, якщо користувач явно не змінить
операційний порядок.
