import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    AsyncMultiProviderAccessError,
    AsyncMultiProviderResolutionError,
    DependencyMetadataInvalidError,
    GetAllUsedForSingleTokenError,
    InvalidScopeError,
    ProviderCycleError,
    ProviderKindMismatchError,
    createComposer,
    createContainer,
    defineModule,
    token,
    type AsyncFactoryBinding,
    type ContainerMultiBindingBuilder,
    type ResolutionContext
} from '../src/index.js'
import {
    createPrivateProviderRegistrationIdentity,
    setProviderRegistrationIdentity
} from '../src/provider-identity.js'
import { getProviderGraphSnapshot } from '../src/provider-metadata.js'

describe('core async multi-provider resolution', () => {
    test('exposes one typed getAllAsync contract across runtime, scope and context', async () => {
        const values = token<string>('async-multi.types.values')
        const derived = token<string>('async-multi.types.derived')
        const container = createContainer()
        const binding = container.add(values)

        expectTypeOf(binding).toEqualTypeOf<ContainerMultiBindingBuilder<string>>()
        expectTypeOf(
            binding.toAsyncFactory(async () => 'value')
        ).toEqualTypeOf<AsyncFactoryBinding>()

        container.bind(derived).toAsyncFactory(async (context) => {
            expectTypeOf(context).toEqualTypeOf<ResolutionContext>()
            expectTypeOf(context.getAllAsync(values)).toEqualTypeOf<Promise<string[]>>()

            return (await context.getAllAsync(values)).join(',')
        })

        const runtime = await container.freeze()
        const scope = runtime.createScope()

        expectTypeOf(runtime.getAllAsync(values)).toEqualTypeOf<Promise<string[]>>()
        expectTypeOf(scope.getAllAsync(values)).toEqualTypeOf<Promise<string[]>>()
        await expect(runtime.getAsync(derived)).resolves.toBe('value')
        await scope.dispose()
    })

    test('keeps composed runtime substitutability through a gated compatibility passthrough', async () => {
        const multi = token<string>('async-multi.composed.multi')
        const single = token<string>('async-multi.composed.single')
        const module = defineModule({
            id: 'async-multi-composed-module',
            provides: [
                { token: multi, kind: 'custom', cardinality: 'multi' },
                { token: single, kind: 'custom' }
            ],
            setup(context) {
                context.add(multi).toValue('module-value')
                context.bind(single).toValue('single-value')
            }
        })
        const runtime = await createComposer().use(module).compose()

        expectTypeOf(runtime.getAllAsync(multi)).toEqualTypeOf<Promise<string[]>>()
        await expect(runtime.getAllAsync(multi)).resolves.toEqual(['module-value'])
        await expect(runtime.getAllAsync(single)).rejects.toThrow(GetAllUsedForSingleTokenError)
    })

    test('preflights every contribution before sync execution and resolves mixed values in order', async () => {
        const values = token<string>('async-multi.mixed')
        const container = createContainer()
        let syncCalls = 0
        const starts: string[] = []

        container.add(values).toFactory(() => {
            syncCalls += 1
            starts.push('sync')

            return 'sync'
        })
        container.add(values).toAsyncFactory(async () => {
            starts.push('async')

            return 'async'
        })

        const runtime = await container.freeze()
        let error: unknown

        try {
            runtime.getAll(values)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(AsyncMultiProviderAccessError)
        expect(syncCalls).toBe(0)

        if (error instanceof AsyncMultiProviderAccessError) {
            expect(error.code).toBe('SAGIFIRE_IOC_ASYNC_MULTI_PROVIDER_ACCESS')
            expect(error.blockers).toEqual([
                {
                    provider: {
                        kind: 'provider',
                        visibility: 'public',
                        tokenId: values.id,
                        registrationIndex: 1,
                        registrationKind: 'multi'
                    },
                    providerKind: 'async-factory',
                    lifetime: 'transient',
                    initialization: 'lazy'
                }
            ])
        }

        const resolved = await runtime.getAllAsync(values)

        expect(resolved).toEqual(['sync', 'async'])
        expect(starts).toEqual(['sync', 'async'])
    })

    test('initializes eager singleton contributions during freeze and keeps sync access declarative', async () => {
        const values = token<{ readonly id: number }>('async-multi.eager')
        const container = createContainer()
        let calls = 0

        container
            .add(values)
            .toAsyncFactory(async () => ({ id: (calls += 1) }))
            .singleton()
            .eager()

        const runtime = await container.freeze()
        const syncFirst = runtime.getAll(values)
        const syncSecond = runtime.getAll(values)
        const asyncValues = await runtime.getAllAsync(values)

        expect(calls).toBe(1)
        expect(syncFirst).toEqual([{ id: 1 }])
        expect(syncFirst[0]).toBe(syncSecond[0])
        expect(syncFirst[0]).toBe(asyncValues[0])
        expect(syncFirst).not.toBe(syncSecond)
        expect(syncFirst).not.toBe(asyncValues)
    })

    test('does not make a lazy singleton sync-eligible after async warm-up', async () => {
        const values = token<string>('async-multi.lazy-warmup')
        const container = createContainer()
        let calls = 0

        container
            .add(values)
            .toAsyncFactory(async () => {
                calls += 1

                return 'lazy'
            })
            .singleton()

        const runtime = await container.freeze()

        await expect(runtime.getAllAsync(values)).resolves.toEqual(['lazy'])
        expect(calls).toBe(1)
        expect(() => runtime.getAll(values)).toThrow(AsyncMultiProviderAccessError)
        expect(calls).toBe(1)
    })

    test('retries a failed eager freeze with a fresh candidate runtime', async () => {
        const values = token<string>('async-multi.eager-retry')
        const container = createContainer()
        const cause = new Error('first eager attempt failed')
        let firstCalls = 0
        let failingCalls = 0
        let laterCalls = 0

        container
            .add(values)
            .toAsyncFactory(async () => {
                firstCalls += 1

                return 'first'
            })
            .singleton()
            .eager()
        container
            .add(values)
            .toAsyncFactory(async () => {
                failingCalls += 1

                if (failingCalls === 1) {
                    throw cause
                }

                return 'ready'
            })
            .singleton()
            .eager()
        container
            .add(values)
            .toAsyncFactory(async () => {
                laterCalls += 1

                return 'later'
            })
            .singleton()
            .eager()

        let error: unknown

        try {
            await container.freeze()
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(AsyncMultiProviderResolutionError)

        if (error instanceof AsyncMultiProviderResolutionError) {
            expect(error.phase).toBe('eager-freeze')
            expect(error.cause).toBe(cause)
            expect(error.completedRegistrationIndexes).toEqual([0])
        }

        expect(firstCalls).toBe(1)
        expect(failingCalls).toBe(1)
        expect(laterCalls).toBe(0)

        const runtime = await container.freeze()

        expect(firstCalls).toBe(2)
        expect(failingCalls).toBe(2)
        expect(laterCalls).toBe(1)
        expect(runtime.getAll(values)).toEqual(['first', 'ready', 'later'])
    })

    test('fails sequentially without a partial array or later contribution execution', async () => {
        const values = token<string>('async-multi.failure')
        const container = createContainer()
        const cause = new Error('contribution failed')
        const calls: string[] = []

        container.add(values).toAsyncFactory(async () => {
            calls.push('first')

            return 'first'
        })
        container.add(values).toAsyncFactory(async () => {
            calls.push('second')
            throw cause
        })
        container.add(values).toAsyncFactory(async () => {
            calls.push('third')

            return 'third'
        })

        const runtime = await container.freeze()
        let error: unknown

        try {
            await runtime.getAllAsync(values)
        } catch (caught) {
            error = caught
        }

        expect(calls).toEqual(['first', 'second'])
        expect(error).toBeInstanceOf(AsyncMultiProviderResolutionError)

        if (error instanceof AsyncMultiProviderResolutionError) {
            expect(error.phase).toBe('async-collection')
            expect(error.completedRegistrationIndexes).toEqual([0])
            expect(error.cause).toBe(cause)
            expect(error.details?.contribution).toMatchObject({
                visibility: 'public',
                tokenId: values.id,
                registrationIndex: 1
            })
        }
    })

    test('deduplicates singleton in-flight work per provider without a collection cache', async () => {
        const values = token<{ readonly kind: string; readonly call: number }>(
            'async-multi.concurrent'
        )
        const container = createContainer()
        let release: (() => void) | undefined
        const gate = new Promise<void>((resolve) => {
            release = resolve
        })
        let singletonCalls = 0
        let transientCalls = 0

        container
            .add(values)
            .toAsyncFactory(async () => {
                singletonCalls += 1
                await gate

                return { kind: 'singleton', call: singletonCalls }
            })
            .singleton()
        container.add(values).toAsyncFactory(async () => ({
            kind: 'transient',
            call: (transientCalls += 1)
        }))

        const runtime = await container.freeze()
        const first = runtime.getAllAsync(values)
        const second = runtime.getAllAsync(values)

        await Promise.resolve()
        expect(singletonCalls).toBe(1)
        release?.()

        const [firstValues, secondValues] = await Promise.all([first, second])

        expect(singletonCalls).toBe(1)
        expect(transientCalls).toBe(2)
        expect(firstValues[0]).toBe(secondValues[0])
        expect(firstValues[1]).not.toBe(secondValues[1])
        expect(firstValues).not.toBe(secondValues)
    })

    test('resets only a failed singleton cache and reuses successful providers on retry', async () => {
        const values = token<string>('async-multi.provider-retry')
        const container = createContainer()
        let stableCalls = 0
        let retryCalls = 0
        let transientCalls = 0

        container
            .add(values)
            .toAsyncFactory(async () => {
                stableCalls += 1

                return 'stable'
            })
            .singleton()
        container
            .add(values)
            .toAsyncFactory(async () => {
                retryCalls += 1

                if (retryCalls === 1) {
                    throw new Error('retry me')
                }

                return 'retried'
            })
            .singleton()
        container.add(values).toAsyncFactory(async () => {
            transientCalls += 1

            return `transient-${transientCalls}`
        })

        const runtime = await container.freeze()

        await expect(runtime.getAllAsync(values)).rejects.toBeInstanceOf(
            AsyncMultiProviderResolutionError
        )
        await expect(runtime.getAllAsync(values)).resolves.toEqual([
            'stable',
            'retried',
            'transient-1'
        ])
        await expect(runtime.getAllAsync(values)).resolves.toEqual([
            'stable',
            'retried',
            'transient-2'
        ])

        expect(stableCalls).toBe(1)
        expect(retryCalls).toBe(2)
        expect(transientCalls).toBe(2)
    })

    test('gives missing scope precedence over async blockers without earlier execution', async () => {
        const values = token<string>('async-multi.scope-precedence')
        const container = createContainer()
        let syncCalls = 0
        let lazyCalls = 0
        let scopedCalls = 0

        container.add(values).toFactory(() => {
            syncCalls += 1

            return 'sync'
        })
        container.add(values).toAsyncFactory(async () => {
            lazyCalls += 1

            return 'lazy'
        })
        container
            .add(values)
            .toAsyncFactory(async () => {
                scopedCalls += 1

                return 'scoped'
            })
            .scoped()

        const runtime = await container.freeze()

        expect(() => runtime.getAll(values)).toThrow(InvalidScopeError)
        await expect(runtime.getAllAsync(values)).rejects.toThrow(InvalidScopeError)
        expect(syncCalls).toBe(0)
        expect(lazyCalls).toBe(0)
        expect(scopedCalls).toBe(0)
    })

    test('keeps scoped caches per scope and appends inherited local values after runtime values', async () => {
        const values = token<{ readonly source: string; readonly call: number }>(
            'async-multi.scoped'
        )
        const container = createContainer()
        let calls = 0

        container
            .add(values)
            .toAsyncFactory(async () => ({ source: 'runtime', call: (calls += 1) }))
            .scoped()

        const runtime = await container.freeze()

        expect(() => runtime.getAll(values)).toThrow(InvalidScopeError)
        await expect(runtime.getAllAsync(values)).rejects.toThrow(InvalidScopeError)

        const parentValue = { source: 'parent', call: 0 }
        const childValue = { source: 'child', call: 0 }
        const parent = runtime.createScope({ multiValues: [[values, parentValue]] })
        const child = parent.createChildScope({ multiValues: [[values, childValue]] })
        const sibling = runtime.createScope()
        const childFirst = await child.getAllAsync(values)
        const childSecond = await child.getAllAsync(values)
        const siblingValues = await sibling.getAllAsync(values)

        expect(childFirst.map((value) => value.source)).toEqual(['runtime', 'parent', 'child'])
        expect(childFirst[0]).toBe(childSecond[0])
        expect(childFirst[0]).not.toBe(siblingValues[0])
        expect(calls).toBe(2)

        await child.dispose()
        await parent.dispose()
        await sibling.dispose()
    })

    test('deduplicates and resets failed scoped state inside only the effective scope', async () => {
        const scopeId = token<string>('async-multi.scoped-retry.scope-id')
        const values = token<{ readonly scopeId: string; readonly attempt: number }>(
            'async-multi.scoped-retry.values'
        )
        const container = createContainer()
        const attempts = new Map<string, number>()
        let release: (() => void) | undefined
        const gate = new Promise<void>((resolve) => {
            release = resolve
        })

        container
            .add(values)
            .toAsyncFactory(async ({ get }) => {
                const currentScopeId = get(scopeId)
                const attempt = (attempts.get(currentScopeId) ?? 0) + 1

                attempts.set(currentScopeId, attempt)

                if (attempt === 1) {
                    await gate
                    throw new Error(`first attempt in ${currentScopeId}`)
                }

                return { scopeId: currentScopeId, attempt }
            })
            .scoped()

        const runtime = await container.freeze()
        const firstScope = runtime.createScope({ values: [[scopeId, 'first']] })
        const firstCall = firstScope.getAllAsync(values)
        const concurrentCall = firstScope.getAllAsync(values)

        await Promise.resolve()
        expect(attempts.get('first')).toBe(1)
        release?.()
        await expect(firstCall).rejects.toBeInstanceOf(AsyncMultiProviderResolutionError)
        await expect(concurrentCall).rejects.toBeInstanceOf(AsyncMultiProviderResolutionError)

        const retried = await firstScope.getAllAsync(values)
        const reused = await firstScope.getAllAsync(values)

        expect(retried).toEqual([{ scopeId: 'first', attempt: 2 }])
        expect(retried[0]).toBe(reused[0])
        expect(attempts.get('first')).toBe(2)

        const secondScope = runtime.createScope({ values: [[scopeId, 'second']] })

        await expect(secondScope.getAllAsync(values)).rejects.toBeInstanceOf(
            AsyncMultiProviderResolutionError
        )
        expect(attempts.get('second')).toBe(1)

        await firstScope.dispose()
        await secondScope.dispose()
    })

    test('returns fresh empty arrays and rejects single registrations through getAllAsync', async () => {
        const missing = token<string>('async-multi.missing')
        const single = token<string>('async-multi.single')
        const container = createContainer()

        container.bind(single).toValue('single')

        const runtime = await container.freeze()
        const first = await runtime.getAllAsync(missing)
        const second = await runtime.getAllAsync(missing)

        expect(first).toEqual([])
        expect(first).not.toBe(second)
        await expect(runtime.getAllAsync(single)).rejects.toThrow(ProviderKindMismatchError)
    })

    test('preserves collection cycle diagnostics and does not execute a nested sibling', async () => {
        const values = token<string>('async-multi.cycle')
        const container = createContainer()
        let siblingCalls = 0

        container.add(values).toAsyncFactory(async ({ getAllAsync }) => {
            return (await getAllAsync(values)).join(',')
        })
        container.add(values).toAsyncFactory(async () => {
            siblingCalls += 1

            return 'later'
        })

        const runtime = await container.freeze()
        let error: unknown

        try {
            await runtime.getAllAsync(values)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(ProviderCycleError)
        expect(siblingCalls).toBe(0)

        if (error instanceof ProviderCycleError) {
            expect(error.frames).toEqual([
                { kind: 'collection', visibility: 'public', tokenId: values.id },
                {
                    kind: 'provider',
                    visibility: 'public',
                    tokenId: values.id,
                    registrationIndex: 0,
                    registrationKind: 'multi'
                },
                { kind: 'collection', visibility: 'public', tokenId: values.id }
            ])
        }
    })

    test('detects sync re-entry into an active async collection before access preflight', async () => {
        const values = token<string>('async-multi.sync-reentry-cycle')
        const container = createContainer()
        let siblingCalls = 0

        container.add(values).toAsyncFactory(async ({ getAll }) => getAll(values).join(','))
        container.add(values).toFactory(() => {
            siblingCalls += 1

            return 'later'
        })

        const runtime = await container.freeze()

        await expect(runtime.getAllAsync(values)).rejects.toBeInstanceOf(ProviderCycleError)
        expect(siblingCalls).toBe(0)
    })

    test('sanitizes private collection access and factory failures including cause', async () => {
        const rawTokenId = 'async-multi.raw-private-sentinel'
        const values = token<string>(rawTokenId)
        const container = createContainer()
        const binding = container.add(values)

        setProviderRegistrationIdentity(
            binding,
            createPrivateProviderRegistrationIdentity({
                moduleId: 'safe-module',
                registrationIndex: 3,
                registrationKind: 'multi',
                privateCollectionOrdinal: 1,
                contributionIndex: 0
            })
        )
        binding.toAsyncFactory(async () => {
            throw new Error(rawTokenId)
        })

        const runtime = await container.freeze()
        let accessError: unknown
        let resolutionError: unknown

        try {
            runtime.getAll(values)
        } catch (caught) {
            accessError = caught
        }

        try {
            await runtime.getAllAsync(values)
        } catch (caught) {
            resolutionError = caught
        }

        expect(accessError).toBeInstanceOf(AsyncMultiProviderAccessError)
        expect(resolutionError).toBeInstanceOf(AsyncMultiProviderResolutionError)
        expect(JSON.stringify(accessError)).not.toContain(rawTokenId)
        expect(JSON.stringify(resolutionError)).not.toContain(rawTokenId)

        if (resolutionError instanceof AsyncMultiProviderResolutionError) {
            expect(resolutionError.message).not.toContain(rawTokenId)
            expect(resolutionError.cause).toBeUndefined()
            expect(resolutionError.details?.collection).toEqual({
                kind: 'collection',
                visibility: 'private',
                moduleId: 'safe-module',
                privateCollectionOrdinal: 1
            })
        }
    })

    test('keeps private async collection cycles typed and free of raw token IDs', async () => {
        const rawTokenId = 'async-multi.raw-private-cycle-sentinel'
        const values = token<string>(rawTokenId)
        const container = createContainer()
        const binding = container.add(values)

        setProviderRegistrationIdentity(
            binding,
            createPrivateProviderRegistrationIdentity({
                moduleId: 'safe-cycle-module',
                registrationIndex: 7,
                registrationKind: 'multi',
                privateCollectionOrdinal: 3,
                contributionIndex: 0
            })
        )
        binding.toAsyncFactory(async ({ getAllAsync }) => {
            return (await getAllAsync(values)).join(',')
        })

        const runtime = await container.freeze()
        let error: unknown

        try {
            await runtime.getAllAsync(values)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(ProviderCycleError)
        expect(JSON.stringify(error)).not.toContain(rawTokenId)

        if (error instanceof ProviderCycleError) {
            expect(error.message).not.toContain(rawTokenId)
            expect(error.cause).toBeUndefined()
            expect(error.frames).toEqual([
                {
                    kind: 'collection',
                    visibility: 'private',
                    moduleId: 'safe-cycle-module',
                    privateCollectionOrdinal: 3
                },
                {
                    kind: 'provider',
                    visibility: 'private',
                    moduleId: 'safe-cycle-module',
                    registrationIndex: 7,
                    registrationKind: 'multi',
                    privateCollectionOrdinal: 3,
                    contributionIndex: 0
                },
                {
                    kind: 'collection',
                    visibility: 'private',
                    moduleId: 'safe-cycle-module',
                    privateCollectionOrdinal: 3
                }
            ])
        }
    })

    test('does not trust a user-thrown legacy cycle error from a private contribution', async () => {
        const rawTokenId = 'async-multi.raw-user-cycle-sentinel'
        const values = token<string>(rawTokenId)
        const container = createContainer()
        const binding = container.add(values)

        setProviderRegistrationIdentity(
            binding,
            createPrivateProviderRegistrationIdentity({
                moduleId: 'safe-user-cycle-module',
                registrationIndex: 8,
                registrationKind: 'multi',
                privateCollectionOrdinal: 4,
                contributionIndex: 0
            })
        )
        binding.toAsyncFactory(async () => {
            throw new ProviderCycleError([rawTokenId])
        })

        const runtime = await container.freeze()
        let error: unknown

        try {
            await runtime.getAllAsync(values)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(AsyncMultiProviderResolutionError)
        expect(JSON.stringify(error)).not.toContain(rawTokenId)

        if (error instanceof AsyncMultiProviderResolutionError) {
            expect(error.message).not.toContain(rawTokenId)
            expect(error.cause).toBeUndefined()
        }
    })

    test('sanitizes private eager-freeze failures and stops before later contributions', async () => {
        const rawTokenId = 'async-multi.raw-private-eager-sentinel'
        const values = token<string>(rawTokenId)
        const container = createContainer()
        const failingBinding = container.add(values)
        let laterCalls = 0

        setProviderRegistrationIdentity(
            failingBinding,
            createPrivateProviderRegistrationIdentity({
                moduleId: 'safe-eager-module',
                registrationIndex: 4,
                registrationKind: 'multi',
                privateCollectionOrdinal: 2,
                contributionIndex: 0
            })
        )
        failingBinding
            .toAsyncFactory(async () => {
                throw new Error(rawTokenId)
            })
            .singleton()
            .eager()

        const laterBinding = container.add(values)

        setProviderRegistrationIdentity(
            laterBinding,
            createPrivateProviderRegistrationIdentity({
                moduleId: 'safe-eager-module',
                registrationIndex: 5,
                registrationKind: 'multi',
                privateCollectionOrdinal: 2,
                contributionIndex: 1
            })
        )
        laterBinding
            .toAsyncFactory(async () => {
                laterCalls += 1

                return 'later'
            })
            .singleton()
            .eager()

        let error: unknown

        try {
            await container.freeze()
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(AsyncMultiProviderResolutionError)
        expect(laterCalls).toBe(0)
        expect(JSON.stringify(error)).not.toContain(rawTokenId)

        if (error instanceof AsyncMultiProviderResolutionError) {
            expect(error.phase).toBe('eager-freeze')
            expect(error.cause).toBeUndefined()
            expect(error.message).not.toContain(rawTokenId)
        }
    })

    test('normalizes dependency metadata for async contributions and rejects invalid declarations', async () => {
        const dependency = token<string>('async-multi.metadata.dependency')
        const values = token<string>('async-multi.metadata.values')
        const invalid = token<string>('async-multi.metadata.invalid')
        const container = createContainer()

        container.bind(dependency).toValue('dependency')
        container.add(values).toAsyncFactory(async ({ get }) => get(dependency), {
            dependencies: [{ token: dependency, access: 'instance' }]
        })

        expect(() =>
            container.add(invalid).toAsyncFactory(async () => 'invalid', {
                dependencies: [
                    {
                        token: dependency,
                        access: 'invalid' as 'instance'
                    }
                ]
            })
        ).toThrow(DependencyMetadataInvalidError)

        const runtime = await container.freeze()
        const snapshot = getProviderGraphSnapshot(runtime)

        expect(snapshot.nodes).toContainEqual({
            key: { visibility: 'public', tokenId: values.id, registrationIndex: 0 },
            registrationKind: 'multi',
            providerKind: 'async-factory',
            lifetime: 'transient',
            initialization: 'lazy'
        })
        expect(snapshot.dependencyEdges).toContainEqual({
            selectorIndex: 0,
            consumer: { visibility: 'public', tokenId: values.id, registrationIndex: 0 },
            dependency: {
                visibility: 'public',
                tokenId: dependency.id,
                registrationIndex: 0
            },
            access: 'instance'
        })
        expect(snapshot.providerCoverage).toContainEqual({
            provider: { visibility: 'public', tokenId: values.id, registrationIndex: 0 },
            coverage: 'declared'
        })
        expect(snapshot.coverage).toBe('complete')
        await expect(runtime.getAllAsync(values)).resolves.toEqual(['dependency'])
    })
})
