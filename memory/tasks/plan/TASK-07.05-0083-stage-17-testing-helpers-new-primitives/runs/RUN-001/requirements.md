# RUN-001 Requirements

Task: `TASK-07.05-0083-stage-17-testing-helpers-new-primitives`
Agent Role: Implementation Agent
Started: 2026-07-05

## Мета run

Додати `@sagifire/ioc-testing` helpers для нових Stage 17 primitives: multi-capability
contributors, graph-aware adapter edges і child scope behavior assertions через public API.

## Functional Requirements

- Додати graph assertion helper для перевірки існування multi capability.
- Додати graph assertion helper для перевірки contributor/provider module для multi
  capability.
- Додати graph assertion helper для перевірки adapter source edge.
- Додати helper для assertion child scope behavior через public scope APIs where
  appropriate.
- Додати test override helpers для multi contributions:
  - replace all test contributions for token before compose/freeze;
  - append test contribution before compose/freeze.
- Helpers мають читати тільки public `getGraph()` / `inspect()` output.
- Helpers не мають мутувати frozen production runtime.
- Package exports мають лишатися tree-shaking friendly.

## Test Requirements

- Додати tests для multi capability contributor assertions.
- Додати tests для adapter source edge assertions.
- Додати tests для multi override helpers у test composer integration.
- Додати tests для fake modules integration where relevant.
- Додати regression test, що frozen production runtime не мутується testing helpers.
- Запустити релевантні package checks and broader gates if feasible.

## Out Of Scope

- Reading private core graph internals.
- Mutating frozen production runtime.
- Docs/examples expansion beyond minimal testing docs sync.
- `MultiToken` / `ContributionToken` ergonomics.
- Core runtime behavior changes unless required to expose already intended public testing
  surface.
