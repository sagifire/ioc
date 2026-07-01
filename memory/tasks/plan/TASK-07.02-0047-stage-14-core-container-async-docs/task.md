# TASK-07.02-0047: Stage 14 core, container and async docs

Status: backlog
Type: docs
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Expand Stage 14 documentation for architecture, package boundaries, tokens, container,
scopes, async providers, async resources and disposal.

## Product Context

The core runtime behavior is implemented through Stage 13, but `docs/architecture.md`,
`docs/container.md` and `docs/async-model.md` are still skeleton or stage-summary pages.

## Scope

- Rewrite `docs/architecture.md` as a durable architecture guide.
- Rewrite `docs/container.md` for tokens, provider registration, lifetimes, multi-provider
  collections, scopes, scope-local values and sync resolution.
- Rewrite `docs/async-model.md` for `getAsync()`, eager/lazy async providers, resources,
  failure retry behavior and runtime/scope disposal.
- Include focused, correct code snippets that compile conceptually against implemented API.
- Cross-link to README, composer/modules docs and diagnostics where useful.
- Update docs navigation if the previous task created it.
- Update task run result memory after implementation.

## Out of Scope

- Composer/module deep guide beyond links and architecture context.
- Testing and Next integration deep guides.
- Creating example applications.
- Changing runtime behavior, public types or package exports.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Architecture docs explain package boundaries and layer responsibilities.
- [ ] Container docs cover tokens, `bind()`, `add()`, lifetimes, scopes and local values.
- [ ] Async docs cover eager/lazy providers, resources, `getAsync()`, disposal and retry
  behavior.
- [ ] Docs explicitly state that `get()` remains synchronous.
- [ ] Docs avoid Node-only assumptions for core.
- [ ] Snippets use implemented public API and do not rely on decorators or metadata.
- [ ] Relevant docs formatting checks pass.
- [ ] Verification is recorded in run result.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: pending
  - Purpose: Autonomous implementation run for core/container/async docs.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
