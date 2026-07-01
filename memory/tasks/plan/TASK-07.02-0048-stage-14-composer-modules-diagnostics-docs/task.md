# TASK-07.02-0048: Stage 14 composer, modules and diagnostics docs

Status: backlog
Type: docs
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Expand Stage 14 documentation for composer, modules, module graph inspection, DSL parity
and diagnostics.

## Product Context

Composer/modules and diagnostics are key differentiators of the library. Existing docs are
minimal and do not yet provide a coherent guide for required ports, capabilities, bindings,
inspection and readable diagnostics.

## Scope

- Rewrite `docs/composer.md` with composer lifecycle, validation, `prepare()`, `compose()`,
  `inspect()` and `getGraph()`.
- Rewrite `docs/modules.md` with module definitions, capabilities, required ports,
  private providers, module isolation and object API/DSL parity.
- Rewrite `docs/diagnostics.md` with typed errors, reports, formatting and graph-aware
  validation examples.
- Explain dependency edges and module cycle diagnostics without exposing private provider
  internals.
- Cross-link to testing assertions where diagnostic assertion helpers are relevant.
- Update task run result memory after implementation.

## Out of Scope

- Deep container/async docs already covered by previous Stage 14 task.
- Testing and Next integration deep docs.
- Example application creation.
- Adding new diagnostics or composer behavior.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [ ] Composer docs explain validation, preparation, composition and inspection flow.
- [ ] Modules docs explain required-port ownership, capabilities and private provider
  isolation.
- [ ] Diagnostics docs explain `SagifireIocError`, reports, formatter and representative
  composer diagnostics.
- [ ] DSL is documented as optional parity layer over object API.
- [ ] Docs state validation/inspection do not execute user factories for hidden dependency
  inference.
- [ ] Snippets use implemented public API.
- [ ] Relevant docs formatting checks pass.
- [ ] Verification is recorded in run result.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: pending
  - Purpose: Autonomous implementation run for composer/modules/diagnostics docs.
  - Result: pending

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
