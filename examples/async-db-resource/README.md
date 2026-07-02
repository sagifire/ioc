# Async DB Resource Example

This example demonstrates async resource lifecycle without a real database server:

- lazy singleton database initialization through `toAsyncResource()`;
- explicit `runtime.getAsync()` access for async resources;
- retry after a failed lazy initialization attempt;
- scoped async unit-of-work resources through `scope.getAsync()`;
- automatic scoped disposal through `withScope()`;
- runtime disposal for initialized singleton resources.

The database is an in-memory fake. The example does not install or start external services.

## Typecheck

```sh
pnpm typecheck
```

For a focused check:

```sh
pnpm exec tsc -p examples/async-db-resource/tsconfig.json
```

## Run

Build the workspace packages first, then compile and run the example:

```sh
pnpm build
pnpm exec tsc -p examples/async-db-resource/tsconfig.run.json
node .tmp/examples/async-db-resource/main.js
```

Expected behavior: the process exits successfully without output. If async initialization,
retry, scoped disposal, runtime disposal or sync/async boundary assertions fail, the
example throws an error.
