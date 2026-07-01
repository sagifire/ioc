# Run Requirements: RUN-001

Status: pending
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-02

## Goal for This Run

Add `async-db-resource` and `testing-overrides` examples.

## Clarified Requirements

- Use fake/in-memory resources unless a real dependency is explicitly justified.
- Demonstrate disposal and testing overrides through public APIs.
- Avoid mutating frozen runtimes.
- Avoid new network/dependency installation unless approved.

## Scope for This Run

- `examples/async-db-resource/`
- `examples/testing-overrides/`
- related README/docs navigation links
- task run result memory after implementation

## Out of Scope for This Run

- Basic/module examples.
- Next example hardening.
- Public API changes.

## Acceptance Criteria for This Run

- [ ] Async resource example is present and verified.
- [ ] Testing overrides example is present and verified.
- [ ] Example docs explain commands and behavior.
- [ ] Verification is recorded in `result.md`.

## Changes from Previous Run

Не застосовується для RUN-001.
