# TASK-07.05-0089: Composer add multi contributions

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-05
Owner Role: Implementation Agent
Current Run: n/a
Current Research: n/a
Current Fixation: n/a

## Мета

Ввести explicit composition-root API для multi-provider contributions:
`composer.add(token)`, щоб composition root міг додавати ordered public multi contributions
без module wrapper і без приховування dependency graph.

## Phase

Phase 2: Multi-capability runtime and inspection.

Ця задача стоїть після `TASK-07.05-0077`, бо `composer.add()` потребує узгодженої public
provider identity / inspection shape для composition-root contributions.

## Scope

- Додати `Composer.add<TValue>(token: Token<TValue>): MultiBindingBuilder<TValue>` або
  еквівалентний public builder API, сумісний з existing `context.add()`.
- Дозволити composition-root additions тільки для token-ів, які мають declared public
  `multi` capability.
- Заборонити `composer.add()` для:
  - undeclared token;
  - declared `single` capability;
  - required-only port без public multi capability;
  - module-private token.
- Реєструвати composition-root additions після всіх module `setup()` contributions.
- Зберегти deterministic ordering:
  - module registration order;
  - registration order inside module `setup()`;
  - composition-root additions after modules;
  - composition-root registration order.
- Додати public inspection identity для composition-root providers відповідно до shape,
  прийнятого в `TASK-07.05-0077`.
- Забезпечити runtime gating parity:
  - `runtime.getAll(token)` бачить module + composition-root contributions у правильному
    порядку;
  - `runtime.get(token)` для такого public multi token продовжує падати
    `SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN`;
  - `runtime.getAll(token)` для public single token не змінюється.
- Додати validation diagnostics для неправильного використання `composer.add()`.
- Додати type-level coverage для `Composer.add()`.

## API Design Requirements

- `composer.add()` не має бути service locator або hidden runtime mutation API.
- `composer.add()` працює тільки до `compose()` / `prepare()` як частина immutable
  composition build.
- `composer.add()` не має виконувати user factories під час validation, inspection або graph
  inference.
- Composition-root provider identity має бути explicit у public inspection, наприклад через
  stable wording на кшталт:

```ts
interface GraphCapabilityProvider {
    readonly source: 'module' | 'composition-root'
    readonly moduleId?: string
    readonly registrationKind: 'bind' | 'add'
    readonly registrationIndex: number
}
```

Фінальна назва полів може слідувати existing `ModuleGraph` conventions, але інформація про
composition-root source, registration kind and order має бути доступною публічно.

## Diagnostics

Додати typed diagnostics у namespace `SAGIFIRE_IOC_*`. Орієнтовні codes:

- `SAGIFIRE_IOC_INVALID_COMPOSER_MULTI_BINDING` для `composer.add()` target, який не є
  declared public multi capability.
- `SAGIFIRE_IOC_COMPOSER_BINDING_CARDINALITY_CONFLICT` або equivalent, якщо один token
  отримує incompatible root `bind()` / `add()` registration.

Concrete names may be adjusted during implementation if the same meaning is preserved and
diagnostics remain stable, typed and readable.

## Out Of Scope

- Graph-aware adapter API.
- Adapter source validation.
- Adapter-aware cycle diagnostics.
- `MultiToken` / `ContributionToken` ergonomics.
- DSL helper changes unless needed for object API parity.
- Documentation/examples expansion beyond task memory.

## Acceptance Criteria

- [ ] `Composer` exposes public `add(token)` API for composition-root multi contributions.
- [ ] `composer.add(token)` succeeds for declared public `multi` capability tokens.
- [ ] `composer.add(token)` fails with typed diagnostic for single, undeclared, required-only
      or private tokens.
- [ ] Composition-root contributions resolve through `runtime.getAll(token)` after module
      contributions.
- [ ] Contribution order is deterministic and tested across modules and composition root.
- [ ] `runtime.get(token)` for multi token with root contributions still fails with
      `SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN`.
- [ ] Public inspection exposes composition-root provider identity and ordering.
- [ ] Validation and inspection do not execute user factories.
- [ ] Existing `composer.bind()` behavior remains backward compatible.
- [ ] Type-level tests cover `Composer.add()` inference.

## Dependencies

- Depends on `TASK-07.05-0077`.

## Linked Memory

- `memory/tasks/plan/TASK-07.05-0073-stage-17-0-0-2-implementation-planning/fixations/FIX-001.md`
- `memory/tasks/plan/TASK-07.05-0076-stage-17-multi-capability-runtime-gating/runs/RUN-001/result.md`
- `memory/tasks/plan/TASK-07.05-0077-stage-17-multi-capability-inspection-diagnostics/task.md`
- `memory/technical/rules.md`

## Runs

Run artifacts треба створити під час запуску задачі.
