# TASK-07.12-0095: Stage 18 graph export DOT and Mermaid renderers

Task Status: backlog
Type: implementation
Created: 2026-07-12
Owner Role: Implementation Agent
Current Run: RUN-001

## Поточний стан

Run Status: prepared
Progress: Task package prepared; очікує завершення TASK-07.12-0094.
Acceptance: 0/10
Blockers: TASK-07.12-0094 not done
Blocked Phase: sequencing
Pending Decisions: none
Next Action: Активувати після human-approved completion TASK-07.12-0094.

## Мета

Додати pure DOT і Mermaid text renderers, які споживають лише approved v1 export document
і не створюють власних graph semantics.

## Вимоги та обсяг

- Central escaping і stable collision-safe node IDs для обох syntaxes.
- Preserve semantic order and safe labels; renderer options separate from schema.
- Cross-renderer provenance: кожен node/edge походить із v1 document.
- Golden, Unicode/punctuation, collision, privacy і cross-renderer tests.
- Pure text only; no filesystem, Graphviz/Mermaid execution or Node-only dependency.
- Public exports, package smoke checks і docs для implemented renderers.

## Поза обсягом

- Schema/projection redesign, CLI/files, PNG/SVG, hosted viewer, version/publish.

## Критерії приймання

- [ ] DOT renderer є pure projection v1 document.
- [ ] Mermaid renderer є pure projection v1 document.
- [ ] Stable IDs та escaping покрито edge cases.
- [ ] Semantic order не пошкоджено.
- [ ] Privacy boundary успадковано й протестовано.
- [ ] External renderers/filesystem не виконуються.
- [ ] Cross-renderer/golden tests проходять.
- [ ] Public exports/package smoke checks проходять.
- [ ] Docs описують implemented behavior and limitations.
- [ ] Self-review та independent audit passed; task передано в human review.

## Пов'язана пам'ять

- `memory/tasks/plan/TASK-07.12-0094-stage-18-graph-export-v1-schema-projection/task.md`
- `memory/tasks/plan/TASK-07.12-0093-stage-18-0-0-3-feature-portfolio-research/FIX-002.md`
- `memory/reports/research/2026-07-12-stage-18-0-0-3-feature-portfolio.md`
- `memory/technical/architecture.md`
- `memory/technical/rules.md`

## Прогони

- [RUN-001](RUN-001/index.md) - prepared - DOT/Mermaid renderer implementation.

## Human Review

Status: not-requested
Requested: n/a
Reviewed: n/a
Approval Source: n/a

## Фінальний результат

Completed: pending
Final Run: pending
Summary: pending
Residual Risks: pending
