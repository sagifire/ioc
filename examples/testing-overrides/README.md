# Testing Overrides Example

This example demonstrates the `@sagifire/ioc-testing` helper workflow without patching
frozen runtimes:

- `createTestRuntime()` for isolated container-level tests;
- `createTestComposer()` and `override()` for required-port test bindings;
- `fakeModule()` for graph-visible fake providers;
- `createModuleHarness()` for one module under test;
- graph assertions and diagnostic assertions over public inspection data.

The example uses small in-memory test doubles only. It does not depend on Vitest at runtime
and does not mutate an existing `ContainerRuntime` or `ComposedRuntime`.

## Typecheck

```sh
pnpm typecheck
```

For a focused check:

```sh
pnpm exec tsc -p examples/testing-overrides/tsconfig.json
```

## Run

Build the workspace packages first, then compile and run the example:

```sh
pnpm build
pnpm exec tsc -p examples/testing-overrides/tsconfig.run.json
node .tmp/examples/testing-overrides/main.js
```

Expected behavior: the process exits successfully without output. If overrides, fake
modules, harness composition, graph assertions, diagnostic assertions or runtime isolation
fail, the example throws an error.
