# Basic Node Example

This example demonstrates the low-level container API in a small Node-shaped program:

- stable typed tokens through `namespace()`;
- value, factory and multi-provider registrations;
- synchronous `runtime.get()` / `runtime.getAll()` resolution;
- explicit scope-local values through `withScope()`;
- child scope overlays with inherited values, child overrides and separate scoped provider
  cache;
- runtime disposal after use.

The example has no external runtime dependencies. It imports `@sagifire/ioc` from the
workspace package.

## Typecheck

```sh
pnpm typecheck
```

For a focused check:

```sh
pnpm exec tsc -p examples/basic-node/tsconfig.json
```

## Run

Build the workspace package first, then compile and run the example:

```sh
pnpm build
pnpm exec tsc -p examples/basic-node/tsconfig.run.json
node .tmp/examples/basic-node/main.js
```

Expected behavior: the process exits successfully without output. If a provider,
multi-provider, scope-local value, child-scope overlay, scoped cache or disposal assertion
fails, the example throws an error.
