# RSCH-001: Architecture pressure і residual-risk decision research

Status: completed
Related Task: [TASK-07.15-0111](task.md)
Related Run: [RUN-001](RUN-001/index.md)
Created: 2026-07-15
Disposition: final-result

## Питання

Яке окреме evidence-based рішення потрібне для кожного `APR-001..APR-005`, зафіксованого
TASK-0110, без перетворення architecture pressure на необґрунтований refactor і без
маскування residual risk формальним `no-action`?

## Висновок

Запропоновано п'ять окремих classifications:

- `APR-001` — `не потребує уваги`;
- `APR-002` — `потрібне окреме глибоке дослідження для прийняття рішення`;
- `APR-003` — `не потребує уваги`;
- `APR-004` — `не потребує уваги`;
- `APR-005` — `виправити в 0.0.3`.

`APR-001`, `APR-003` і `APR-004` не відкинуті: для них встановлено residual monitoring
triggers. Для `APR-002` і `APR-005` підготовлено по одному bounded derived-task proposal;
до human approval task packages не створюються.

## Ключові підстави

- Declarative metadata чесно позиціонується як auditable declaration, а не runtime proof;
  source parsing, tracing або factory execution суперечили б architecture boundaries.
- `container.ts` і `composer.ts` мають вимірюваний maintenance pressure: 3198 і 5709 рядків;
  `createRuntime()` охоплює приблизно 1198 рядків і 109 branch points, але current audit і
  167 focused regressions не показали behavioral defect, тому implementation без окремого
  decomposition design є передчасною.
- Sequential async collection contract детермінований і добре покритий; repository не має
  benchmark або production latency evidence, що виправдовує scheduler зараз.
- No-partial-return навмисно є return atomicity. Бібліотека rollback-ить лише власні
  unpublished resources; довільні зовнішні side effects не мають універсального inverse.
- Graph export уже має мінімальне правило `incompatible change -> new schema version`, але
  не має повного version-lifecycle contract перед першим публічним opt-in v2 handoff.

## Артефакти

- [Detailed report](../../../reports/research/2026-07-15-stage-18-architecture-pressure-residual-risks-decision-research.md)
- [FIX-001](FIX-001.md) — conditional/required only if `APR-005` classification is approved.
