# Stack

Source trace: `SPEC.md` sections 4-6 and 32-37.

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

Documentation:

- `docs/architecture.md`
- `docs/container.md`
- `docs/async-model.md`
- `docs/composer.md`
- `docs/modules.md`
- `docs/next-integration.md`
- `docs/testing.md`
- `docs/diagnostics.md`
- `docs/migration-from-di-container.md`

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

Broader type-level test tooling remains open for later stages if Vitest assertions are not
enough for more complex public API inference.
