import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    createComposer,
    createContainer,
    defineModule,
    token,
    type ComposedRuntime,
    type ContainerRuntime
} from '@sagifire/ioc'
import { createNextRuntime, type NextRuntimeFactory, type NextRuntimeHelper } from '../src/index.js'

interface Logger {
    readonly name: string
}

interface PublicApi {
    value(): string
}

interface Deferred<TValue> {
    readonly promise: Promise<TValue>
    resolve(value: TValue): void
    reject(reason?: unknown): void
}

const LOGGER = token<Logger>('next.runtime.logger')
const PUBLIC_API = token<PublicApi>('next.runtime.public-api')

describe('Next runtime foundation', () => {
    test('caches and reuses successful runtime initialization', async () => {
        let factoryCalls = 0
        const factory: NextRuntimeFactory<ContainerRuntime> = async () => {
            factoryCalls += 1

            return createContainerRuntime(`runtime-${factoryCalls}`)
        }
        const helper = createNextRuntime(factory)

        expectTypeOf(helper).toEqualTypeOf<NextRuntimeHelper<ContainerRuntime>>()
        expectTypeOf(helper.getRuntime()).toEqualTypeOf<Promise<ContainerRuntime>>()

        const firstRuntime = await helper.getRuntime()
        const secondRuntime = await helper.getRuntime()

        expect(firstRuntime).toBe(secondRuntime)
        expect(firstRuntime.get(LOGGER)).toEqual({
            name: 'runtime-1'
        })
        expect(factoryCalls).toBe(1)

        await firstRuntime.dispose()
    })

    test('deduplicates concurrent in-flight initialization', async () => {
        const runtime = await createContainerRuntime('shared')
        const deferred = createDeferred<ContainerRuntime>()
        let factoryCalls = 0
        const helper = createNextRuntime(() => {
            factoryCalls += 1

            return deferred.promise
        })

        const firstRuntimePromise = helper.getRuntime()
        const secondRuntimePromise = helper.getRuntime()

        expect(firstRuntimePromise).toBe(secondRuntimePromise)
        expect(factoryCalls).toBe(1)

        deferred.resolve(runtime)

        await expect(firstRuntimePromise).resolves.toBe(runtime)
        await expect(secondRuntimePromise).resolves.toBe(runtime)
        await expect(helper.getRuntime()).resolves.toBe(runtime)
        expect(factoryCalls).toBe(1)

        await runtime.dispose()
    })

    test('does not cache failed initialization and allows retry', async () => {
        let factoryCalls = 0
        const helper = createNextRuntime(async () => {
            factoryCalls += 1

            if (factoryCalls === 1) {
                throw new Error('next runtime boot failed')
            }

            return createContainerRuntime(`retry-${factoryCalls}`)
        })

        await expect(helper.getRuntime()).rejects.toThrow('next runtime boot failed')

        const runtime = await helper.getRuntime()
        const cachedRuntime = await helper.getRuntime()

        expect(runtime).toBe(cachedRuntime)
        expect(runtime.get(LOGGER)).toEqual({
            name: 'retry-2'
        })
        expect(factoryCalls).toBe(2)

        await runtime.dispose()
    })

    test('reset clears helper cache without mutating existing frozen runtimes', async () => {
        let factoryCalls = 0
        const helper = createNextRuntime(async () => {
            factoryCalls += 1

            return createContainerRuntime(`reset-${factoryCalls}`)
        })

        const firstRuntime = await helper.getRuntime()

        helper.reset()

        const secondRuntime = await helper.getRuntime()

        expect(firstRuntime).not.toBe(secondRuntime)
        expect(firstRuntime.get(LOGGER)).toEqual({
            name: 'reset-1'
        })
        expect(secondRuntime.get(LOGGER)).toEqual({
            name: 'reset-2'
        })
        expect(factoryCalls).toBe(2)

        await secondRuntime.dispose()
        await firstRuntime.dispose()
    })

    test('reset during in-flight initialization prevents stale result from becoming cached', async () => {
        const firstRuntime = await createContainerRuntime('first')
        const secondRuntime = await createContainerRuntime('second')
        const firstDeferred = createDeferred<ContainerRuntime>()
        const secondDeferred = createDeferred<ContainerRuntime>()
        let factoryCalls = 0
        const helper = createNextRuntime(() => {
            factoryCalls += 1

            if (factoryCalls === 1) {
                return firstDeferred.promise
            }

            return secondDeferred.promise
        })

        const firstRuntimePromise = helper.getRuntime()

        helper.reset()

        const secondRuntimePromise = helper.getRuntime()

        firstDeferred.resolve(firstRuntime)
        secondDeferred.resolve(secondRuntime)

        await expect(firstRuntimePromise).resolves.toBe(firstRuntime)
        await expect(secondRuntimePromise).resolves.toBe(secondRuntime)
        await expect(helper.getRuntime()).resolves.toBe(secondRuntime)
        expect(factoryCalls).toBe(2)

        await secondRuntime.dispose()
        await firstRuntime.dispose()
    })

    test('preserves composed runtime type inference', async () => {
        const publicModule = defineModule({
            id: 'next-runtime-public-module',
            provides: [
                {
                    token: PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(PUBLIC_API).toValue({
                    value(): string {
                        return 'composed'
                    }
                })
            }
        })
        const helper = createNextRuntime(async () => {
            return createComposer().use(publicModule).compose()
        })

        expectTypeOf(helper).toEqualTypeOf<NextRuntimeHelper<ComposedRuntime>>()
        expectTypeOf(helper.getRuntime()).toEqualTypeOf<Promise<ComposedRuntime>>()

        const runtime = await helper.getRuntime()

        expectTypeOf(runtime).toEqualTypeOf<ComposedRuntime>()
        expect(runtime.get(PUBLIC_API).value()).toBe('composed')
        expect(
            runtime.inspect().graph.modules.map((moduleDefinition) => moduleDefinition.id)
        ).toEqual(['next-runtime-public-module'])

        await runtime.dispose()
    })

    test('exports the implemented Stage 13 adapter surface', async () => {
        const nextAdapter = await import('../src/index.js')

        expect(nextAdapter.createNextRequestContext).toBeTypeOf('function')
        expect(nextAdapter.createNextRuntime).toBeTypeOf('function')
        expect(nextAdapter.nextRequestMultiValue).toBeTypeOf('function')
        expect(nextAdapter.nextRequestValue).toBeTypeOf('function')
        expect(nextAdapter.withRouteScope).toBeTypeOf('function')
        expect(nextAdapter.withServerActionScope).toBeTypeOf('function')
        expect(Object.keys(nextAdapter).sort()).toEqual(
            [
                'createNextRequestContext',
                'createNextRuntime',
                'nextRequestMultiValue',
                'nextRequestValue',
                'withRouteScope',
                'withServerActionScope'
            ].sort()
        )
    })
})

async function createContainerRuntime(loggerName: string): Promise<ContainerRuntime> {
    const container = createContainer()

    container.bind(LOGGER).toValue({
        name: loggerName
    })

    return container.freeze()
}

function createDeferred<TValue>(): Deferred<TValue> {
    let resolveDeferred: ((value: TValue) => void) | undefined
    let rejectDeferred: ((reason?: unknown) => void) | undefined
    const promise = new Promise<TValue>((resolve, reject) => {
        resolveDeferred = resolve
        rejectDeferred = reject
    })

    if (resolveDeferred === undefined || rejectDeferred === undefined) {
        throw new Error('Unable to create deferred promise')
    }

    return {
        promise,
        resolve: resolveDeferred,
        reject: rejectDeferred
    }
}
