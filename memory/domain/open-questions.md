# Open Questions

- Для Stage 2 треба обрати build tool: `tsup` чи equivalent, з урахуванням ESM-first,
  `.d.ts`, source maps і subpath exports.
- Для Stage 4 треба явно задокументувати default lifetime для `toFactory()`,
  `toClass()` і async factories, якщо implementation decision відрізнятиметься від
  recommended default у `SPEC.md`.
- Для Stage 5 треба уточнити, чи `getAll()` повертає readonly array на runtime API.
- Для Stage 6 треба уточнити точні правила precedence для scope-local values: override,
  extend або fail-on-conflict.
- Для Stage 8 треба зафіксувати error code naming convention перед масовим додаванням
  typed errors.
- Для Stage 14 треба обрати інструмент type-level tests: `tsd`, `expect-type` або Vitest
  type assertions.
- Після human review Stage 1 треба вирішити, чи оновлювати root `AGENTS.md` і чи лишати
  root `SPEC.md` як historical/source reference.
