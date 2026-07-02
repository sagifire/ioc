# TASK-07.02-0050: Stage 14 basic-node and module-composition examples

Status: done
Type: docs
Execution Mode: autonomous-implementation
Created: 2026-07-02
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Create Stage 14 examples for basic runtime/container usage and explicit module
composition.

## Product Context

Roadmap Stage 14 requires examples including `basic-node` and `module-composition`.
Examples should be small, inspectable and useful as executable documentation.

## Scope

- Add `examples/basic-node` demonstrating tokens, container configuration, sync
  resolution and disposal where relevant.
- Add `examples/module-composition` demonstrating modules, capabilities, required ports,
  explicit binding adapter, validation/inspection and composed runtime resolution.
- Include concise READMEs for both examples.
- Prefer workspace-local package imports and existing tooling.
- Add example-level scripts/config only when they are needed and remain lightweight.
- Verify examples by running or typechecking them where practical.
- Update docs navigation and root README links if needed.
- Update task run result memory after implementation.

## Out of Scope

- Async database/resource example.
- Testing overrides example.
- Next App Router example hardening.
- Adding new package runtime behavior.
- Installing external runtime dependencies unless the task asks permission first.
- Editing `memory/sources/SPEC.md`.

## Acceptance Criteria

- [x] `examples/basic-node` exists and demonstrates basic implemented API.
- [x] `examples/module-composition` exists and demonstrates module composition with
  required ports and bindings.
- [x] Examples keep dependency graph explicit and do not use auto-discovery.
- [x] Examples are runnable or typechecked through documented commands where practical.
- [x] Example READMEs explain purpose, command and expected behavior.
- [x] Root/docs navigation links to the examples.
- [x] Verification is recorded in run result.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/tasks/plan/TASK-07.02-0045-stage-14-implementation-planning/fixations/FIX-001.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Autonomous implementation run for basic-node and module-composition examples.
  - Result: approved after task-level human review

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.
