# Run Requirements: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-06-29

## Goal for This Run

Реалізувати Stage 8 diagnostic report model and formatting: `DiagnosticSeverity`,
`Diagnostic`, `DiagnosticReport`, `formatDiagnostics()` and optional typed-error conversion
helper.

## Clarified Requirements

- Implement only Stage 8 diagnostic reports and formatting behavior in `@sagifire/ioc`.
- Build on the diagnostics foundation from `TASK-06.29-0016`.
- Keep core package runtime-agnostic and free of Node-only APIs, Next.js, React,
  decorators and `reflect-metadata`.
- Add public `DiagnosticSeverity`.
- Add public `Diagnostic`.
- Add public `DiagnosticReport`.
- Add public `formatDiagnostics(report)`.
- Add a minimal `diagnosticFromError(error)` or equivalent helper only if it creates a
  clear public bridge from `SagifireIocError` to reports.
- Keep report/formatter output deterministic.
- Keep details rendering readable and bounded.
- Handle ok/empty reports clearly.
- Handle multiple diagnostics in input order.
- Render existing typed error details readably.
- Handle unknown errors generically.
- Export report/formatter API from `@sagifire/ioc/diagnostics`.
- Update root exports if appropriate.
- Add runtime tests, type assertions and package export smoke tests.
- Do not implement composer/module graph diagnostics.

## Scope for This Run

- `packages/ioc/src/diagnostics.ts`.
- `packages/ioc/src/index.ts` if root export is needed.
- Tests under `packages/ioc/test/`.
- `test/package-exports.test.ts`.
- Minimal README/docs sync only if public diagnostics API documentation would otherwise be
  misleading.
- Task run result memory after implementation.

## Out of Scope for This Run

- Reworking `SagifireIocError` foundation except for small integration fixes.
- Migrating existing error classes, unless previous task result documents a blocker.
- Composer/modules/capabilities/required ports/bindings.
- Graph validation and runtime inspection APIs.
- DSL.
- Next.js adapter helpers.
- Testing package helpers.
- Terminal color output or TTY-aware formatting.
- Node-only serializers such as `util.inspect`.
- Release automation.
- Editing `memory/sources/SPEC.md`.

## Planned Public API Baseline

```ts
export type DiagnosticSeverity = 'error' | 'warning' | 'info'

export interface Diagnostic {
    readonly code: string
    readonly severity: DiagnosticSeverity
    readonly message: string
    readonly details?: unknown
}

export interface DiagnosticReport {
    readonly ok: boolean
    readonly diagnostics: readonly Diagnostic[]
}

export function formatDiagnostics(report: DiagnosticReport): string
```

Optional helper if implemented:

```ts
export function diagnosticFromError(error: unknown): Diagnostic
```

## Acceptance Criteria for This Run

- [ ] `DiagnosticSeverity` is exported.
- [ ] `Diagnostic` is exported.
- [ ] `DiagnosticReport` is exported.
- [ ] `formatDiagnostics()` is exported.
- [ ] Optional typed-error conversion helper is exported if implemented.
- [ ] `formatDiagnostics()` handles ok/empty reports.
- [ ] `formatDiagnostics()` handles one diagnostic.
- [ ] `formatDiagnostics()` handles multiple diagnostics in input order.
- [ ] `formatDiagnostics()` renders Stage 3-7 structured details readably.
- [ ] Unknown errors are represented generically where conversion helper is used.
- [ ] Formatter does not rely on Node-only APIs or terminal color support.
- [ ] Runtime tests cover reports and formatting.
- [ ] Type-level assertions cover report/formatter API.
- [ ] Package export smoke tests cover root and `./diagnostics` exports as applicable.
- [ ] Stage guard checks confirm composer, DSL, adapters and testing helpers were not
  implemented.
- [ ] `pnpm build` works.
- [ ] `pnpm test` works.
- [ ] `pnpm typecheck` works.
- [ ] `pnpm lint` works.

## Changes from Previous Run

Не застосовується для RUN-001.
