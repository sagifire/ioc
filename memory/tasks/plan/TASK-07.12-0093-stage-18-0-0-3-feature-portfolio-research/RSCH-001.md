# Research: RSCH-001

Status: completed
Type: research
Related Task: [TASK-07.12-0093](task.md)
Related Run: [RUN-001](RUN-001/index.md)
Detailed Report: [Stage 18 feature portfolio research](../../../reports/research/2026-07-12-stage-18-0-0-3-feature-portfolio.md)
Created: 2026-07-12
Review Status: findings-resolved
Review Record: [RUN-001 result](RUN-001/result.md)

## Питання або мета

Визначити bounded feature portfolio для `@sagifire/ioc 0.0.3` серед async
multi-providers, lifetime dependency validation і graph export JSON/DOT/Mermaid.

## Обсяг

- Product, architecture, lifecycle, diagnostics, testing, documentation і agent-workflow
  аналіз трьох кандидатів.
- Поверхнева перевірка material competitive claims за актуальними primary sources.
- Candidate matrix, рішення `accept | design-first | defer | reject`, sequencing і
  follow-up proposals.
- Project Memory impact і exact fixation proposals без їх застосування.

## Ключові знахідки

- Async multi-providers мають високий product fit, але потребують design-first через
  collection lifecycle, concurrency, failure, retry й ownership semantics.
- Lifetime dependency validation потребує explicit provider dependency metadata; runtime
  lookup не доводить instance capture.
- Graph export готовий до bounded implementation як versioned safe projection чинного
  `ModuleGraph`, де JSON є canonical form, а DOT/Mermaid — pure text renderers.

## Розглянуті варіанти

- `accept`: graph export JSON/DOT/Mermaid.
- `design-first`: lifetime dependency validation.
- `design-first`: async multi-providers.
- `defer`: filesystem/CLI/rendering, private provider graph, async multi resources до
  окремих ownership decisions.
- `reject` для `0.0.3`: implicit async `getAll()`, partial arrays, factory inference,
  renderer-specific graph models і Node-only core dependencies.

## Рекомендація

Прийняти graph export як мінімальний coherent `0.0.3` slice. Async multi-provider і
lifetime-validation implementation дозволяти лише після окремих human-reviewed design
gates; вони не блокують graph export release slice.

## Обґрунтування

Graph export перевикористовує готову safe inspection model і дає найбільшу bounded користь
для CI, architecture review, Project Memory та coding agents. Два runtime candidates мають
високу цінність, але їхній ризик лежить у semantics, яких чинна metadata не визначає.

## Вплив на поточний run

- Яке рішення використано: differentiated portfolio `accept | design-first`.
- Що реалізовано або змінено: лише research/lifecycle artifacts.
- Що залишилося: independent audit, closure findings і human review.

## Вплив на Project Memory

Status: fixation-required
Related Fixations: [FIX-001](FIX-001.md), [FIX-002](FIX-002.md), [FIX-003](FIX-003.md)

## Ризики й відкриті питання

- Async multi-provider semantics можуть непропорційно розширити lifecycle state machine.
- Lifetime validation потребує explicit dependency metadata, щоб уникнути false positives.
- Export schema не повинен стати другою graph model або розкрити private runtime state.

Self-review цього артефакту централізовано в пов'язаному `result.md`.
