# TASK-07.05-0078: Graph-aware adapter API

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: n/a
Current Research: n/a
Current Fixation: n/a

## Мета

Додати object API для graph-aware adapters, де source capabilities declared explicitly, а
`using()` отримує тільки resolved source values без resolver context.

## Phase

Phase 3: Graph-aware adapters.

## Scope

- Додати additive object API на composer level:

```ts
composer
    .adapt(TARGET_PORT)
    .from(SOURCE_CAPABILITY)
    .using((source) => {
        return createAdapter(source)
    })
```

- Додати object source form:

```ts
composer
    .adapt(TARGET_PORT)
    .from({ auth: AUTH_PUBLIC_API, permissions: PERMISSIONS_PUBLIC_API })
    .using(({ auth, permissions }) => {
        return createAdapter(auth, permissions)
    })
```

- `using()` must not expose `{ get }`, `getAll()` or generic resolver context.
- Preserve existing `composer.bind().toFactory()` and DSL `adapt(token, factory)`.
- Store adapter metadata without executing adapter factory.
- Add type tests for single source and object source inference.

## Out Of Scope

- Adapter source validation details beyond minimal API registration.
- Adapter-aware cycle detection.
- `fromAll()` for multi source tokens.
- Breaking or replacing existing DSL `adapt(token, factory)`.
- Documentation expansion beyond minimal API references.

## Acceptance Criteria

- [ ] `composer.adapt(target).from(source).using(factory)` registers a graph-aware adapter.
- [ ] Object source form preserves property names and type inference.
- [ ] Adapter factory receives source values only, not resolver context.
- [ ] Existing `bind().toFactory()` continues to work.
- [ ] Existing DSL `adapt(token, factory)` continues to work.
- [ ] Adapter metadata is available for later validation/inspection without factory
      execution.
- [ ] Relevant runtime and type tests pass.

## Dependencies

- Depends on `TASK-07.05-0077`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.04-0071-stage-17-feature-request-audit/research/RSCH-001.md`
- `memory/technical/rules.md`

## Runs

Run artifacts треба створити під час запуску задачі.
