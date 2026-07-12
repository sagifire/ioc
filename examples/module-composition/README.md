# Module Composition Example

This example demonstrates the object-configuration composer API:

- modules declare provided capabilities and consumer-owned required ports;
- application composition adapts a required port from another module's public capability
  with `composer.adapt(target).from(source).using(factory)`;
- multi capabilities declare `cardinality: 'multi'` and can receive module plus
  composition-root contributions;
- optional multi dependencies resolve as empty collections for provider factories;
- `validate()` and `inspect()` expose the graph before composition;
- graph inspection is exported through canonical JSON and pure DOT/Mermaid text renderers;
- the composed runtime resolves only declared public capabilities;
- required-port bindings and module-private providers stay hidden from public runtime
  resolution.

The example intentionally uses the object API first. The DSL can express the same graph,
but this example keeps the explicit module/composer shape visible.

## Typecheck

```sh
pnpm typecheck
```

For a focused check:

```sh
pnpm exec tsc -p examples/module-composition/tsconfig.json
```

## Run

Build the workspace package first, then compile and run the example:

```sh
pnpm build
pnpm exec tsc -p examples/module-composition/tsconfig.run.json
node .tmp/examples/module-composition/main.js
```

Expected behavior: the process exits successfully without output. If validation,
inspection, graph export, adapter-source edge visibility, multi contribution ordering, optional
multi-provider behavior, public capability resolution or capability-gating assertions fail,
the example throws an error.
