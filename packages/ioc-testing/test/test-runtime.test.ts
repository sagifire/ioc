import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    RuntimeDisposedError,
    createContainer,
    token,
    type BindingBuilder,
    type ContainerBuilder,
    type ContainerRuntime
} from '@sagifire/ioc'
import {
    createTestRuntime,
    override,
    DuplicateTestOverrideError,
    type CreateTestRuntimeOptions,
    type TestOverride,
    type TestRuntimeConfigurator
} from '../src/index.js'

interface Logger {
    readonly name: string
}

interface Counter {
    readonly value: number
}

interface ResourceValue {
    readonly label: string
}

class ClassLogger implements Logger {
    readonly name = 'class'
}

const LOGGER = token<Logger>('testing.runtime.logger')
const CLASS_LOGGER = token<Logger>('testing.runtime.class-logger')
const COUNTER = token<Counter>('testing.runtime.counter')
const ASYNC_COUNTER = token<Counter>('testing.runtime.async-counter')
const RESOURCE = token<ResourceValue>('testing.runtime.resource')
const MISSING = token<Logger>('testing.runtime.missing')

describe('test runtime foundation', () => {
    test('creates an isolated runtime from explicit callback configuration', async () => {
        const logger: Logger = {
            name: 'callback'
        }
        const runtime = await createTestRuntime((container) => {
            expectTypeOf(container).toEqualTypeOf<ContainerBuilder>()

            container.bind(LOGGER).toValue(logger)
        })

        expectTypeOf(createTestRuntime()).toEqualTypeOf<Promise<ContainerRuntime>>()
        expectTypeOf(runtime).toEqualTypeOf<ContainerRuntime>()
        expectTypeOf(runtime.get(LOGGER)).toEqualTypeOf<Logger>()
        expectTypeOf(runtime.tryGet(MISSING)).toEqualTypeOf<Logger | undefined>()
        expect(Object.isFrozen(runtime)).toBe(true)
        expect(runtime.get(LOGGER)).toBe(logger)
        expect(runtime.tryGet(MISSING)).toBeUndefined()

        await runtime.dispose()
    })

    test('supports options object configuration and existing core provider APIs', async () => {
        const options: CreateTestRuntimeOptions = {
            configure(container): void {
                expectTypeOf(container.bind(COUNTER)).toEqualTypeOf<BindingBuilder<Counter>>()

                container.bind(COUNTER).toFactory(() => ({
                    value: 1
                }))
            }
        }

        const runtime = await createTestRuntime(options)

        expectTypeOf(createTestRuntime(options)).toEqualTypeOf<Promise<ContainerRuntime>>()
        expect(runtime.get(COUNTER)).toEqual({
            value: 1
        })
        expect(runtime.get(COUNTER)).toEqual({
            value: 1
        })
        expect(runtime.get(COUNTER)).not.toBe(runtime.get(COUNTER))

        await runtime.dispose()
    })

    test('applies explicit overrides before freeze', async () => {
        const logger: Logger = {
            name: 'override'
        }
        const loggerOverride = override(LOGGER).toValue(logger)
        const counterOverride = override(COUNTER).toFactory((context) => {
            expectTypeOf(context.get(LOGGER)).toEqualTypeOf<Logger>()

            return {
                value: context.get(LOGGER).name.length
            }
        })
        const asyncCounterOverride = override(ASYNC_COUNTER).toAsyncFactory(async (context) => {
            expectTypeOf(await context.getAsync(COUNTER)).toEqualTypeOf<Counter>()

            return {
                value: context.get(COUNTER).value + 1
            }
        })

        expectTypeOf(loggerOverride).toMatchTypeOf<TestOverride<Logger>>()
        expectTypeOf(loggerOverride.value).toEqualTypeOf<Logger>()

        const runtime = await createTestRuntime({
            overrides: [
                loggerOverride,
                counterOverride,
                asyncCounterOverride,
                override(CLASS_LOGGER).toClass(ClassLogger)
            ]
        })

        expect(runtime.get(LOGGER)).toBe(logger)
        expect(runtime.get(COUNTER)).toEqual({
            value: 8
        })
        expect(await runtime.getAsync(ASYNC_COUNTER)).toEqual({
            value: 9
        })
        expect(runtime.get(CLASS_LOGGER)).toBeInstanceOf(ClassLogger)

        await runtime.dispose()
    })

    test('rejects duplicate override declarations before configuration runs', async () => {
        let configureCalls = 0

        await expect(
            createTestRuntime({
                configure(container): void {
                    configureCalls += 1
                    container.bind(LOGGER).toValue({
                        name: 'configure'
                    })
                },
                overrides: [
                    override(LOGGER).toValue({
                        name: 'first'
                    }),
                    override(LOGGER).toFactory(() => ({
                        name: 'second'
                    }))
                ]
            })
        ).rejects.toMatchObject({
            name: 'DuplicateTestOverrideError',
            code: 'SAGIFIRE_IOC_TESTING_DUPLICATE_OVERRIDE',
            tokenId: LOGGER.id,
            details: {
                tokenId: LOGGER.id
            }
        })
        await expect(
            createTestRuntime({
                overrides: [
                    override(COUNTER).toValue({
                        value: 1
                    }),
                    override(COUNTER).toValue({
                        value: 2
                    })
                ]
            })
        ).rejects.toThrow(DuplicateTestOverrideError)
        expect(configureCalls).toBe(0)
    })

    test('creates fresh configuration and fresh runtime per helper call', async () => {
        let configureCalls = 0
        const configure: TestRuntimeConfigurator = (container) => {
            configureCalls += 1
            container.bind(COUNTER).toValue({
                value: configureCalls
            })
        }

        const firstRuntime = await createTestRuntime(configure)
        const secondRuntime = await createTestRuntime(configure)

        expect(firstRuntime).not.toBe(secondRuntime)
        expect(firstRuntime.get(COUNTER)).toEqual({
            value: 1
        })
        expect(secondRuntime.get(COUNTER)).toEqual({
            value: 2
        })
        expect(configureCalls).toBe(2)

        await firstRuntime.dispose()
        await secondRuntime.dispose()
    })

    test('does not mutate an existing frozen runtime', async () => {
        const productionContainer = createContainer()
        const productionLogger: Logger = {
            name: 'production'
        }
        const testLogger: Logger = {
            name: 'test'
        }

        productionContainer.bind(LOGGER).toValue(productionLogger)

        const productionRuntime = await productionContainer.freeze()
        const testRuntime = await createTestRuntime((container) => {
            container.bind(LOGGER).toValue(testLogger)
        })

        expect(productionRuntime.get(LOGGER)).toBe(productionLogger)
        expect(testRuntime.get(LOGGER)).toBe(testLogger)
        expect(productionRuntime.get(LOGGER)).toBe(productionLogger)

        await testRuntime.dispose()
        await productionRuntime.dispose()
    })

    test('does not mutate an existing frozen runtime when overrides are used', async () => {
        const productionRuntime = await createTestRuntime({
            overrides: [
                override(LOGGER).toValue({
                    name: 'production'
                })
            ]
        })
        const testRuntime = await createTestRuntime({
            overrides: [
                override(LOGGER).toValue({
                    name: 'test'
                })
            ]
        })

        expect(productionRuntime.get(LOGGER)).toEqual({
            name: 'production'
        })
        expect(testRuntime.get(LOGGER)).toEqual({
            name: 'test'
        })
        expect(productionRuntime.get(LOGGER)).toEqual({
            name: 'production'
        })

        await testRuntime.dispose()
        await productionRuntime.dispose()
    })

    test('keeps runtime disposal behavior from the core container', async () => {
        let disposed = false
        const runtime = await createTestRuntime(async (container) => {
            container
                .bind(RESOURCE)
                .toAsyncResource(async () => ({
                    value: {
                        label: 'resource'
                    },
                    dispose(): void {
                        disposed = true
                    }
                }))
                .singleton()
                .eager()
        })

        expect(runtime.get(RESOURCE)).toEqual({
            label: 'resource'
        })
        expect(disposed).toBe(false)

        await runtime.dispose()

        expect(disposed).toBe(true)
        expect(() => runtime.get(RESOURCE)).toThrow(RuntimeDisposedError)
    })
})
