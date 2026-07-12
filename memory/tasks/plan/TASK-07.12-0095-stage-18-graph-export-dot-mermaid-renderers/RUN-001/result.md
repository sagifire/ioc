# Результат виконання: RUN-001

Related Task: [TASK-07.12-0095](../task.md)
Run Status: completed
Started: 2026-07-12
Agent Role: Implementation Agent

## Результат

Реалізовано pure deterministic DOT і Mermaid text renderers поверх
`GraphExportDocument v1`.

- `renderGraphExportDot()` і `renderGraphExportMermaid()` споживають тільки v1 DTO.
- Collision-safe node IDs походять із типу та semantic array position, а raw public IDs
  використовуються лише в escaped labels.
- Renderer options відокремлені від schema: DOT `graphName`/`direction`, Mermaid
  `direction`.
- Збережено semantic node/edge order, LF endings та один final newline.
- Capability, binding і adapter-source provenance відображається без створення нових
  dependency semantics; inconsistent endpoint provenance відхиляється.
- Synthetic adapter-source node створюється лише для unresolved або multi source, для яких
  v1 не має окремого top-level node.
- Жодного filesystem, Node-only API або Graphviz/Mermaid execution не додано.
- Root/subpath exports, package smoke та implemented-behavior docs оновлено.

## Перевірка

- `npm.cmd run typecheck` - passed.
- `npm.cmd run lint` - passed.
- `npm.cmd run format` - passed.
- `npm.cmd test` - passed: 22 files, 280 tests, усі examples.
- `npm.cmd run pack:dry-run` - passed: package contents, runtime і TypeScript root/subpath
  export smoke.
- `git -c safe.directory=D:/work/ioc diff --check` - passed.

Додано golden, Unicode/punctuation, collision, semantic-order, privacy, unsupported-schema,
all-edge-kind cross-renderer provenance та inconsistent-endpoint negative tests.

## Self-review

- Scope: included; schema redesign, CLI/filesystem, image rendering, hosted viewer,
  version/publish і TASK-0096 workflow helpers не додані.
- Acceptance: 10/10 covered.
- Semantics: JSON лишається canonical lossless source; renderers є presentation-only.
- Privacy: renderers бачать лише safe v1 document; sentinel tests не пропускають excluded
  metadata, descriptions або paths.
- Determinism: semantic arrays не сортуються; positional IDs стабільні й collision-safe для
  того самого document.
- Architecture pressure: renderer traversal спільний, окремих DOT/Mermaid graph models
  немає; adapter-source provenance не зведено до binding edge.
- Upward consistency: product/domain/architecture/rules/knowledge changes not-needed;
  implementation відповідає approved Stage 18 target memory.
- Language gate: Project Memory updates українською; API/syntax identifiers англійською.
- Residual risk: зовнішні DOT/Mermaid engines мають власні version-specific presentation
  details; core навмисно не виконує й не залежить від них.

## Independent audit

Перший audit знайшов HIGH: `adapter-source` помилково втрачав source provenance і
дублював binding-to-required-port geometry. Виправлено на source provider або edge-derived
source node -> adapter target; додано all-edge-kind coverage.

Re-audit знайшов MEDIUM: declared source provider міг мати mismatched token або missing
top-level node і перейти в synthetic fallback. Додано strict token/node consistency guards
та negative tests.

Final independent re-audit: passed; remaining findings немає. Auditor повторно виконав
targeted graph-export suite: 14/14 passed.

## Human review

Task передано в human review. Reviewed implementation і цей result заморожені до рішення
`approve | request changes | cancel`.

## Human approval and completion

Task-level decision: approved by user on 2026-07-12.

RUN-001 завершено без fixations; reviewed implementation content не змінювався після
approval.
