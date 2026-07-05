# Run Requirements: RUN-001

Status: completed
Agent Role: Implementation Agent
Execution Mode: autonomous-implementation
Created: 2026-07-05

## Goal for This Run

Реалізувати explicit composition-root API `composer.add(token)` для public multi
capability contributions із deterministic ordering, runtime gating parity, typed
diagnostics and public inspection identity.

## Clarified Requirements

- `Composer.add<TValue>(token)` exposes a public builder API equivalent to existing
  module `context.add()`.
- `composer.add()` works only for tokens declared as public `multi` capabilities.
- Invalid root additions for undeclared tokens, public `single` capabilities,
  required-only ports and module-private tokens fail with typed diagnostics.
- Composition-root additions are registered after all module `setup()` contributions.
- Ordering remains deterministic: module order, setup registration order, then
  composition-root registration order.
- `runtime.getAll(token)` returns module and root contributions in that order.
- `runtime.get(token)` / `tryGet()` / async single-value access for public multi tokens
  keeps existing runtime gating behavior.
- Public graph/runtime inspection exposes composition-root source, registration kind and
  registration index without leaking private providers.
- Validation and inspection must not execute user factories.
- Existing `composer.bind()` behavior remains backward compatible.
- Type-level tests cover `Composer.add()` value/factory inference.

## Scope for This Run

- Core composer object API and public `Composer` type.
- Composition-root provider validation, graph inspection and runtime inspection metadata.
- Focused Vitest coverage for valid/invalid `composer.add()` behavior, ordering, runtime
  gating and inspection.
- Type-level coverage in existing type test structure.
- Task result memory and status handoff to review.

## Out of Scope for This Run

- Graph-aware adapter API.
- Adapter source validation and adapter-aware cycle diagnostics.
- `MultiToken` / `ContributionToken` ergonomics.
- DSL helper changes unless required for object API parity.
- Documentation/examples expansion beyond task memory.
- Historical source snapshot edits.

## Acceptance Criteria for This Run

- [x] `Composer` exposes public `add(token)` API for composition-root multi contributions.
- [x] `composer.add(token)` succeeds for declared public `multi` capability tokens.
- [x] `composer.add(token)` fails with typed diagnostic for single, undeclared,
      required-only or private tokens.
- [x] Composition-root contributions resolve through `runtime.getAll(token)` after module
      contributions.
- [x] Contribution order is deterministic and tested across modules and composition root.
- [x] `runtime.get(token)` for multi token with root contributions still fails with
      `SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN`.
- [x] Public inspection exposes composition-root provider identity and ordering.
- [x] Validation and inspection do not execute user factories.
- [x] Existing `composer.bind()` behavior remains backward compatible.
- [x] Type-level tests cover `Composer.add()` inference.

## Changes from Previous Run

Не застосовується для RUN-001.
