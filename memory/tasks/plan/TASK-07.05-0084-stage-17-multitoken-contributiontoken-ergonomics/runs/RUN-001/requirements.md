# RUN-001 Requirements

## Task

`TASK-07.05-0084-stage-17-multitoken-contributiontoken-ergonomics`

## Goal

Оцінити final core API після Stage 17 cardinality, adapter, child-scope і testing slices;
прийняти explicit рішення щодо optional `MultiToken` / `ContributionToken` helpers; якщо
рішення позитивне, реалізувати additive API без послаблення ordinary `token()` use cases.

## Functional Requirements

- Зафіксувати accept/defer/reject decision для helper API у run result.
- Якщо helper прийнятий, реалізувати його як additive public API.
- Зберегти ordinary `token()` повністю usable для multi capability declarations,
  `add()`, `getAll()` і module `provides` / `requires`.
- Додати type-level tests, які показують intended compile-time signal helper API.
- Зберегти runtime identity based on token ID.
- Не вимагати decorators, `reflect-metadata` або runtime metadata reflection.

## Constraints

- Не ламати existing `Token<TValue>` identity semantics.
- Не змінювати core cardinality model і не додавати duplicate runtime metadata без
  користі.
- Не робити broad overload complexity, яка погіршує JavaScript-friendly API.
- Не змінювати Next.js adapter або testing package без прямої потреби.

## Verification

- Запустити релевантні core package checks після зміни.
- Якщо зміна зачіпає public exports або package behavior, запустити broader quality gates,
  наскільки це практично в межах задачі.
