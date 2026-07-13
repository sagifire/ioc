import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    AsyncMultiProviderAccessError,
    AsyncMultiProviderResolutionError,
    InvalidScopeError,
    ProviderCycleError,
    defineModule,
    token
} from '@sagifire/ioc'
import {
    createTestComposer,
    createTestRuntime,
    fakeModule,
    multiOverride,
    type FakeModuleDefinition,
    type TestMultiContribution,
    type TestMultiOverride
} from '../src/index.js'

describe('async multi testing helpers', () => {
    test('normalizes async append and replace declarations before freeze in deterministic order', async () => {
        const values = token<string>('testing.async-multi.overrides')
        const productionRuntime = await createTestRuntime({
            configure(container): void {
                container.add(values).toValue('production')
            }
        })
        let singletonCalls = 0
        let transientCalls = 0
        const singletonOverride = multiOverride(values).replaceWithAsyncFactory(
            async () => {
                singletonCalls += 1

                return 'replacement-singleton'
            },
            {
                lifetime: 'singleton',
                initialization: 'lazy'
            }
        )
        const transientOverride = multiOverride(values).appendAsyncFactory(async () => {
            transientCalls += 1

            return `transient-${transientCalls}`
        })
        const runtime = await createTestRuntime({
            configure(container): void {
                container.add(values).toValue('configured')
            },
            multiOverrides: [
                multiOverride(values).appendValue('discarded'),
                singletonOverride,
                transientOverride
            ]
        })

        expect(singletonOverride.contributions[0]).toMatchObject({
            kind: 'async-factory',
            options: {
                lifetime: 'singleton',
                initialization: 'lazy'
            }
        })
        expectTypeOf(singletonOverride).toEqualTypeOf<TestMultiOverride<string>>()
        expectTypeOf(singletonOverride.contributions).toEqualTypeOf<
            readonly TestMultiContribution<string>[]
        >()
        expect(() => runtime.getAll(values)).toThrow(AsyncMultiProviderAccessError)
        await expect(runtime.getAllAsync(values)).resolves.toEqual([
            'configured',
            'replacement-singleton',
            'transient-1'
        ])
        await expect(runtime.getAllAsync(values)).resolves.toEqual([
            'configured',
            'replacement-singleton',
            'transient-2'
        ])
        expect(singletonCalls).toBe(1)
        expect(transientCalls).toBe(2)
        expect(productionRuntime.getAll(values)).toEqual(['production'])

        await runtime.dispose()
        await productionRuntime.dispose()
    })

    test('preserves no-partial return, retry and owner-led resource disposal semantics', async () => {
        const values = token<string>('testing.async-multi.retry-resource')
        const disposed: string[] = []
        let resourceCalls = 0
        let retryCalls = 0
        let laterCalls = 0
        const resourceOverride = multiOverride(values).appendAsyncResource(
            async () => {
                resourceCalls += 1

                return {
                    value: 'resource',
                    dispose(): void {
                        disposed.push('resource')
                    }
                }
            },
            {
                lifetime: 'singleton'
            }
        )
        const runtime = await createTestRuntime({
            multiOverrides: [
                resourceOverride,
                multiOverride(values).appendAsyncFactory(
                    async () => {
                        retryCalls += 1

                        if (retryCalls === 1) {
                            throw new Error('retry-me')
                        }

                        return 'retried'
                    },
                    { lifetime: 'singleton' }
                ),
                multiOverride(values).appendAsyncResource(
                    async () => {
                        laterCalls += 1

                        return {
                            value: 'later',
                            dispose(): void {
                                disposed.push('later')
                            }
                        }
                    },
                    { lifetime: 'singleton' }
                )
            ]
        })

        expectTypeOf(resourceOverride.contributions).toEqualTypeOf<
            readonly TestMultiContribution<string>[]
        >()
        await expect(runtime.getAllAsync(values)).rejects.toBeInstanceOf(
            AsyncMultiProviderResolutionError
        )
        expect(resourceCalls).toBe(1)
        expect(retryCalls).toBe(1)
        expect(laterCalls).toBe(0)
        expect(disposed).toEqual([])

        await expect(runtime.getAllAsync(values)).resolves.toEqual(['resource', 'retried', 'later'])
        expect(resourceCalls).toBe(1)
        expect(retryCalls).toBe(2)
        expect(laterCalls).toBe(1)

        await runtime.dispose()
        expect(disposed).toEqual(['later', 'resource'])
    })

    test('builds scoped async factory and resource fake modules through public module APIs', async () => {
        const values = token<string>('testing.async-multi.fake-modules')
        const disposed: string[] = []
        let factoryCalls = 0
        let resourceCalls = 0
        const factoryModule = fakeModule('testing-async-multi-factory-module', {
            provides: [
                {
                    token: values,
                    kind: 'custom',
                    cardinality: 'multi',
                    useAsyncFactory: async () => {
                        factoryCalls += 1

                        return `factory-${factoryCalls}`
                    },
                    lifetime: 'scoped'
                }
            ]
        })
        const resourceModule = fakeModule('testing-async-multi-resource-module', {
            provides: [
                {
                    token: values,
                    kind: 'custom',
                    cardinality: 'multi',
                    useAsyncResource: async () => {
                        resourceCalls += 1
                        const value = `resource-${resourceCalls}`

                        return {
                            value,
                            dispose(): void {
                                disposed.push(value)
                            }
                        }
                    },
                    lifetime: 'scoped'
                }
            ]
        })

        expectTypeOf(factoryModule).toMatchTypeOf<FakeModuleDefinition>()
        expectTypeOf(resourceModule).toMatchTypeOf<FakeModuleDefinition>()

        const runtime = await createTestComposer({
            modules: [factoryModule, resourceModule]
        }).compose()

        await expect(runtime.getAllAsync(values)).rejects.toBeInstanceOf(InvalidScopeError)

        const firstScope = runtime.createScope()
        const secondScope = runtime.createScope()

        await expect(firstScope.getAllAsync(values)).resolves.toEqual(['factory-1', 'resource-1'])
        await expect(firstScope.getAllAsync(values)).resolves.toEqual(['factory-1', 'resource-1'])
        await expect(secondScope.getAllAsync(values)).resolves.toEqual(['factory-2', 'resource-2'])

        await firstScope.dispose()
        await secondScope.dispose()
        expect(disposed).toEqual(['resource-1', 'resource-2'])

        await runtime.dispose()
    })

    test('keeps private async collection cycle coordinates collision-free through test composer', async () => {
        interface PrivateCycleApi {
            resolveFirst(): Promise<string[]>
            resolveSecond(): Promise<string[]>
        }

        const publicApi = token<PrivateCycleApi>('testing.async-multi.private-cycle.public')
        const firstPrivateSingle = token<string>('PRIVATE_SINGLE_FIRST_SENTINEL')
        const firstPrivateCollection = token<string>('PRIVATE_COLLECTION_FIRST_SENTINEL')
        const secondPrivateSingle = token<string>('PRIVATE_SINGLE_SECOND_SENTINEL')
        const secondPrivateCollection = token<string>('PRIVATE_COLLECTION_SECOND_SENTINEL')
        const moduleId = 'testing-async-multi-private-cycle-module'
        const privateModule = defineModule({
            id: moduleId,
            provides: [{ token: publicApi, kind: 'public-api' }],
            setup(context): void {
                context.bind(firstPrivateSingle).toValue('first-single')
                context.add(firstPrivateCollection).toAsyncFactory(async ({ getAllAsync }) => {
                    return (await getAllAsync(firstPrivateCollection)).join(',')
                })
                context.bind(secondPrivateSingle).toValue('second-single')
                context.add(secondPrivateCollection).toAsyncFactory(async ({ getAllAsync }) => {
                    return (await getAllAsync(secondPrivateCollection)).join(',')
                })
                context.bind(publicApi).toFactory(({ getAllAsync }) => {
                    return {
                        resolveFirst(): Promise<string[]> {
                            return getAllAsync(firstPrivateCollection)
                        },
                        resolveSecond(): Promise<string[]> {
                            return getAllAsync(secondPrivateCollection)
                        }
                    }
                })
            }
        })
        const runtime = await createTestComposer({ modules: [privateModule] }).compose()
        const api = runtime.get(publicApi)
        const firstError = await captureCycle(() => api.resolveFirst())
        const secondError = await captureCycle(() => api.resolveSecond())

        expect(firstError.frames?.[0]).toEqual({
            kind: 'collection',
            visibility: 'private',
            moduleId,
            privateCollectionOrdinal: 0
        })
        expect(secondError.frames?.[0]).toEqual({
            kind: 'collection',
            visibility: 'private',
            moduleId,
            privateCollectionOrdinal: 1
        })

        const outwardErrors = JSON.stringify([firstError, secondError])

        expect(outwardErrors).not.toContain(firstPrivateCollection.id)
        expect(outwardErrors).not.toContain(secondPrivateCollection.id)
        expect(firstError.cause).toBeUndefined()
        expect(secondError.cause).toBeUndefined()

        await runtime.dispose()
    })
})

async function captureCycle(resolve: () => Promise<string[]>): Promise<ProviderCycleError> {
    let error: unknown

    try {
        await resolve()
    } catch (caught) {
        error = caught
    }

    expect(error).toBeInstanceOf(ProviderCycleError)

    if (!(error instanceof ProviderCycleError)) {
        throw new Error('Expected a private provider cycle')
    }

    return error
}
