# TASK-07.01-0032: Stage 11 DSL hardening and docs

Status: backlog
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-07-01
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Завершити Stage 11 DSL через hardening, package export coverage, inspection parity
regressions and minimal docs sync.

## Product Context

After module DSL, app DSL and bind/adapt DSL are implemented, Stage 11 needs a final
stabilization task to ensure the public DSL is coherent, tree-shaking friendly and clearly
documented without implying magic or replacing the object API.

## Scope

- Review final DSL public API for consistency with object API and composer semantics.
- Harden runtime tests for DSL-generated config parity with equivalent object API config.
- Harden type-level tests for public DSL inference.
- Verify `@sagifire/ioc/dsl` and root exports where applicable.
- Ensure DSL does not import Next.js, React, Node-only APIs, decorators or
  `reflect-metadata`.
- Ensure DSL does not introduce global mutable registries or filesystem auto-discovery.
- Add or update docs/README for:
  - `module()`;
  - `defineApp()`;
  - bind helper DSL;
  - `adapt()`;
  - object API parity and no-hidden-graph rule.
- Update roadmap/state/task memory to reflect Stage 11 implementation status after the
  run.
- Update run result memory after implementation.

## Out of Scope

- Implementing `@sagifire/ioc-testing` helpers or graph assertions.
- Implementing Next.js adapters or examples.
- Implementing documentation/examples beyond minimal DSL docs sync required for Stage 11.
- Changing container/composer semantics outside DSL compatibility fixes.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] DSL public API is coherent across root and `@sagifire/ioc/dsl` exports.
- [ ] DSL-generated configuration has validation/inspection parity with equivalent object
  API configuration.
- [ ] Type-level tests cover module/app/bind/adapt DSL inference.
- [ ] Runtime tests cover final DSL integration path.
- [ ] Package export smoke tests cover final DSL API.
- [ ] Docs/README describe DSL as optional and keep object API first-class.
- [ ] Docs/README do not imply decorators, auto-discovery, service locator behavior or
  hidden graph magic.
- [ ] Stage 11 overall acceptance is satisfied.
- [ ] Stage 11 task does not implement testing helpers or Next.js adapters.
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
- `memory/tasks/plan/TASK-07.01-0028-stage-11-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: planned
  - Purpose: Початковий autonomous implementation run для final DSL hardening.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval and completion of
`TASK-07.01-0031-stage-11-bind-adapt-dsl`, якщо користувач явно не змінить операційний
порядок.
