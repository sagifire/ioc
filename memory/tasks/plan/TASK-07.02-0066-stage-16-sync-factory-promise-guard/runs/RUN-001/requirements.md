# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-02

## Goal for This Run

Close `H-001` from the Stage 16 audit: prevent or explicitly policy-close Promise returns
from sync `toFactory()` through `runtime.get()`.

## Clarified Requirements

- This task is a pre-`0.0.1` blocker.
- Fix root cause or record explicit reclassification with rationale in the task result.
- Prefer preserving the public contract that `runtime.get()` is synchronous.
- Add regression tests for the selected behavior.
- Keep package versions unchanged.

## Scope for This Run

- `packages/ioc/src/container.ts` and related diagnostics only if runtime policy changes.
- Focused runtime/type tests for sync factory misuse.
- Public docs that state sync/async resolution semantics.
- Task result memory.

## Out of Scope for This Run

- Version `0.0.1` fixation.
- npm publish.
- Broad container refactors unrelated to sync factory Promise handling.
- Changes to Next/testing packages unless required by tests or docs links.

## Acceptance Criteria for This Run

- [ ] `H-001` closure is recorded.
- [ ] Runtime/docs policy is explicit.
- [ ] Regression coverage exists for JavaScript/untyped-like misuse.
- [ ] Relevant verification is recorded.
- [ ] Package versions remain unchanged.

## Changes from Previous Run

Не застосовується для RUN-001.
