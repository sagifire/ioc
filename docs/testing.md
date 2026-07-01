# Testing

Status: Stage 12 overrides and test composer.

`@sagifire/ioc-testing` currently exposes isolated runtime helpers, explicit overrides and
a test composer helper:

- `createTestRuntime(configure?)`
- `createTestRuntime({ configure, overrides })`
- `override(token)`
- `createTestComposer(configure?)`
- `createTestComposer({ modules, configure, overrides })`

Runtime helpers create a fresh `@sagifire/ioc` container configuration per call, apply
explicit test configuration and override declarations before `freeze()` and return a
frozen `ContainerRuntime`.

```ts
const runtime = await createTestRuntime({
    overrides: [
        override(LOGGER).toValue(testLogger)
    ]
})
```

Test composer helpers create a fresh `createComposer()` configuration per call, apply
modules, explicit composer configuration and overrides before `compose()`, and keep
validation and graph inspection visible through the existing composer APIs.

```ts
const composer = createTestComposer({
    modules: [moduleUnderTest],
    overrides: [
        override(REQUIRED_PORT).toFactory((context) => {
            const dependency = context.get(TEST_DEPENDENCY)

            return createFakePort(dependency)
        })
    ]
})

const runtime = await composer.compose()
```

These helpers reuse core container/composer APIs and do not mutate existing frozen
`ContainerRuntime` or `ComposedRuntime` instances. Duplicate override declarations fail
deterministically. Fake modules, module harnesses and graph/diagnostic assertions are
planned for later Stage 12 tasks.
