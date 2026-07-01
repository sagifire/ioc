# Testing

Status: Stage 12 module harness and fake modules.

`@sagifire/ioc-testing` currently exposes isolated runtime helpers, explicit overrides, a
test composer helper, fake modules and a module harness helper:

- `createTestRuntime(configure?)`
- `createTestRuntime({ configure, overrides })`
- `override(token)`
- `createTestComposer(configure?)`
- `createTestComposer({ modules, configure, overrides })`
- `fakeModule(definition)` / `fakeModule(id, definition)`
- `createModuleHarness({ module, supportModules, fakeModules, overrides })`

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

Fake modules are normal explicit module definitions. They declare provided capabilities and
generate setup that binds fake values, factories or async factories through the existing
module setup API:

```ts
const fakeAuthModule = fakeModule('test-auth', {
    provides: [
        {
            token: AUTH_READER,
            useValue: fakeAuthReader
        }
    ]
})
```

Module harnesses compose one module under test with optional support modules, fake modules
and explicit required-port overrides:

```ts
const harness = createModuleHarness({
    module: contactRequestsModule,
    fakeModules: [fakeAuthModule]
})

const runtime = await harness.compose()
```

These helpers reuse core container/composer APIs and do not mutate existing frozen
`ContainerRuntime` or `ComposedRuntime` instances. Duplicate override declarations fail
deterministically. Fake modules remain visible through existing composer/runtime
inspection APIs and module-private providers remain hidden behind normal composed runtime
capability access. Graph/diagnostic assertions are planned for later Stage 12 tasks.
