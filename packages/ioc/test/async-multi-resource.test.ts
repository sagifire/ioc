import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    AsyncMultiProviderResolutionError,
    AsyncResourceCleanupError,
    InvalidProviderLifecycleError,
    ResourceDisposalError,
    RuntimeDisposedError,
    ScopeDisposedError,
    createContainer,
    token,
    type AsyncResourceBinding,
    type Resource
} from '../src/index.js'
import { getProviderGraphSnapshot } from '../src/provider-metadata.js'

function createDeferred<TValue>(): {
    readonly promise: Promise<TValue>
    readonly resolve: (value: TValue) => void
} {
    let resolvePromise: ((value: TValue) => void) | undefined
    const promise = new Promise<TValue>((resolve) => {
        resolvePromise = resolve
    })

    return {
        promise,
        resolve(value): void {
            resolvePromise?.(value)
        }
    }
}

describe('async multi resource ownership and disposal', () => {
    test('exposes typed resource contributions and rejects missing or transient ownership', async () => {
        const values = token<string>('async-multi-resource.lifecycle.values')
        const missingOwnership = createContainer()
        const singletonContainer = createContainer()
        const binding = singletonContainer.add(values).toAsyncResource(async () => ({
            value: 'singleton'
        }))

        expectTypeOf(binding).toEqualTypeOf<AsyncResourceBinding>()
        missingOwnership.add(values).toAsyncResource(async () => ({ value: 'missing' }))
        binding.singleton()

        await expect(missingOwnership.freeze()).rejects.toThrow(InvalidProviderLifecycleError)

        const runtime = await singletonContainer.freeze()

        await expect(runtime.getAllAsync(values)).resolves.toEqual(['singleton'])
        await runtime.dispose()
    })

    test('derives runtime and scope ownership edges for concrete multi providers', async () => {
        const values = token<string>('async-multi-resource.ownership.values')
        const container = createContainer()

        container
            .add(values)
            .toAsyncResource(async () => ({ value: 'runtime' }), { dependencies: [] })
            .singleton()
        container
            .add(values)
            .toAsyncResource(async () => ({ value: 'scope' }), { dependencies: [] })
            .scoped()

        const runtime = await container.freeze()
        const snapshot = getProviderGraphSnapshot(runtime)

        expect(snapshot.ownershipEdges).toEqual([
            {
                provider: {
                    visibility: 'public',
                    tokenId: values.id,
                    registrationIndex: 0
                },
                owner: 'runtime'
            },
            {
                provider: {
                    visibility: 'public',
                    tokenId: values.id,
                    registrationIndex: 1
                },
                owner: 'scope'
            }
        ])
    })

    test('initializes eager singleton resources for sync collection access and disposal', async () => {
        const values = token<string>('async-multi-resource.eager.values')
        const container = createContainer()
        const disposed: string[] = []

        for (const value of ['first', 'second']) {
            container
                .add(values)
                .toAsyncResource(async () => ({
                    value,
                    dispose(): void {
                        disposed.push(value)
                    }
                }))
                .singleton()
                .eager()
        }

        const runtime = await container.freeze()

        expect(runtime.getAll(values)).toEqual(['first', 'second'])
        await runtime.dispose()
        expect(disposed).toEqual(['second', 'first'])
    })

    test('cleans a failed eager candidate runtime and reacquires resources on freeze retry', async () => {
        const values = token<string>('async-multi-resource.eager-retry.values')
        const container = createContainer()
        const disposed: string[] = []
        let stableCalls = 0
        let failingCalls = 0

        container
            .add(values)
            .toAsyncResource(async () => {
                stableCalls += 1
                const value = `stable-${stableCalls}`

                return {
                    value,
                    dispose(): void {
                        disposed.push(value)
                    }
                }
            })
            .singleton()
            .eager()
        container
            .add(values)
            .toAsyncResource(async () => {
                failingCalls += 1

                if (failingCalls === 1) {
                    throw new Error('first eager attempt failed')
                }

                const value = `recovered-${failingCalls}`

                return {
                    value,
                    dispose(): void {
                        disposed.push(value)
                    }
                }
            })
            .singleton()
            .eager()

        await expect(container.freeze()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_ASYNC_MULTI_PROVIDER_RESOLUTION',
            cause: expect.objectContaining({ message: 'first eager attempt failed' })
        })
        expect(disposed).toEqual(['stable-1'])

        const runtime = await container.freeze()

        expect(runtime.getAll(values)).toEqual(['stable-2', 'recovered-2'])
        await runtime.dispose()
        expect(disposed).toEqual(['stable-1', 'recovered-2', 'stable-2'])
        expect(stableCalls).toBe(2)
        expect(failingCalls).toBe(2)
    })

    test('keeps scoped success in the effective scope after a later contribution fails', async () => {
        const values = token<string>('async-multi-resource.scoped-partial.values')
        const container = createContainer()
        let stableCalls = 0
        let retriedCalls = 0
        const disposed: string[] = []

        container
            .add(values)
            .toAsyncResource(async () => {
                stableCalls += 1

                return {
                    value: 'stable',
                    dispose(): void {
                        disposed.push('stable')
                    }
                }
            })
            .scoped()
        container
            .add(values)
            .toAsyncResource(async () => {
                retriedCalls += 1

                if (retriedCalls === 1) {
                    throw new Error('scoped retry')
                }

                return { value: 'retried' }
            })
            .scoped()

        const runtime = await container.freeze()
        const firstScope = runtime.createScope()
        const secondScope = runtime.createScope()

        await expect(firstScope.getAllAsync(values)).rejects.toBeInstanceOf(
            AsyncMultiProviderResolutionError
        )
        await expect(firstScope.getAllAsync(values)).resolves.toEqual(['stable', 'retried'])
        expect(stableCalls).toBe(1)
        expect(retriedCalls).toBe(2)

        await expect(secondScope.getAllAsync(values)).resolves.toEqual(['stable', 'retried'])
        expect(stableCalls).toBe(2)
        expect(retriedCalls).toBe(3)

        await firstScope.dispose()
        await secondScope.dispose()
        expect(disposed).toEqual(['stable', 'stable'])
    })

    test('retains successful lazy resources after partial failure and reuses them on retry', async () => {
        const values = token<string>('async-multi-resource.partial.values')
        const container = createContainer()
        const disposed: string[] = []
        let resourceCalls = 0
        let failingCalls = 0
        let laterCalls = 0

        container
            .add(values)
            .toAsyncResource(async () => {
                resourceCalls += 1

                return {
                    value: 'resource',
                    dispose(): void {
                        disposed.push('resource')
                    }
                }
            })
            .singleton()
        container
            .add(values)
            .toAsyncResource(async () => {
                failingCalls += 1

                if (failingCalls === 1) {
                    throw new Error('retry me')
                }

                return { value: 'retried' }
            })
            .singleton()
        container
            .add(values)
            .toAsyncResource(async () => {
                laterCalls += 1

                return { value: 'later' }
            })
            .singleton()

        const runtime = await container.freeze()

        await expect(runtime.getAllAsync(values)).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_ASYNC_MULTI_PROVIDER_RESOLUTION'
        })
        expect(resourceCalls).toBe(1)
        expect(failingCalls).toBe(1)
        expect(laterCalls).toBe(0)
        expect(disposed).toEqual([])

        await expect(runtime.getAllAsync(values)).resolves.toEqual(['resource', 'retried', 'later'])
        expect(resourceCalls).toBe(1)
        expect(failingCalls).toBe(2)
        expect(laterCalls).toBe(1)

        await runtime.dispose()
        expect(disposed).toEqual(['resource'])
    })

    test('deduplicates concurrent collection work and disposes one acquired resource', async () => {
        const values = token<string>('async-multi-resource.concurrent.values')
        const container = createContainer()
        const acquisition = createDeferred<Resource<string>>()
        let factoryCalls = 0
        let disposeCalls = 0

        container
            .add(values)
            .toAsyncResource(() => {
                factoryCalls += 1

                return acquisition.promise
            })
            .singleton()

        const runtime = await container.freeze()
        const first = runtime.getAllAsync(values)
        const second = runtime.getAllAsync(values)

        acquisition.resolve({
            value: 'shared',
            dispose(): void {
                disposeCalls += 1
            }
        })

        await expect(first).resolves.toEqual(['shared'])
        await expect(second).resolves.toEqual(['shared'])
        expect(factoryCalls).toBe(1)

        await runtime.dispose()
        expect(disposeCalls).toBe(1)
    })

    test('waits for pending runtime acquisition and rejects the late collection safely', async () => {
        const values = token<string>('async-multi-resource.pending-runtime.values')
        const container = createContainer()
        const acquisition = createDeferred<Resource<string>>()
        let disposeCalls = 0

        container
            .add(values)
            .toAsyncResource(() => acquisition.promise)
            .singleton()

        const runtime = await container.freeze()
        const resolution = runtime.getAllAsync(values)
        const disposal = runtime.dispose()
        let disposalSettled = false

        void disposal.finally(() => {
            disposalSettled = true
        })
        await Promise.resolve()
        expect(disposalSettled).toBe(false)

        acquisition.resolve({
            value: 'late',
            dispose(): void {
                disposeCalls += 1
            }
        })

        await expect(resolution).rejects.toBeInstanceOf(AsyncMultiProviderResolutionError)
        await disposal
        expect(disposeCalls).toBe(1)
        await expect(runtime.getAllAsync(values)).rejects.toThrow(RuntimeDisposedError)
    })

    test('waits for pending scoped acquisition and keeps disposal idempotent', async () => {
        const values = token<string>('async-multi-resource.pending-scope.values')
        const container = createContainer()
        const acquisition = createDeferred<Resource<string>>()
        let disposeCalls = 0

        container
            .add(values)
            .toAsyncResource(() => acquisition.promise)
            .scoped()

        const runtime = await container.freeze()
        const scope = runtime.createScope()
        const resolution = scope.getAllAsync(values)
        const firstDisposal = scope.dispose()
        const secondDisposal = scope.dispose()

        acquisition.resolve({
            value: 'late',
            dispose(): void {
                disposeCalls += 1
            }
        })

        await expect(resolution).rejects.toBeInstanceOf(AsyncMultiProviderResolutionError)
        await Promise.all([firstDisposal, secondDisposal])
        expect(disposeCalls).toBe(1)
        await expect(scope.getAllAsync(values)).rejects.toThrow(ScopeDisposedError)
    })

    test('keeps a late scoped resource owner-ledgered after runtime shutdown', async () => {
        const values = token<string>('async-multi-resource.runtime-before-scope.values')
        const container = createContainer()
        const acquisition = createDeferred<Resource<string>>()
        let disposeCalls = 0

        container
            .add(values)
            .toAsyncResource(() => acquisition.promise)
            .scoped()

        const runtime = await container.freeze()
        const scope = runtime.createScope()
        const resolution = scope.getAllAsync(values)

        await runtime.dispose()
        acquisition.resolve({
            value: 'late-scoped',
            dispose(): void {
                disposeCalls += 1
            }
        })

        let resolutionError: unknown

        try {
            await resolution
        } catch (caught) {
            resolutionError = caught
        }

        expect(resolutionError).toBeInstanceOf(AsyncMultiProviderResolutionError)

        if (resolutionError instanceof AsyncMultiProviderResolutionError) {
            expect(resolutionError.cause).toBeInstanceOf(RuntimeDisposedError)
        }

        expect(disposeCalls).toBe(0)
        await scope.dispose()
        expect(disposeCalls).toBe(1)
    })

    test('reports late scoped cleanup failure only from the effective owner disposal', async () => {
        const values = token<string>('async-multi-resource.runtime-before-scope-failure.values')
        const container = createContainer()
        const acquisition = createDeferred<Resource<string>>()
        const cleanupFailure = new Error('late scoped cleanup failed')
        let disposeCalls = 0

        container
            .add(values)
            .toAsyncResource(() => acquisition.promise)
            .scoped()

        const runtime = await container.freeze()
        const scope = runtime.createScope()
        const resolution = scope.getAllAsync(values)

        await runtime.dispose()
        acquisition.resolve({
            value: 'late-scoped',
            dispose(): void {
                disposeCalls += 1
                throw cleanupFailure
            }
        })

        let resolutionError: unknown

        try {
            await resolution
        } catch (caught) {
            resolutionError = caught
        }

        expect(resolutionError).toBeInstanceOf(AsyncMultiProviderResolutionError)

        if (resolutionError instanceof AsyncMultiProviderResolutionError) {
            expect(resolutionError.cause).toBeInstanceOf(RuntimeDisposedError)
        }

        await expect(scope.dispose()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_RESOURCE_DISPOSAL',
            phase: 'scope-dispose',
            cause: cleanupFailure
        })
        expect(disposeCalls).toBe(1)
        await scope.dispose()
    })

    test('disposes in reverse actual acquisition order across concurrent collections', async () => {
        const firstValues = token<string>('async-multi-resource.order.first')
        const secondValues = token<string>('async-multi-resource.order.second')
        const container = createContainer()
        const firstAcquisition = createDeferred<Resource<string>>()
        const secondAcquisition = createDeferred<Resource<string>>()
        const disposed: string[] = []

        container
            .add(firstValues)
            .toAsyncResource(() => firstAcquisition.promise)
            .singleton()
        container
            .add(secondValues)
            .toAsyncResource(() => secondAcquisition.promise)
            .singleton()

        const runtime = await container.freeze()
        const firstResolution = runtime.getAllAsync(firstValues)
        const secondResolution = runtime.getAllAsync(secondValues)

        secondAcquisition.resolve({
            value: 'second',
            dispose(): void {
                disposed.push('second')
            }
        })
        await secondResolution
        firstAcquisition.resolve({
            value: 'first',
            dispose(): void {
                disposed.push('first')
            }
        })
        await firstResolution

        await runtime.dispose()
        expect(disposed).toEqual(['first', 'second'])
    })

    test('reports typed owner disposal failures and continues reverse-ledger cleanup', async () => {
        const values = token<string>('async-multi-resource.dispose-failure.values')
        const container = createContainer()
        const disposed: number[] = []
        const firstFailure = new Error('first disposer failed')
        const secondFailure = new Error('second disposer failed')

        for (const [index, failure] of [firstFailure, secondFailure].entries()) {
            container
                .add(values)
                .toAsyncResource(async () => ({
                    value: `resource-${index}`,
                    dispose(): void {
                        disposed.push(index)
                        throw failure
                    }
                }))
                .singleton()
        }

        const runtime = await container.freeze()

        await runtime.getAllAsync(values)

        let error: unknown

        try {
            await runtime.dispose()
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(ResourceDisposalError)
        expect(disposed).toEqual([1, 0])

        if (error instanceof ResourceDisposalError) {
            expect(error.phase).toBe('runtime-dispose')
            expect(error.failures.map((failure) => failure.provider)).toEqual([
                {
                    kind: 'provider',
                    visibility: 'public',
                    tokenId: values.id,
                    registrationIndex: 1,
                    registrationKind: 'multi'
                },
                {
                    kind: 'provider',
                    visibility: 'public',
                    tokenId: values.id,
                    registrationIndex: 0,
                    registrationKind: 'multi'
                }
            ])
            expect(error.cause).toBe(secondFailure)
        }
    })

    test('preserves primary eager failure and exposes typed secondary cleanup failure', async () => {
        const values = token<string>('async-multi-resource.eager-cleanup.values')
        const container = createContainer()
        const primaryFailure = new Error('primary initialization failed')
        const cleanupFailure = new Error('secondary cleanup failed')

        container
            .add(values)
            .toAsyncResource(async () => ({
                value: 'acquired',
                dispose(): void {
                    throw cleanupFailure
                }
            }))
            .singleton()
            .eager()
        container
            .add(values)
            .toAsyncResource(async () => {
                throw primaryFailure
            })
            .singleton()
            .eager()

        let error: unknown

        try {
            await container.freeze()
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(AsyncResourceCleanupError)

        if (error instanceof AsyncResourceCleanupError) {
            expect(error.cause).toBeInstanceOf(AsyncMultiProviderResolutionError)
            expect((error.cause as AsyncMultiProviderResolutionError).cause).toBe(primaryFailure)
            expect(error.cleanupError).toBeInstanceOf(ResourceDisposalError)
            expect(error.cleanupError.phase).toBe('eager-freeze-cleanup')
            expect(error.cleanupError.cause).toBe(cleanupFailure)
        }
    })
})
