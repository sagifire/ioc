# Testing Requirements

Source trace: `SPEC.md` sections 46-49.

## Unit Tests

Cover:

- tokens;
- namespaces;
- provider registration;
- provider resolution;
- lifetimes;
- scopes;
- async providers;
- resources;
- disposal;
- diagnostics;
- DSL config conversion.

## Integration Tests

Cover:

- container + scope;
- container + async resources;
- composer + modules;
- composer + bindings;
- module isolation;
- runtime inspection;
- testing overrides;
- Next adapter with simulated route/action flow.

## Type Tests

Add type-level tests where practical.

Cover:

- token type inference;
- `runtime.get()` return type;
- `runtime.getAsync()` return type;
- factory context `get()` inference;
- module public API token inference;
- DSL inference.

Candidate tools:

- `tsd`;
- `expect-type`;
- Vitest type assertions.

Stage 3 choice:

- Use Vitest `expectTypeOf` for token type inference assertions.

Later stages may choose `tsd` or another dedicated type-test tool if Vitest assertions are
not enough for complex inference contracts.

## Tree-Shaking Tests

Verify:

- importing `@sagifire/ioc/tokens` does not include composer;
- importing `@sagifire/ioc/container` does not include Next adapter;
- core package does not import Next.js;
- `@sagifire/ioc-next` is separate;
- `sideEffects: false` is valid.

## Stage Rule

Every behavior-changing stage must add or update relevant tests. Stage 2 foundation should
add smoke tests or placeholder tests only if they validate package/export/build plumbing and
do not implement container logic.

Stage 3 must add runtime tests for token creation, namespace ID composition and invalid ID
rejection, plus type-level assertions for token value inference.
