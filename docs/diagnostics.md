# Diagnostics

Status: skeleton.

Implemented Stage 8 core diagnostics:

- `SagifireIocError`;
- `isSagifireIocError()`;
- `DiagnosticSeverity`;
- `Diagnostic`;
- `DiagnosticReport`;
- `diagnosticFromError()`;
- `formatDiagnostics()`.

Current formatting is deterministic plain text and runtime-agnostic. Composer/module graph
diagnostics remain planned for later roadmap stages.
