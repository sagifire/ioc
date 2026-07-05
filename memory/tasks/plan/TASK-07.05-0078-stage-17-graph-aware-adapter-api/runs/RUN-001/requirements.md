# RUN-001 Requirements

Task: `TASK-07.05-0078-stage-17-graph-aware-adapter-api`
Agent Role: Implementation Agent
Started: 2026-07-05

## Мета run

Реалізувати перший additive slice graph-aware adapter object API на composer level:

```ts
composer
    .adapt(TARGET_PORT)
    .from(SOURCE_CAPABILITY)
    .using((source) => createAdapter(source))
```

і object-source форму:

```ts
composer
    .adapt(TARGET_PORT)
    .from({ auth: AUTH_PUBLIC_API, permissions: PERMISSIONS_PUBLIC_API })
    .using(({ auth, permissions }) => createAdapter(auth, permissions))
```

## Functional Requirements

- `composer.adapt(target).from(source).using(factory)` реєструє adapter binding для target.
- `from(source)` підтримує single token source.
- `from({ ...sources })` підтримує object source map і зберігає property names.
- `using()` отримує тільки resolved source value або object із resolved source values.
- `using()` не отримує resolver context, `{ get }`, `getAll()` або еквівалентний escape hatch.
- Adapter metadata зберігається без виконання adapter factory.
- Existing `composer.bind().toFactory()` лишається backward compatible.
- Existing DSL `adapt(token, factory)` лишається backward compatible.

## Test Requirements

- Додати runtime tests для single-source adapter registration and resolution.
- Додати runtime tests для object-source adapter registration and resolution.
- Додати regression tests, що adapter factory не виконується під час registration /
  metadata inspection path.
- Додати type tests для single source inference.
- Додати type tests для object source inference and property preservation.
- Запустити релевантні package checks: typecheck, tests і build або пояснити blocker.

## Out Of Scope

- Adapter source validation diagnostics beyond minimal API registration.
- Adapter-aware cycle detection.
- `fromAll()` або multi-source token semantics.
- Переписування existing DSL `adapt(token, factory)`.
- Широке documentation expansion.
