# Run Requirements: RUN-001

Status: planned
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-02

## Goal for This Run

Close `M-001` from the Stage 16 audit by making failed eager async `freeze()` behavior
explicit and verified.

## Clarified Requirements

- This task is a pre-`0.0.1` blocker.
- Fix behavior or document/reclassify policy with rationale.
- Preserve immutable runtime guarantees after successful `freeze()`.
- Add regression tests for failed eager async initialization.
- Keep package versions unchanged.

## Scope for This Run

- `packages/ioc/src/container.ts` if runtime behavior changes.
- Async provider/resource tests.
- Public docs that describe `freeze()`, async initialization and retry semantics.
- Task result memory.

## Out of Scope for This Run

- Version `0.0.1` fixation.
- npm publish.
- Broad resource lifecycle redesign.
- Changes to composer/DSL unless required by freeze behavior tests.

## Acceptance Criteria for This Run

- [ ] `M-001` closure is recorded.
- [ ] Failed `freeze()` policy is explicit.
- [ ] Focused regression tests cover the selected policy.
- [ ] Relevant verification is recorded.
- [ ] Package versions remain unchanged.

## Changes from Previous Run

Не застосовується для RUN-001.
