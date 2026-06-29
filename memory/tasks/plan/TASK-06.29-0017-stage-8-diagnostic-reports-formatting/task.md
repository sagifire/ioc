# TASK-06.29-0017: Stage 8 diagnostic reports and formatting

Status: done
Type: feature
Execution Mode: autonomous-implementation
Created: 2026-06-29
Owner Role: Product Lead Hat
Current Run: RUN-001
Current Research: n/a
Current Fixation: n/a

## Goal

Реалізувати другу частину Stage 8 diagnostics: `Diagnostic`, `DiagnosticReport`,
`DiagnosticSeverity`, readable `formatDiagnostics()` and a minimal bridge from typed errors
to diagnostics if needed.

## Product Context

After `TASK-06.29-0016`, Stage 3-7 common failure modes should share
`SagifireIocError`. This task turns that stable error model into structured diagnostic
reports and deterministic human/Codex-readable text.

Reports and formatting are still core diagnostics behavior. Composer/module graph
diagnostics remain out of scope until composer starts in Stage 9.

## Scope

- Implement public `DiagnosticSeverity` type.
- Implement public `Diagnostic` interface:
  - `code`;
  - `severity`;
  - `message`;
  - optional `details`.
- Implement public `DiagnosticReport` interface:
  - `ok`;
  - readonly diagnostics collection.
- Implement `formatDiagnostics(report: DiagnosticReport): string`.
- Add `diagnosticFromError(error)` or equivalent helper if a stable public bridge from
  `SagifireIocError` to `Diagnostic` is needed.
- Format reports deterministically.
- Format empty/ok reports clearly.
- Format multiple diagnostics in stable input order.
- Render details from existing Stage 3-7 errors readably:
  token IDs, token ID paths, expected/actual provider kinds, access methods, actions,
  lifecycle modes, invalid scope reasons and invalid token ID reasons.
- Keep formatter runtime-agnostic: no Node-only APIs, terminal colors, `process`, `Buffer`
  or framework dependencies.
- Export diagnostics report/formatter API through `@sagifire/ioc/diagnostics`.
- Re-export report/formatter API from root `@sagifire/ioc` if it does not harm
  tree-shaking boundaries.
- Add runtime tests for report shape, formatting, details rendering, unknown errors and
  multiple diagnostics.
- Add type-level assertions for `Diagnostic`, `DiagnosticReport`, `DiagnosticSeverity` and
  `formatDiagnostics()`.
- Update package export smoke tests for diagnostics report/formatter exports.
- Update minimal docs/README only if current public API text would otherwise become
  misleading.
- Update run result memory after implementation.

## Out of Scope

- Implementing or changing `SagifireIocError` foundation work already owned by
  `TASK-06.29-0016`, except for small integration fixes discovered during this task.
- Migrating existing error classes unless `TASK-06.29-0016` left a documented blocker.
- Composer/module graph diagnostics.
- Duplicate module ID, missing required port, invalid binding, private provider exposure
  or module cycle diagnostics before Stage 9.
- Runtime inspection APIs.
- Diagnostic assertions in `@sagifire/ioc-testing`.
- Terminal colors, rich TTY formatting, markdown renderer dependencies or Node-only
  formatting helpers.
- Changing provider resolution semantics, lifecycle behavior or disposal ownership.
- Editing `memory/sources/SPEC.md`.

## Stage 8 Report/Formatter Decisions

- `DiagnosticReport.ok` is derived by the creator/caller and should be `false` when any
  diagnostic severity is `error`.
- `formatDiagnostics()` is deterministic and side-effect free.
- Formatter output should prefer clarity over compactness.
- Formatter output should be readable in plain text logs and useful when pasted into Codex.
- Details rendering should be stable and bounded; it should not attempt a full object graph
  serializer.
- Unknown errors should not be falsely classified as IoC-specific errors.
- The task may add a minimal conversion helper from `SagifireIocError` to `Diagnostic` if
  direct report construction would otherwise create duplicate formatting logic in tests and
  userspace examples.

## Acceptance Criteria

- [ ] `DiagnosticSeverity` is exported from `@sagifire/ioc/diagnostics`.
- [ ] `Diagnostic` is exported from `@sagifire/ioc/diagnostics`.
- [ ] `DiagnosticReport` is exported from `@sagifire/ioc/diagnostics`.
- [ ] `formatDiagnostics()` is exported from `@sagifire/ioc/diagnostics`.
- [ ] Optional error-to-diagnostic helper is exported if implemented.
- [ ] Root export includes diagnostics report/formatter API or run result explains why it
  remains subpath-only.
- [ ] `formatDiagnostics()` produces readable output for single diagnostic reports.
- [ ] `formatDiagnostics()` produces readable output for multi-diagnostic reports in input
  order.
- [ ] `formatDiagnostics()` handles ok/empty reports clearly.
- [ ] Formatter renders Stage 3-7 error details readably.
- [ ] Formatter does not expose provider values or private runtime internals.
- [ ] Unknown errors are handled generically and not mislabeled as IoC-specific.
- [ ] Runtime tests cover report shape, formatting, details rendering and representative
  typed errors.
- [ ] Type-level assertions cover report and formatter public API.
- [ ] Package export smoke tests cover diagnostics report/formatter exports.
- [ ] Stage 8 task does not implement composer, DSL, adapters or testing helpers.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Linked Memory

- `memory/product/roadmap.md`
- `memory/product/requirements.md`
- `memory/domain/glossary.md`
- `memory/technical/architecture.md`
- `memory/technical/stack.md`
- `memory/technical/rules.md`
- `memory/technical/testing.md`
- `memory/technical/definition-of-done.md`
- `memory/tasks/plan/TASK-06.29-0016-stage-8-diagnostics-error-foundation/task.md`

## Runs

- [RUN-001](runs/RUN-001/index.md)
  - Status: completed
  - Purpose: Початковий autonomous implementation run для diagnostic reports and formatting.
  - Result: approved

## Research

Немає.

## Fixations

Немає. Memory sync для implementation run фіксується у `runs/RUN-001/result.md`.

## Additional Context

Ця задача має стартувати після task-level human review approval and completion of
`TASK-06.29-0016-stage-8-diagnostics-error-foundation`, якщо користувач явно не змінить
операційний порядок.
