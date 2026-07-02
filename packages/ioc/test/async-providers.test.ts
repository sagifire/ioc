import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    AsyncProviderAccessError,
    InvalidProviderLifecycleError,
    InvalidScopeError,
    ProviderCycleError,
    RuntimeDisposedError,
    ScopeDisposedError,
    SyncFactoryPromiseError,
    createContainer,
    type AsyncFactoryBinding,
    type AsyncResourceBinding,
    type ContainerRuntime,
    type ResolutionContext,
    type Resource,
    type Scope
} from '../src/container.js'
import { token } from '../src/tokens.js'

interface Counter {
    readonly value: number
}

interface Logger {
    readonly name: string
}

interface Service {
    readonly logger: Logger
    readonly missing: Missing | undefined
}

interface Missing {
    readonly value: string
}

const COUNTER = token<Counter>('async.counter')
const OTHER_COUNTER = token<Counter>('async.other-counter')
const LOGGER = token<Logger>('async.logger')
const SERVICE = token<Service>('async.service')
const MISSING = token<Missing>('async.missing')
const REQUEST_ID = token<string>('async.request-id')

describe('container async providers and resources', () => {
    test('resolves sync providers through async runtime APIs', async () => {
        const container = createContainer()
        const logger = createLogger('sync')

        container.bind(LOGGER).toValue(logger)

        const runtime = await container.freeze()

        expectTypeOf(runtime).toEqualTypeOf<ContainerRuntime>()
        expectTypeOf(runtime.getAsync(LOGGER)).toEqualTypeOf<Promise<Logger>>()
        expectTypeOf(runtime.tryGetAsync(LOGGER)).toEqualTypeOf<Promise<Logger | undefined>>()

        await expect(runtime.getAsync(LOGGER)).resolves.toBe(logger)
        await expect(runtime.tryGetAsync(LOGGER)).resolves.toBe(logger)
        await expect(runtime.tryGetAsync(MISSING)).resolves.toBeUndefined()
    })

    test('rejects sync factory Promise misuse through async runtime APIs', async () => {
        const container = createContainer()

        container
            .bind(LOGGER)
            .toFactory((() => Promise.resolve(createLogger('misuse'))) as unknown as () => Logger)

        const runtime = await container.freeze()

        await expect(runtime.getAsync(LOGGER)).rejects.toThrow(SyncFactoryPromiseError)
        await expect(runtime.tryGetAsync(LOGGER)).rejects.toThrow(SyncFactoryPromiseError)
    })

    test('initializes eager singleton async factories during freeze and exposes them through get', async () => {
        const container = createContainer()
        let calls = 0

        const binding = container.bind(COUNTER).toAsyncFactory(async () => ({
            value: (calls += 1)
        }))

        expectTypeOf(binding).toEqualTypeOf<AsyncFactoryBinding>()

        binding.singleton().eager()

        const runtime = await container.freeze()

        expect(calls).toBe(1)
        expect(runtime.get(COUNTER)).toEqual({
            value: 1
        })
        await expect(runtime.getAsync(COUNTER)).resolves.toEqual({
            value: 1
        })
    })

    test('keeps lazy async factories behind getAsync and uses transient lifetime by default', async () => {
        const container = createContainer()
        let calls = 0

        container.bind(COUNTER).toAsyncFactory(async () => ({
            value: (calls += 1)
        }))

        const runtime = await container.freeze()

        expect(calls).toBe(0)
        expect(() => runtime.get(COUNTER)).toThrow(AsyncProviderAccessError)
        expect(() => runtime.tryGet(COUNTER)).toThrow(AsyncProviderAccessError)

        await expect(runtime.getAsync(COUNTER)).resolves.toEqual({
            value: 1
        })
        await expect(runtime.getAsync(COUNTER)).resolves.toEqual({
            value: 2
        })
        expect(() => runtime.get(COUNTER)).toThrow(AsyncProviderAccessError)
    })

    test('retries failed lazy singleton async initialization', async () => {
        const container = createContainer()
        let calls = 0

        container
            .bind(COUNTER)
            .toAsyncFactory(async () => {
                calls += 1

                if (calls === 1) {
                    throw new Error('temporary failure')
                }

                return {
                    value: calls
                }
            })
            .singleton()

        const runtime = await container.freeze()

        await expect(runtime.getAsync(COUNTER)).rejects.toThrow('temporary failure')
        await expect(runtime.getAsync(COUNTER)).resolves.toEqual({
            value: 2
        })
        await expect(runtime.getAsync(COUNTER)).resolves.toEqual({
            value: 2
        })
        expect(calls).toBe(2)
    })

    test('de-duplicates in-flight singleton and scoped async initialization', async () => {
        const container = createContainer()
        const singletonDeferred = createDeferred<Counter>()
        let singletonCalls = 0
        let scopedCalls = 0

        container
            .bind(COUNTER)
            .toAsyncFactory(() => {
                singletonCalls += 1

                return singletonDeferred.promise
            })
            .singleton()
        container
            .bind(OTHER_COUNTER)
            .toAsyncFactory(async () => ({
                value: (scopedCalls += 1)
            }))
            .scoped()

        const runtime = await container.freeze()
        const firstSingleton = runtime.getAsync(COUNTER)
        const secondSingleton = runtime.getAsync(COUNTER)

        expect(singletonCalls).toBe(1)

        singletonDeferred.resolve({
            value: 10
        })

        await expect(firstSingleton).resolves.toEqual({
            value: 10
        })
        await expect(secondSingleton).resolves.toEqual({
            value: 10
        })
        expect(singletonCalls).toBe(1)

        const firstScope = runtime.createScope()
        const secondScope = runtime.createScope()
        const [firstScoped, secondScoped] = await Promise.all([
            firstScope.getAsync(OTHER_COUNTER),
            firstScope.getAsync(OTHER_COUNTER)
        ])
        const otherScopeScoped = await secondScope.getAsync(OTHER_COUNTER)

        expectTypeOf(firstScope).toEqualTypeOf<Scope>()
        expectTypeOf(firstScope.getAsync(OTHER_COUNTER)).toEqualTypeOf<Promise<Counter>>()
        expect(firstScoped).toBe(secondScoped)
        expect(firstScoped).not.toBe(otherScopeScoped)
        expect(scopedCalls).toBe(2)
    })

    test('passes async resolution context to async factories and detects mixed cycles', async () => {
        const first = token<string>('async.cycle.first')
        const second = token<string>('async.cycle.second')
        const container = createContainer()
        const logger = createLogger('context')

        container.bind(LOGGER).toValue(logger)
        container.bind(SERVICE).toAsyncFactory(async (context) => {
            expectTypeOf(context).toEqualTypeOf<ResolutionContext>()
            expectTypeOf(context.getAsync(LOGGER)).toEqualTypeOf<Promise<Logger>>()
            expectTypeOf(context.tryGetAsync(MISSING)).toEqualTypeOf<Promise<Missing | undefined>>()

            return {
                logger: await context.getAsync(LOGGER),
                missing: await context.tryGetAsync(MISSING)
            }
        })
        container.bind(first).toAsyncFactory(async ({ getAsync }) => getAsync(second))
        container.bind(second).toFactory(({ get }) => get(first))

        const runtime = await container.freeze()

        await expect(runtime.getAsync(SERVICE)).resolves.toEqual({
            logger,
            missing: undefined
        })
        await expect(runtime.getAsync(first)).rejects.toThrow(ProviderCycleError)

        try {
            await runtime.getAsync(first)
        } catch (error) {
            expect(error).toBeInstanceOf(ProviderCycleError)

            if (error instanceof ProviderCycleError) {
                expect(error.tokenIds).toEqual([
                    'async.cycle.first',
                    'async.cycle.second',
                    'async.cycle.first'
                ])
            }
        }
    })

    test('requires explicit async resource ownership and supports eager singleton resources', async () => {
        const missingOwnership = createContainer()
        const eagerResource = createContainer()
        const resource: Resource<Counter> = {
            value: {
                value: 1
            }
        }
        let factoryCalls = 0
        const resourceBinding = eagerResource.bind(COUNTER).toAsyncResource(async () => {
            factoryCalls += 1

            return resource
        })

        expectTypeOf(resourceBinding).toEqualTypeOf<AsyncResourceBinding>()
        missingOwnership.bind(COUNTER).toAsyncResource(async () => resource)
        resourceBinding.singleton().eager()

        await expect(missingOwnership.freeze()).rejects.toThrow(InvalidProviderLifecycleError)

        const runtime = await eagerResource.freeze()

        expect(factoryCalls).toBe(1)
        expect(runtime.get(COUNTER)).toBe(resource.value)
        await expect(runtime.getAsync(COUNTER)).resolves.toBe(resource.value)
    })

    test('rejects eager async initialization for non-singleton providers', async () => {
        const transientFactory = createContainer()
        const scopedResource = createContainer()

        transientFactory
            .bind(COUNTER)
            .toAsyncFactory(async () => ({
                value: 1
            }))
            .eager()
        scopedResource
            .bind(COUNTER)
            .toAsyncResource(async () => ({
                value: {
                    value: 1
                }
            }))
            .scoped()
            .eager()

        await expect(transientFactory.freeze()).rejects.toThrow(InvalidProviderLifecycleError)
        await expect(scopedResource.freeze()).rejects.toThrow(InvalidProviderLifecycleError)
    })

    test('disposes singleton resources in reverse initialization order and rejects disposed runtime usage', async () => {
        const container = createContainer()
        const disposed: string[] = []
        let firstFactoryCalls = 0

        container
            .bind(COUNTER)
            .toAsyncResource(async () => {
                firstFactoryCalls += 1

                return {
                    value: {
                        value: 1
                    },
                    dispose(): void {
                        disposed.push('first')
                    }
                }
            })
            .singleton()
        container
            .bind(OTHER_COUNTER)
            .toAsyncResource(async () => ({
                value: {
                    value: 2
                },
                dispose(): void {
                    disposed.push('second')
                }
            }))
            .singleton()

        const runtime = await container.freeze()

        expect(firstFactoryCalls).toBe(0)
        await runtime.getAsync(COUNTER)
        await runtime.getAsync(OTHER_COUNTER)
        await runtime.dispose()
        await runtime.dispose()

        expect(disposed).toEqual(['second', 'first'])
        expect(() => runtime.get(COUNTER)).toThrow(RuntimeDisposedError)
        expect(() => runtime.tryGet(COUNTER)).toThrow(RuntimeDisposedError)
        expect(() => runtime.createScope()).toThrow(RuntimeDisposedError)
        await expect(runtime.getAsync(COUNTER)).rejects.toThrow(RuntimeDisposedError)
    })

    test('disposes scoped resources through scope.dispose and withScope', async () => {
        const container = createContainer()
        const disposed: string[] = []

        container
            .bind(COUNTER)
            .toAsyncResource(async ({ getAsync }) => ({
                value: {
                    value: (await getAsync(REQUEST_ID)).length
                },
                dispose(): void {
                    disposed.push('counter')
                }
            }))
            .scoped()
        container
            .bind(OTHER_COUNTER)
            .toAsyncResource(async () => ({
                value: {
                    value: 2
                },
                dispose(): void {
                    disposed.push('other-counter')
                }
            }))
            .scoped()

        const runtime = await container.freeze()

        await runtime.withScope(
            {
                values: [[REQUEST_ID, 'request']]
            },
            async (scope) => {
                await expect(scope.getAsync(COUNTER)).resolves.toEqual({
                    value: 7
                })
                await scope.getAsync(OTHER_COUNTER)
            }
        )

        expect(disposed).toEqual(['other-counter', 'counter'])

        const scope = runtime.createScope({
            values: [[REQUEST_ID, 'manual']]
        })

        await scope.getAsync(COUNTER)
        await scope.dispose()
        await scope.dispose()

        await expect(scope.getAsync(COUNTER)).rejects.toThrow(ScopeDisposedError)
        expect(() => scope.get(COUNTER)).toThrow(ScopeDisposedError)
        expect(disposed).toEqual(['other-counter', 'counter', 'counter'])
    })

    test('does not make runtime disposal own live scopes', async () => {
        const container = createContainer()
        const disposed: string[] = []

        container
            .bind(COUNTER)
            .toAsyncResource(async () => ({
                value: {
                    value: 1
                },
                dispose(): void {
                    disposed.push('scoped')
                }
            }))
            .scoped()

        const runtime = await container.freeze()
        const scope = runtime.createScope()

        await scope.getAsync(COUNTER)
        await runtime.dispose()

        expect(disposed).toEqual([])
        await expect(scope.getAsync(COUNTER)).rejects.toThrow(RuntimeDisposedError)

        await scope.dispose()

        expect(disposed).toEqual(['scoped'])
    })

    test('rejects runtime-level scoped async providers without active scope', async () => {
        const container = createContainer()

        container
            .bind(COUNTER)
            .toAsyncFactory(async () => ({
                value: 1
            }))
            .scoped()

        const runtime = await container.freeze()

        await expect(runtime.getAsync(COUNTER)).rejects.toThrow(InvalidScopeError)
    })
})

function createLogger(name: string): Logger {
    return {
        name
    }
}

function createDeferred<TValue>(): {
    readonly promise: Promise<TValue>
    readonly resolve: (value: TValue) => void
    readonly reject: (error: unknown) => void
} {
    let resolve!: (value: TValue) => void
    let reject!: (error: unknown) => void

    const promise = new Promise<TValue>((promiseResolve, promiseReject) => {
        resolve = promiseResolve
        reject = promiseReject
    })

    return {
        promise,
        resolve: (value) => {
            resolve(value)
        },
        reject: (error) => {
            reject(error)
        }
    }
}
