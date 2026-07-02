# Specification Trace

## Purpose

This file maps root source documents to canonical Project Memory targets. It exists to
avoid hidden shortening of `SPEC.md` during Project Memory bootstrap.

Root `SPEC.md` remains available as source reference. Its Project Memory source snapshot is
`memory/sources/SPEC.md`.

`memory/sources/SPEC.md` is historical and immutable. Do not edit it during implementation
or ordinary memory-update tasks.

## Source Documents

- `AGENTS.md`
  - Canonical targets: `memory/memory-rules.md`, `memory/agents/rules.md`,
    `memory/technical/rules.md`, `memory/technical/architecture.md`.
- `SPEC.md`
  - Historical memory snapshot: `memory/sources/SPEC.md`.
  - Canonical targets: `memory/product/vision.md`, `memory/product/requirements.md`,
    `memory/product/roadmap.md`, `memory/domain/glossary.md`,
    `memory/domain/open-questions.md`, `memory/technical/architecture.md`,
    `memory/technical/stack.md`, `memory/technical/rules.md`,
    `memory/technical/testing.md`, `memory/technical/definition-of-done.md`.
- Human Stage 16 directive, 2026-07-02:
  - Canonical targets: `memory/product/requirements.md`, `memory/product/roadmap.md`,
    `memory/domain/glossary.md`, `memory/technical/stack.md`,
    `memory/technical/rules.md`, `memory/technical/testing.md`,
    `memory/technical/definition-of-done.md`.

## `SPEC.md` Section Map

- Section 1, project goal:
  - `memory/product/vision.md`
  - `memory/product/requirements.md`
- Section 2, main architecture idea:
  - `memory/technical/architecture.md`
  - `memory/technical/rules.md`
- Section 3, package boundaries:
  - `memory/technical/architecture.md`
  - `memory/product/requirements.md`
- Section 4, monorepo structure:
  - `memory/technical/stack.md`
  - `memory/product/roadmap.md`
- Section 5, runtime targets:
  - `memory/technical/stack.md`
  - `memory/technical/rules.md`
- Section 6, build and packaging requirements:
  - `memory/technical/stack.md`
  - `memory/product/requirements.md`
- Section 7, coding style:
  - `memory/technical/rules.md`
- Section 8, core design principles:
  - `memory/product/vision.md`
  - `memory/technical/rules.md`
- Section 9, tokens:
  - `memory/technical/architecture.md`
  - `memory/domain/glossary.md`
  - `memory/product/roadmap.md`
- Section 10, container:
  - `memory/technical/architecture.md`
  - `memory/domain/glossary.md`
  - `memory/product/roadmap.md`
- Section 11, async model:
  - `memory/technical/architecture.md`
  - `memory/product/requirements.md`
  - `memory/product/roadmap.md`
- Section 12, resources and disposal:
  - `memory/technical/architecture.md`
  - `memory/product/requirements.md`
- Section 13, context and scopes:
  - `memory/technical/architecture.md`
  - `memory/domain/glossary.md`
  - `memory/domain/open-questions.md`
- Section 14, composer:
  - `memory/technical/architecture.md`
  - `memory/domain/glossary.md`
  - `memory/product/requirements.md`
- Section 15, bindings:
  - `memory/technical/architecture.md`
  - `memory/domain/glossary.md`
- Section 16, dependency graph validation:
  - `memory/technical/architecture.md`
  - `memory/technical/testing.md`
- Section 17, diagnostics:
  - `memory/technical/architecture.md`
  - `memory/technical/rules.md`
  - `memory/domain/open-questions.md`
- Section 18, DSL:
  - `memory/technical/architecture.md`
  - `memory/technical/rules.md`
  - `memory/product/requirements.md`
- Section 19, inspection API:
  - `memory/technical/architecture.md`
- Sections 20-25, `@sagifire/ioc-next`:
  - `memory/technical/architecture.md`
  - `memory/product/requirements.md`
  - `memory/product/roadmap.md`
- Sections 26-29, `@sagifire/ioc-testing`:
  - `memory/technical/architecture.md`
  - `memory/technical/testing.md`
  - `memory/product/requirements.md`
  - `memory/product/roadmap.md`
- Sections 30-31, reference architecture examples:
  - `memory/technical/architecture.md`
- Sections 32-45, implementation stages:
  - `memory/product/roadmap.md`
- Section 45, release automation and publish readiness:
  - `memory/product/requirements.md`
  - `memory/technical/stack.md`
  - `memory/technical/rules.md`
  - `memory/technical/testing.md`
- Sections 46-49, testing requirements:
  - `memory/technical/testing.md`
- Section 50, Codex implementation rules:
  - `memory/technical/rules.md`
- Sections 51-53, definition of done:
  - `memory/technical/definition-of-done.md`
- Section 54, recommended first implementation command:
  - `memory/product/roadmap.md`
  - `memory/technical/rules.md`
  - `memory/technical/stack.md`
- Human Stage 16 directive, `0.0.1` stabilization audit and critical fixes:
  - `memory/product/requirements.md`
  - `memory/product/roadmap.md`
  - `memory/domain/glossary.md`
  - `memory/technical/stack.md`
  - `memory/technical/rules.md`
  - `memory/technical/testing.md`
  - `memory/technical/definition-of-done.md`

## Source Handling

`SPEC.md` and `AGENTS.md` are not deleted in this task.

Rules:

- `memory/sources/SPEC.md` is the Project Memory historical source snapshot.
- `memory/sources/SPEC.md` must not be edited.
- Canonical operational context lives in `memory/product/`, `memory/domain/` and
  `memory/technical/`.
- Root `AGENTS.md` is updated to point to Project Memory 3.0 and canonical memory docs.
- Root `SPEC.md` remains a source reference unless a later human-reviewed task changes its
  status.
