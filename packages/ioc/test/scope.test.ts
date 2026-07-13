import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    DuplicateScopeLocalValueError,
    InvalidScopeError,
    ProviderCycleError,
    ProviderKindMismatchError,
    ProviderNotFoundError,
    ScopeDisposedError,
    SyncFactoryPromiseError,
    createContainer,
    scopeMultiValue,
    scopeValue,
    type ContainerRuntime,
    type CreateScopeOptions,
    type LifetimeBinding,
    type ResolutionContext,
    type Scope
} from '../src/container.js'
import { token } from '../src/tokens.js'

interface Counter {
    readonly value: number
}

interface Logger {
    readonly name: string
}

interface Missing {
    readonly value: string
}

interface Plugin {
    readonly name: string
}

interface RequestService {
    readonly requestId: string
    readonly counter: Counter
    readonly missing: Missing | undefined
    readonly plugins: Plugin[]
}

interface ScopedSession {
    readonly requestId: string
    readonly userId: string
    readonly preview: boolean
    readonly instanceId: number
}

const REQUEST_ID = token<string>('scope.request-id')
const USER_ID = token<string>('scope.user-id')
const PREVIEW_MODE = token<boolean>('scope.preview-mode')
const LOGGER = token<Logger>('scope.logger')
const COUNTER = token<Counter>('scope.counter')
const CLASS_COUNTER = token<Counter>('scope.class-counter')
const MISSING = token<Missing>('scope.missing')
const PLUGINS = token<Plugin>('scope.plugins')
const REQUEST_SERVICE = token<RequestService>('scope.request-service')
const SCOPED_SESSION = token<ScopedSession>('scope.scoped-session')

describe('container scopes', () => {
    test('resolves scope-local single values before runtime single providers', async () => {
        const container = createContainer()
        const runtimeLogger = createLogger('runtime')
        const localLogger = createLogger('local')

        container.bind(LOGGER).toValue(runtimeLogger)

        const runtime = await container.freeze()
        const scope = runtime.createScope({
            values: [scopeValue(LOGGER, localLogger)]
        })

        expect(scope.get(LOGGER)).toBe(localLogger)
        expect(scope.tryGet(LOGGER)).toBe(localLogger)
        expect(runtime.get(LOGGER)).toBe(runtimeLogger)
        expect(scope.tryGet(MISSING)).toBeUndefined()
        expect(() => scope.get(MISSING)).toThrow(ProviderNotFoundError)
    })

    test('extends runtime multi-provider values with scope-local multi values', async () => {
        const container = createContainer()
        const runtimePlugin = createPlugin('runtime')
        const localPlugin = createPlugin('local')
        const tupleLocalPlugin = createPlugin('tuple-local')

        container.add(PLUGINS).toValue(runtimePlugin)

        const runtime = await container.freeze()
        const scope = runtime.createScope({
            multiValues: [scopeMultiValue(PLUGINS, localPlugin), [PLUGINS, tupleLocalPlugin]]
        })
        const localOnly = runtime.createScope({
            multiValues: [[MISSING, { value: 'local-only' }]]
        })
        const firstResult = scope.getAll(PLUGINS)
        const missingResult = scope.getAll(MISSING)

        firstResult.push(createPlugin('mutated'))
        missingResult.push({
            value: 'mutated'
        })

        expect(scope.getAll(PLUGINS)).toEqual([runtimePlugin, localPlugin, tupleLocalPlugin])
        expect(localOnly.getAll(MISSING)).toEqual([
            {
                value: 'local-only'
            }
        ])
        expect(scope.getAll(MISSING)).toEqual([])
        expect(scope.getAll(PLUGINS)).not.toBe(scope.getAll(PLUGINS))
        expect(scope.getAll(MISSING)).not.toBe(scope.getAll(MISSING))
    })

    test('rejects scope-local single and multi kind conflicts', async () => {
        const container = createContainer()
        const localOnly = token<string>('scope.local-only')
        const duplicateAlias = token<Logger>('scope.duplicate-local')
        const duplicateOriginal = token<Logger>('scope.duplicate-local')
        const multiOnly = token<string>('scope.multi-only')

        container.bind(LOGGER).toValue(createLogger('runtime'))
        container.add(PLUGINS).toValue(createPlugin('runtime'))

        const runtime = await container.freeze()

        expect(() =>
            runtime.createScope({
                values: [scopeValue(PLUGINS, createPlugin('invalid'))]
            })
        ).toThrow(ProviderKindMismatchError)
        expect(() =>
            runtime.createScope({
                multiValues: [scopeMultiValue(LOGGER, createLogger('invalid'))]
            })
        ).toThrow(ProviderKindMismatchError)
        expect(() =>
            runtime.createScope({
                values: [[localOnly, 'single']],
                multiValues: [[localOnly, 'multi']]
            })
        ).toThrow(ProviderKindMismatchError)
        expect(() =>
            runtime.createScope({
                values: [
                    scopeValue(duplicateOriginal, createLogger('first')),
                    scopeValue(duplicateAlias, createLogger('second'))
                ]
            })
        ).toThrow(DuplicateScopeLocalValueError)

        const scope = runtime.createScope({
            multiValues: [
                [multiOnly, 'first'],
                [multiOnly, 'second']
            ]
        })

        expect(scope.getAll(multiOnly)).toEqual(['first', 'second'])
        expect(() => scope.get(multiOnly)).toThrow(ProviderKindMismatchError)
        expect(() => scope.tryGet(multiOnly)).toThrow(ProviderKindMismatchError)
    })

    test('inherits parent scope-local single values and lets child overrides shadow them', async () => {
        const container = createContainer()

        container.bind(LOGGER).toValue(createLogger('runtime'))

        const runtime = await container.freeze()
        const parent = runtime.createScope({
            values: [
                [REQUEST_ID, 'request-1'],
                [USER_ID, 'parent-user'],
                [PREVIEW_MODE, false]
            ]
        })
        const inheritedChild = parent.createChildScope()
        const overrideChild = parent.createChildScope({
            values: [
                [USER_ID, 'impersonated-user'],
                [PREVIEW_MODE, true]
            ]
        })
        const grandchild = overrideChild.createChildScope()

        expect(inheritedChild.get(REQUEST_ID)).toBe('request-1')
        expect(inheritedChild.tryGet(USER_ID)).toBe('parent-user')
        await expect(inheritedChild.getAsync(PREVIEW_MODE)).resolves.toBe(false)
        expect(inheritedChild.get(LOGGER)).toEqual(createLogger('runtime'))
        expect(overrideChild.get(REQUEST_ID)).toBe('request-1')
        expect(overrideChild.get(USER_ID)).toBe('impersonated-user')
        expect(overrideChild.get(PREVIEW_MODE)).toBe(true)
        expect(grandchild.get(USER_ID)).toBe('impersonated-user')
        expect(parent.get(USER_ID)).toBe('parent-user')

        await parent.dispose()
    })

    test('inherits parent scope-local multi values and appends child values after them', async () => {
        const container = createContainer()
        const runtimePlugin = createPlugin('runtime')
        const parentPlugin = createPlugin('parent')
        const childPlugin = createPlugin('child')
        const grandchildPlugin = createPlugin('grandchild')

        container.add(PLUGINS).toValue(runtimePlugin)

        const runtime = await container.freeze()
        const parent = runtime.createScope({
            multiValues: [
                [PLUGINS, parentPlugin],
                [MISSING, { value: 'parent-only' }]
            ]
        })
        const child = parent.createChildScope({
            multiValues: [
                [PLUGINS, childPlugin],
                [MISSING, { value: 'child-only' }]
            ]
        })
        const grandchild = child.createChildScope({
            multiValues: [[PLUGINS, grandchildPlugin]]
        })
        const missingValues = child.getAll(MISSING)

        missingValues.push({
            value: 'mutated'
        })

        expect(child.getAll(PLUGINS)).toEqual([runtimePlugin, parentPlugin, childPlugin])
        expect(grandchild.getAll(PLUGINS)).toEqual([
            runtimePlugin,
            parentPlugin,
            childPlugin,
            grandchildPlugin
        ])
        expect(child.getAll(MISSING)).toEqual([
            {
                value: 'parent-only'
            },
            {
                value: 'child-only'
            }
        ])

        await parent.dispose()
    })

    test('rejects child scope-local kind conflicts with inherited parent values', async () => {
        const container = createContainer()
        const runtime = await container.freeze()
        const singleParent = runtime.createScope({
            values: [[REQUEST_ID, 'parent']]
        })
        const multiParent = runtime.createScope({
            multiValues: [[PLUGINS, createPlugin('parent')]]
        })

        expect(() =>
            singleParent.createChildScope({
                multiValues: [[REQUEST_ID, 'child']]
            })
        ).toThrow(ProviderKindMismatchError)
        expect(() =>
            multiParent.createChildScope({
                values: [[PLUGINS, createPlugin('child')]]
            })
        ).toThrow(ProviderKindMismatchError)

        await singleParent.dispose()
        await multiParent.dispose()
    })

    test('caches scoped single factory and class providers per scope', async () => {
        const container = createContainer()
        let nextClassCounter = 0

        class ScopedCounter {
            readonly value = (nextClassCounter += 1)
        }

        container.bind(COUNTER).toFactory(createCounterFactory()).scoped()
        container.bind(CLASS_COUNTER).toClass(ScopedCounter).scoped()

        const runtime = await container.freeze()
        const firstScope = runtime.createScope()
        const secondScope = runtime.createScope()

        expect(() => runtime.get(COUNTER)).toThrow(InvalidScopeError)
        expect(() => runtime.tryGet(COUNTER)).toThrow(InvalidScopeError)
        expect(firstScope.get(COUNTER)).toBe(firstScope.get(COUNTER))
        expect(firstScope.get(COUNTER)).not.toBe(secondScope.get(COUNTER))
        expect(firstScope.get(CLASS_COUNTER)).toBe(firstScope.get(CLASS_COUNTER))
        expect(firstScope.get(CLASS_COUNTER)).not.toBe(secondScope.get(CLASS_COUNTER))
    })

    test('rejects Promise results from scoped sync single factories', async () => {
        const container = createContainer()
        let calls = 0

        container
            .bind(COUNTER)
            .toFactory((() => {
                calls += 1

                return Promise.resolve({
                    value: calls
                })
            }) as unknown as () => Counter)
            .scoped()

        const runtime = await container.freeze()
        const scope = runtime.createScope()

        expect(() => scope.get(COUNTER)).toThrow(SyncFactoryPromiseError)
        await expect(scope.getAsync(COUNTER)).rejects.toThrow(SyncFactoryPromiseError)
        expect(calls).toBe(2)
    })

    test('caches scoped multi-provider factory contributions per scope', async () => {
        const container = createContainer()

        container.add(COUNTER).toFactory(createCounterFactory()).scoped()
        container.add(COUNTER).toFactory(createCounterFactory()).scoped()

        const runtime = await container.freeze()
        const firstScope = runtime.createScope()
        const secondScope = runtime.createScope()
        const firstValues = firstScope.getAll(COUNTER)
        const secondValues = firstScope.getAll(COUNTER)
        const otherScopeValues = secondScope.getAll(COUNTER)

        expect(() => runtime.getAll(COUNTER)).toThrow(InvalidScopeError)
        expect(firstValues).toHaveLength(2)
        expect(firstValues[0]).toBe(secondValues[0])
        expect(firstValues[1]).toBe(secondValues[1])
        expect(firstValues[0]).not.toBe(otherScopeValues[0])
        expect(firstValues[1]).not.toBe(otherScopeValues[1])
    })

    test('keeps child scoped provider cache separate while factories see child overrides', async () => {
        const container = createContainer()
        let instanceId = 0

        container
            .bind(SCOPED_SESSION)
            .toFactory(({ get }) => {
                instanceId += 1

                return {
                    requestId: get(REQUEST_ID),
                    userId: get(USER_ID),
                    preview: get(PREVIEW_MODE),
                    instanceId
                }
            })
            .scoped()

        const runtime = await container.freeze()
        const parent = runtime.createScope({
            values: [
                [REQUEST_ID, 'request-1'],
                [USER_ID, 'parent-user'],
                [PREVIEW_MODE, false]
            ]
        })
        const parentSession = parent.get(SCOPED_SESSION)
        const inheritedChild = parent.createChildScope()
        const inheritedChildSession = inheritedChild.get(SCOPED_SESSION)
        const overrideChild = parent.createChildScope({
            values: [
                [USER_ID, 'impersonated-user'],
                [PREVIEW_MODE, true]
            ]
        })
        const overrideChildSession = overrideChild.get(SCOPED_SESSION)

        expect(parent.get(SCOPED_SESSION)).toBe(parentSession)
        expect(inheritedChild.get(SCOPED_SESSION)).toBe(inheritedChildSession)
        expect(overrideChild.get(SCOPED_SESSION)).toBe(overrideChildSession)
        expect(inheritedChildSession).not.toBe(parentSession)
        expect(overrideChildSession).not.toBe(parentSession)
        expect(parentSession).toEqual({
            requestId: 'request-1',
            userId: 'parent-user',
            preview: false,
            instanceId: 1
        })
        expect(inheritedChildSession).toEqual({
            requestId: 'request-1',
            userId: 'parent-user',
            preview: false,
            instanceId: 2
        })
        expect(overrideChildSession).toEqual({
            requestId: 'request-1',
            userId: 'impersonated-user',
            preview: true,
            instanceId: 3
        })

        await parent.dispose()
    })

    test('rejects thenable results from scoped sync multi-provider factories', async () => {
        const container = createContainer()
        const thenablePlugin = {
            then(resolve: (value: Plugin) => void): void {
                resolve(createPlugin('resolved'))
            }
        } as unknown as Plugin

        container
            .add(PLUGINS)
            .toFactory(() => thenablePlugin)
            .scoped()

        const runtime = await container.freeze()
        const scope = runtime.createScope()

        expect(() => scope.getAll(PLUGINS)).toThrow(SyncFactoryPromiseError)
    })

    test('passes a scope-bound resolution context to providers resolved through scopes', async () => {
        const container = createContainer()

        container.add(PLUGINS).toValue(createPlugin('runtime'))
        container.bind(COUNTER).toFactory(createCounterFactory()).scoped()
        container.bind(REQUEST_SERVICE).toFactory((context) => {
            expectTypeOf(context).toEqualTypeOf<ResolutionContext>()
            expectTypeOf(context.get(REQUEST_ID)).toEqualTypeOf<string>()
            expectTypeOf(context.get(COUNTER)).toEqualTypeOf<Counter>()
            expectTypeOf(context.tryGet(MISSING)).toEqualTypeOf<Missing | undefined>()
            expectTypeOf(context.getAll(PLUGINS)).toEqualTypeOf<Plugin[]>()

            return {
                requestId: context.get(REQUEST_ID),
                counter: context.get(COUNTER),
                missing: context.tryGet(MISSING),
                plugins: context.getAll(PLUGINS)
            }
        })

        const runtime = await container.freeze()
        const scope = runtime.createScope({
            values: [[REQUEST_ID, 'request-1']],
            multiValues: [[PLUGINS, createPlugin('local')]]
        })
        const service = scope.get(REQUEST_SERVICE)

        expect(service.requestId).toBe('request-1')
        expect(service.counter).toBe(scope.get(COUNTER))
        expect(service.missing).toBeUndefined()
        expect(service.plugins).toEqual([createPlugin('runtime'), createPlugin('local')])
    })

    test('detects provider cycles through scope-bound get and getAll', async () => {
        const first = token<string>('scope.cycle.first')
        const second = token<string>('scope.cycle.second')
        const multi = token<string>('scope.cycle.multi')
        const multiDependency = token<string>('scope.cycle.multi-dependency')
        const container = createContainer()

        container
            .bind(first)
            .toFactory(({ get }) => get(second))
            .scoped()
        container
            .bind(second)
            .toFactory(({ get }) => get(first))
            .scoped()
        container
            .add(multi)
            .toFactory(({ get }) => get(multiDependency))
            .scoped()
        container
            .bind(multiDependency)
            .toFactory(({ getAll }) => getAll(multi)[0] ?? 'missing')
            .scoped()

        const runtime = await container.freeze()
        const scope = runtime.createScope()

        expect(() => scope.get(first)).toThrow(ProviderCycleError)
        expect(() => scope.getAll(multi)).toThrow(ProviderCycleError)
    })

    test('makes dispose idempotent and rejects disposed scope resolution', async () => {
        const container = createContainer()

        container.bind(LOGGER).toValue(createLogger('runtime'))

        const runtime = await container.freeze()
        const scope = runtime.createScope({
            values: [[REQUEST_ID, 'request-1']]
        })

        await scope.dispose()
        await scope.dispose()

        expect(() => scope.get(REQUEST_ID)).toThrow(ScopeDisposedError)
        expect(() => scope.tryGet(LOGGER)).toThrow(ScopeDisposedError)
        expect(() => scope.getAll(PLUGINS)).toThrow(ScopeDisposedError)
    })

    test('creates explicit child scopes and keeps parent alive after child disposal', async () => {
        const container = createContainer()

        container.bind(LOGGER).toValue(createLogger('runtime'))

        const runtime = await container.freeze()
        const parent = runtime.createScope({
            values: [[REQUEST_ID, 'parent']]
        })
        const child = parent.createChildScope({
            values: [[REQUEST_ID, 'child']]
        })

        expect(child.get(REQUEST_ID)).toBe('child')

        await child.dispose()

        expect(() => child.get(REQUEST_ID)).toThrow(ScopeDisposedError)
        expect(parent.get(REQUEST_ID)).toBe('parent')
        expect(parent.get(LOGGER)).toEqual(createLogger('runtime'))

        const nextChild = parent.createChildScope({
            values: [[REQUEST_ID, 'next-child']]
        })

        expect(nextChild.get(REQUEST_ID)).toBe('next-child')

        await parent.dispose()

        expectScopeDisposed(parent)
        expectScopeDisposed(nextChild)
        expect(() => parent.createChildScope()).toThrow(ScopeDisposedError)
    })

    test('disposes withChildScope children after success and failure', async () => {
        const container = createContainer()

        container.bind(LOGGER).toValue(createLogger('runtime'))

        const runtime = await container.freeze()
        const parent = runtime.createScope({
            values: [[REQUEST_ID, 'parent']]
        })
        let successChild: Scope | undefined
        let thrownChild: Scope | undefined
        let rejectedChild: Scope | undefined

        const result = await parent.withChildScope(
            {
                values: [[REQUEST_ID, 'success-child']]
            },
            (childScope) => {
                successChild = childScope

                return childScope.get(REQUEST_ID)
            }
        )

        await expect(
            parent.withChildScope(
                {
                    values: [[REQUEST_ID, 'thrown-child']]
                },
                (childScope) => {
                    thrownChild = childScope

                    throw new Error('child sync failure')
                }
            )
        ).rejects.toThrow('child sync failure')
        await expect(
            parent.withChildScope(async (childScope) => {
                rejectedChild = childScope

                throw new Error('child async failure')
            })
        ).rejects.toThrow('child async failure')

        expect(result).toBe('success-child')
        expect(parent.get(REQUEST_ID)).toBe('parent')
        expectScopeDisposed(successChild)
        expectScopeDisposed(thrownChild)
        expectScopeDisposed(rejectedChild)

        await parent.dispose()
    })

    test('disposes active child scopes in reverse creation order before parent resources', async () => {
        const container = createContainer()
        const disposed: string[] = []

        container
            .bind(COUNTER)
            .toAsyncResource(async ({ get }) => {
                const requestId = get(REQUEST_ID)

                return {
                    value: {
                        value: requestId.length
                    },
                    dispose(): void {
                        disposed.push(requestId)
                    }
                }
            })
            .scoped()

        const runtime = await container.freeze()
        const parent = runtime.createScope({
            values: [[REQUEST_ID, 'parent']]
        })
        const firstChild = parent.createChildScope({
            values: [[REQUEST_ID, 'child-1']]
        })
        const secondChild = parent.createChildScope({
            values: [[REQUEST_ID, 'child-2']]
        })

        await parent.getAsync(COUNTER)
        await firstChild.getAsync(COUNTER)
        await secondChild.getAsync(COUNTER)
        await parent.dispose()
        await parent.dispose()

        expect(disposed).toEqual(['child-2', 'child-1', 'parent'])
        expectScopeDisposed(parent)
        expectScopeDisposed(firstChild)
        expectScopeDisposed(secondChild)
    })

    test('continues parent disposal when a child disposer fails', async () => {
        const container = createContainer()
        const disposed: string[] = []

        container
            .bind(COUNTER)
            .toAsyncResource(async ({ get }) => {
                const requestId = get(REQUEST_ID)

                return {
                    value: {
                        value: requestId.length
                    },
                    dispose(): void {
                        disposed.push(requestId)

                        if (requestId === 'child-2') {
                            throw new Error('child-2 dispose failed')
                        }
                    }
                }
            })
            .scoped()

        const runtime = await container.freeze()
        const parent = runtime.createScope({
            values: [[REQUEST_ID, 'parent']]
        })
        const firstChild = parent.createChildScope({
            values: [[REQUEST_ID, 'child-1']]
        })
        const secondChild = parent.createChildScope({
            values: [[REQUEST_ID, 'child-2']]
        })
        const thirdChild = parent.createChildScope({
            values: [[REQUEST_ID, 'child-3']]
        })

        await parent.getAsync(COUNTER)
        await firstChild.getAsync(COUNTER)
        await secondChild.getAsync(COUNTER)
        await thirdChild.getAsync(COUNTER)

        await expect(parent.dispose()).rejects.toThrow('child-2 dispose failed')
        await parent.dispose()

        expect(disposed).toEqual(['child-3', 'child-2', 'child-1', 'parent'])
        expectScopeDisposed(parent)
        expectScopeDisposed(firstChild)
        expectScopeDisposed(secondChild)
        expectScopeDisposed(thirdChild)
    })

    test('disposes withScope scopes after sync, async and failing callbacks', async () => {
        const container = createContainer()
        const runtime = await container.freeze()
        let syncScope: Scope | undefined
        let asyncScope: Scope | undefined
        let thrownScope: Scope | undefined
        let rejectedScope: Scope | undefined

        const syncResult = await runtime.withScope(
            {
                values: [[REQUEST_ID, 'sync']]
            },
            (scope) => {
                syncScope = scope

                return scope.get(REQUEST_ID)
            }
        )
        const asyncResult = await runtime.withScope(
            {
                values: [[REQUEST_ID, 'async']]
            },
            async (scope) => {
                asyncScope = scope

                return scope.get(REQUEST_ID)
            }
        )

        await expect(
            runtime.withScope(
                {
                    values: [[REQUEST_ID, 'thrown']]
                },
                (scope) => {
                    thrownScope = scope

                    throw new Error('sync failure')
                }
            )
        ).rejects.toThrow('sync failure')
        await expect(
            runtime.withScope(
                {
                    values: [[REQUEST_ID, 'rejected']]
                },
                async (scope) => {
                    rejectedScope = scope

                    throw new Error('async failure')
                }
            )
        ).rejects.toThrow('async failure')

        expect(syncResult).toBe('sync')
        expect(asyncResult).toBe('async')
        expectScopeDisposed(syncScope)
        expectScopeDisposed(asyncScope)
        expectScopeDisposed(thrownScope)
        expectScopeDisposed(rejectedScope)
    })

    test('preserves scope type inference and exposes async collection access', async () => {
        const container = createContainer()
        const options: CreateScopeOptions = {
            values: [scopeValue(REQUEST_ID, 'typed')],
            multiValues: [scopeMultiValue(PLUGINS, createPlugin('typed'))]
        }
        const lifetime = container.bind(COUNTER).toFactory(() => ({
            value: 1
        }))

        expectTypeOf(scopeValue(LOGGER, createLogger('typed')).value).toEqualTypeOf<Logger>()
        expectTypeOf(scopeMultiValue(PLUGINS, createPlugin('typed')).value).toEqualTypeOf<Plugin>()
        expectTypeOf(lifetime).toEqualTypeOf<LifetimeBinding>()

        lifetime.scoped()

        const runtime = await container.freeze()
        const scope = runtime.createScope(options)
        const childScope = scope.createChildScope(options)
        const inferredWithScope = runtime.withScope((callbackScope) => callbackScope.get(COUNTER))
        const inferredWithOptions = runtime.withScope(options, (callbackScope) =>
            callbackScope.get(COUNTER)
        )
        const inferredWithChildScope = scope.withChildScope((callbackScope) =>
            callbackScope.get(COUNTER)
        )
        const inferredWithChildOptions = scope.withChildScope(options, (callbackScope) =>
            callbackScope.get(COUNTER)
        )

        expectTypeOf(runtime).toEqualTypeOf<ContainerRuntime>()
        expectTypeOf(scope).toEqualTypeOf<Scope>()
        expectTypeOf(childScope).toEqualTypeOf<Scope>()
        expectTypeOf(scope.get(COUNTER)).toEqualTypeOf<Counter>()
        expectTypeOf(scope.tryGet(COUNTER)).toEqualTypeOf<Counter | undefined>()
        expectTypeOf(scope.getAll(PLUGINS)).toEqualTypeOf<Plugin[]>()
        expectTypeOf(scope.getAsync(COUNTER)).toEqualTypeOf<Promise<Counter>>()
        expectTypeOf(scope.createChildScope).toEqualTypeOf<
            (options?: CreateScopeOptions) => Scope
        >()
        expectTypeOf(inferredWithScope).toEqualTypeOf<Promise<Counter>>()
        expectTypeOf(inferredWithOptions).toEqualTypeOf<Promise<Counter>>()
        expectTypeOf(inferredWithChildScope).toEqualTypeOf<Promise<Counter>>()
        expectTypeOf(inferredWithChildOptions).toEqualTypeOf<Promise<Counter>>()

        await childScope.dispose()
        await inferredWithScope
        await inferredWithOptions
        await inferredWithChildScope
        await inferredWithChildOptions
        await scope.dispose()

        expect('getAsync' in scope).toBe(true)
        expect('createChildScope' in scope).toBe(true)
        expect('withChildScope' in scope).toBe(true)
        expect('getAsync' in runtime).toBe(true)
        expect('tryGetAsync' in runtime).toBe(true)
        expect('dispose' in runtime).toBe(true)
        expect('getAllAsync' in scope).toBe(true)
        expect('tryGetAsync' in scope).toBe(false)
    })
})

function createLogger(name: string): Logger {
    return {
        name
    }
}

function createPlugin(name: string): Plugin {
    return {
        name
    }
}

function createCounterFactory(): () => Counter {
    let nextValue = 0

    return () => ({
        value: (nextValue += 1)
    })
}

function expectScopeDisposed(scope: Scope | undefined): void {
    expect(scope).toBeDefined()

    if (scope === undefined) {
        return
    }

    expect(() => scope.get(REQUEST_ID)).toThrow(ScopeDisposedError)
}
