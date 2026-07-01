# Stack

Source trace: `SPEC.md` sections 4-6 and 32-44.

## Product Stack

`@sagifire/ioc` is a TypeScript/ESM library monorepo managed with `pnpm`.

Planned packages:

- `@sagifire/ioc`
- `@sagifire/ioc-next`
- `@sagifire/ioc-testing`

## Runtime Targets

Core package `@sagifire/ioc` must be runtime-agnostic.

Supported targets:

- Node.js.
- Browser.
- Edge-compatible environments.
- Workers-compatible environments where possible.

Core package must not use:

- `fs`
- `path`
- `process`
- `Buffer`
- global mutable registry
- Next.js APIs
- React APIs

Platform-specific functionality belongs in adapter packages.

## Next Adapter Package

`@sagifire/ioc-next` is the Next.js App Router adapter package.

Stage 13 package policy:

- `@sagifire/ioc-next` depends on `@sagifire/ioc`.
- `@sagifire/ioc` must not depend on `@sagifire/ioc-next`, Next.js or React.
- Next.js/React dependencies should be peer dependencies, optional dependencies or
  type-only dev dependencies only when an implementation task proves they are needed.
- Adapter tests may use simulated request/action flows when that verifies the public
  lifecycle without requiring a full Next.js application.
- If a task needs to install or run Next.js, it must request permission for network or
  dependency changes instead of bypassing them.

## Package Manager

Use `pnpm`.

The repository must be a `pnpm` workspace.

## Module Format

Packages are ESM-first.

Each package `package.json` must include:

```json
{
    "type": "module",
    "sideEffects": false
}
```

## TypeScript Output

Packages must generate:

- JavaScript output.
- `.d.ts` type declarations.
- Source maps when they do not create unacceptable package-size or publishing issues.

## Subpath Exports

`@sagifire/ioc` must support tree-shaking friendly subpath exports:

- `.`
- `./tokens`
- `./container`
- `./context`
- `./composer`
- `./dsl`
- `./diagnostics`
- `./lifecycle`

The main entrypoint must not import heavy or optional parts unnecessarily.

## Planned Monorepo Shape

Top-level foundation:

- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `tsconfig.base.json`
- `tsconfig.json`
- `eslint.config.js`
- `prettier.config.js`
- `vitest.config.ts`
- `README.md`
- `LICENSE`
- `NOTICE`
- `CHANGELOG.md`

Packages:

- `packages/ioc`
- `packages/ioc-next`
- `packages/ioc-testing`

Examples:

- `examples/next-app-router`
- `examples/basic-node`
- `examples/module-composition`
- `examples/async-db-resource`
- `examples/testing-overrides`

Documentation:

- `docs/README.md` or equivalent docs navigation
- `docs/architecture.md`
- `docs/container.md`
- `docs/async-model.md`
- `docs/composer.md`
- `docs/modules.md`
- `docs/next-integration.md`
- `docs/testing.md`
- `docs/diagnostics.md`
- `docs/migration-from-di-container.md`

## Documentation And Example Tooling

Stage 14 documentation and examples should use existing workspace tooling before adding new
dependencies.

Preferred verification paths:

- markdown/docs formatting with existing formatter commands;
- TypeScript typecheck for example source where examples are wired into workspace
  configuration;
- targeted Vitest or package-boundary checks when examples expose behavior that is already
  testable without external services;
- documented manual check only when an example is intentionally a framework-shaped skeleton
  or cannot be executed without installing an external framework.

Stage 14 should not install Next.js, React, database clients, markdown linters or doc-site
frameworks unless a task documents a concrete need and asks for permission.

## Build Tooling

Stage 2 build tool: `tsup`.

`tsup` is used because the repository needs ESM-first library output, `.d.ts` generation,
subpath-export-friendly package builds and independent package build scripts.

If a later implementation discovers a concrete blocker, the replacement build tool must be
documented in the relevant task result and synced back to technical memory. Do not switch
build tooling silently.

## Test Tooling

Use Vitest for runtime tests.

Stage 3 token inference assertions use Vitest `expectTypeOf`.

Stage 4 container inference assertions use Vitest `expectTypeOf` for `runtime.get()`,
`runtime.tryGet()` and factory context `get()` / `tryGet()` inference.

Stage 5 multi-provider inference assertions use Vitest `expectTypeOf` for `add()`,
`runtime.getAll()` and factory context `getAll()` inference.

Stage 6 scopes inference assertions use Vitest `expectTypeOf` for
`runtime.createScope()`, `Scope.get()`, `Scope.tryGet()`, `Scope.getAll()`,
`runtime.withScope()` callback inference and scope-bound factory context inference.

Stage 7 async/resource inference assertions use Vitest `expectTypeOf` for
`toAsyncFactory()`, `toAsyncResource()`, `runtime.getAsync()`, `runtime.tryGetAsync()`,
`scope.getAsync()` and async factory context inference.

Stage 8 diagnostics assertions use Vitest `expectTypeOf` for `SagifireIocError`,
diagnostics error options/type guard, `DiagnosticSeverity`, `Diagnostic`,
`DiagnosticReport` and `formatDiagnostics()`.

Stage 9 composer/module assertions use Vitest `expectTypeOf` for `defineModule()`,
module metadata/required port/capability inference, `composer.bind()` token inference,
module setup context resolution, composed runtime token inference and inspection public
API.

Stage 10 module graph assertions use Vitest `expectTypeOf` for dependency edge public
types and cycle diagnostic public details where applicable. Runtime tests remain Vitest
tests and must cover deterministic graph edges, cycle diagnostics and non-execution of
factories during validation/inspection.

Stage 11 DSL assertions use Vitest `expectTypeOf` for `module()`, `defineApp()`, bind
helper DSL and `adapt()` inference. Runtime tests remain Vitest tests and must cover
DSL-to-object/composer conversion, graph inspection parity, export smoke tests and no
hidden factory execution during validation/inspection.

Stage 12 `@sagifire/ioc-testing` assertions use Vitest runtime tests and Vitest
`expectTypeOf` for testing package helper inference: isolated test runtime, overrides,
test composer, fake modules, module harnesses and graph/diagnostic assertion helper inputs.
The testing package should avoid a hard runtime dependency on Vitest internals unless an
implementation task explicitly documents why plain assertion helpers are insufficient.

Stage 13 `@sagifire/ioc-next` assertions use Vitest runtime tests and Vitest
`expectTypeOf` for Next adapter helper inference: cached runtime helper, request context
helper, route handler scope helper and server action scope helper. Runtime tests should
cover simulated route/action flows, scope disposal on success/failure, package exports and
package-boundary checks. A full running Next.js app is not required for Stage 13 unless a
specific implementation task documents why simulated flows are insufficient.

Broader type-level test tooling remains open for later stages if Vitest assertions are not
enough for more complex public API inference.
