# RUN-001 Requirements

## Task

`TASK-07.05-0085-stage-17-dsl-ergonomics-hardening`

## Goal

Оновити optional DSL після стабілізації object API для `0.0.2`, зберігши його тонким
шаром над explicit object-configuration API без прихованого graph inference.

## Functional Requirements

- Додати DSL support для finalized object API cardinality declarations, якщо це вже
  стабільна public поведінка.
- Прийняти explicit рішення щодо graph-aware adapter DSL helper: реалізувати additive
  helper зараз або свідомо відкласти.
- Зберегти existing DSL `adapt(token, factory)` backward compatible.
- Якщо додається новий adapter DSL shape, уникнути naming confusion з existing helper і
  зафіксувати migration path у run result.
- Забезпечити, що DSL компілюється в object configuration і не створює окремий graph
  model.
- Додати type/runtime tests для DSL parity з object API.

## Constraints

- Не робити DSL required API і не замінювати object API.
- Не додавати hidden graph inference або factory execution during validation/inspection.
- Не змінювати docs/examples full update; це scope `TASK-07.05-0086`.
- Не додавати decorators, `reflect-metadata`, Node-only API або global mutable state.
- Object-configuration API має лишатися fully usable без DSL.

## Verification

- Запустити релевантні core package checks після зміни.
- Якщо зміна зачіпає public exports або package behavior, запустити broader quality gates,
  наскільки це практично в межах задачі.
