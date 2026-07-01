# Diagnostics

Status: Stage 12 diagnostic assertions.

Implemented Stage 8 core diagnostics:

- `SagifireIocError`;
- `isSagifireIocError()`;
- `DiagnosticSeverity`;
- `Diagnostic`;
- `DiagnosticReport`;
- `diagnosticFromError()`;
- `formatDiagnostics()`.

Current formatting is deterministic plain text and runtime-agnostic. Composer/module graph
diagnostics are exposed through public validation reports and typed errors.

`@sagifire/ioc-testing` adds plain assertion helpers over this public data:

- `assertDiagnosticReportOk(report)`
- `assertDiagnosticReportHasDiagnostic(report, expectation)`
- `assertErrorDiagnostic(error, expectation)`

These helpers throw deterministic `Error` subclasses and do not depend on Vitest internals.
