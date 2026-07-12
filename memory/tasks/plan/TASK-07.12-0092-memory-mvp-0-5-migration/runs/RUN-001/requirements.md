# Вимоги прогону: RUN-001

Status: completed
Agent Role: Agent Executor
Execution Mode: autonomous-implementation
Created: 2026-07-12

## Мета цього run

Зафіксувати source inventory і rollback, підготувати контрольований merge зі StarterKit MVP 0.5 та виконати operational cutover без втрати project-specific content.

## Уточнені вимоги

- Виконувати direct migration guide `0.4 -> 0.5`.
- Не розпаковувати StarterKit поверх `memory/`.
- Не переписувати completed, canceled або archived task artifacts.
- Класифікувати старі operational і project-specific правила до видалення legacy active paths.
- Після cutover створити наступний root-level run за target rules для verification і review.
- Якщо потрібна конвертація незавершених задач, делегувати її субагентам послідовними групами по 3-5 задач.

## Критерії приймання

- [x] Source inventory і rollback зафіксовані.
- [x] Merge/classification map підготовлена до destructive structural changes.
- [x] Operational cutover оформлений як required exact `FIX-001`; застосування очікує approval.
- [x] Target verification передана root-level `RUN-002`.
