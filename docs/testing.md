# Testing

Status: Stage 12 foundation.

`@sagifire/ioc-testing` currently exposes the initial isolated test runtime helper:

- `createTestRuntime(configure?)`
- `createTestRuntime({ configure })`

The helper creates a fresh `@sagifire/ioc` container configuration per call, applies the
explicit test configuration before `freeze()` and returns a frozen `ContainerRuntime`.

```ts
const runtime = await createTestRuntime((container) => {
    container.bind(LOGGER).toValue(testLogger)
})
```

This foundation reuses the core container runtime APIs and does not mutate existing frozen
`ContainerRuntime` or `ComposedRuntime` instances.

Overrides, test composer helpers, fake modules, module harnesses and graph/diagnostic
assertions are planned for later Stage 12 tasks.
