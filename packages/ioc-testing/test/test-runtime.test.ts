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
    type CreateTestRuntimeOptions,
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

const LOGGER = token<Logger>('testing.runtime.logger')
const COUNTER = token<Counter>('testing.runtime.counter')
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
