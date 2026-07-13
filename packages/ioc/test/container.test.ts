import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    ContainerFrozenError,
    DuplicateProviderError,
    ProviderCycleError,
    ProviderKindMismatchError,
    ProviderNotFoundError,
    SyncFactoryPromiseError,
    createContainer,
    type ContainerMultiBindingBuilder,
    type ContainerRuntime,
    type ProviderCycleFrame,
    type ResolutionContext
} from '../src/container.js'
import { token } from '../src/tokens.js'

interface Logger {
    log(message: string): void
}

interface Counter {
    readonly value: number
}

interface Service {
    readonly logger: Logger
    readonly missing: Missing | undefined
}

interface Missing {
    readonly value: string
}

interface Plugin {
    readonly name: string
}

const LOGGER = token<Logger>('container.logger')
const COUNTER = token<Counter>('container.counter')
const SERVICE = token<Service>('container.service')
const MISSING = token<Missing>('container.missing')
const PLUGINS = token<Plugin>('container.plugins')

describe('container sync providers', () => {
    test('resolves value providers as singletons', async () => {
        const container = createContainer()
        const logger = createLogger()

        container.bind(LOGGER).toValue(logger)

        const runtime = await container.freeze()

        expect(runtime.get(LOGGER)).toBe(logger)
        expect(runtime.tryGet(LOGGER)).toBe(logger)
    })

    test('uses token id as canonical provider identity', async () => {
        const container = createContainer()
        const original = token<Logger>('container.same-id')
        const alias = token<Logger>('container.same-id')
        const logger = createLogger()

        container.bind(original).toValue(logger)

        const runtime = await container.freeze()

        expect(runtime.get(alias)).toBe(logger)
    })

    test('resolves factory providers as transient by default', async () => {
        const container = createContainer()
        let nextValue = 0

        container.bind(COUNTER).toFactory(() => ({
            value: (nextValue += 1)
        }))

        const runtime = await container.freeze()

        expect(runtime.get(COUNTER)).toEqual({
            value: 1
        })
        expect(runtime.get(COUNTER)).toEqual({
            value: 2
        })
    })

    test('can make factory providers singleton or explicitly transient', async () => {
        const singletonContainer = createContainer()
        const transientContainer = createContainer()

        singletonContainer.bind(COUNTER).toFactory(createCounterFactory()).singleton()
        transientContainer.bind(COUNTER).toFactory(createCounterFactory()).transient()

        const singletonRuntime = await singletonContainer.freeze()
        const transientRuntime = await transientContainer.freeze()

        expect(singletonRuntime.get(COUNTER)).toBe(singletonRuntime.get(COUNTER))
        expect(transientRuntime.get(COUNTER)).not.toBe(transientRuntime.get(COUNTER))
    })

    test('rejects Promise results from sync single factory providers', async () => {
        const transientContainer = createContainer()
        const singletonContainer = createContainer()
        const promiseFactory = (() => Promise.resolve(createLogger())) as unknown as () => Logger
        let singletonCalls = 0

        transientContainer.bind(LOGGER).toFactory(promiseFactory)
        singletonContainer
            .bind(LOGGER)
            .toFactory((() => {
                singletonCalls += 1

                return Promise.resolve(createLogger())
            }) as unknown as () => Logger)
            .singleton()

        const transientRuntime = await transientContainer.freeze()
        const singletonRuntime = await singletonContainer.freeze()
        let error: unknown

        try {
            transientRuntime.get(LOGGER)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(SyncFactoryPromiseError)

        if (error instanceof SyncFactoryPromiseError) {
            expect(error.code).toBe('SAGIFIRE_IOC_SYNC_FACTORY_PROMISE')
            expect(error.tokenId).toBe('container.logger')
            expect(error.details).toEqual({
                tokenId: 'container.logger'
            })
        }

        expect(() => transientRuntime.tryGet(LOGGER)).toThrow(SyncFactoryPromiseError)
        await expect(transientRuntime.getAsync(LOGGER)).rejects.toThrow(SyncFactoryPromiseError)
        expect(() => singletonRuntime.get(LOGGER)).toThrow(SyncFactoryPromiseError)
        expect(() => singletonRuntime.get(LOGGER)).toThrow(SyncFactoryPromiseError)
        expect(singletonCalls).toBe(2)
    })

    test('does not treat explicit Promise values as sync factory misuse', async () => {
        const promiseValue = token<Promise<string>>('container.promise-value')
        const container = createContainer()
        const promised = Promise.resolve('ready')

        container.bind(promiseValue).toValue(promised)

        const runtime = await container.freeze()

        expect(runtime.get(promiseValue)).toBe(promised)
        await expect(runtime.get(promiseValue)).resolves.toBe('ready')
    })

    test('resolves no-argument class providers', async () => {
        class ClassService {
            readonly value = 'created'
        }

        const classService = token<ClassService>('container.class-service')
        const container = createContainer()

        container.bind(classService).toClass(ClassService)

        const runtime = await container.freeze()

        expect(runtime.get(classService)).toBeInstanceOf(ClassService)
        expect(runtime.get(classService)).not.toBe(runtime.get(classService))
    })

    test('can make class providers singleton or explicitly transient', async () => {
        class ClassCounter {
            readonly value = 'created'
        }

        const classCounter = token<ClassCounter>('container.class-counter')
        const singletonContainer = createContainer()
        const transientContainer = createContainer()

        singletonContainer.bind(classCounter).toClass(ClassCounter).singleton()
        transientContainer.bind(classCounter).toClass(ClassCounter).transient()

        const singletonRuntime = await singletonContainer.freeze()
        const transientRuntime = await transientContainer.freeze()

        expect(singletonRuntime.get(classCounter)).toBe(singletonRuntime.get(classCounter))
        expect(transientRuntime.get(classCounter)).not.toBe(transientRuntime.get(classCounter))
    })

    test('resolves dependencies through sync factory context', async () => {
        const container = createContainer()
        const logger = createLogger()

        container.bind(LOGGER).toValue(logger)
        container.bind(SERVICE).toFactory((context) => {
            expectTypeOf(context).toEqualTypeOf<ResolutionContext>()
            expectTypeOf(context.get(LOGGER)).toEqualTypeOf<Logger>()
            expectTypeOf(context.tryGet(LOGGER)).toEqualTypeOf<Logger | undefined>()

            return {
                logger: context.get(LOGGER),
                missing: context.tryGet(MISSING)
            }
        })

        const runtime = await container.freeze()
        const service = runtime.get(SERVICE)

        expect(service.logger).toBe(logger)
        expect(service.missing).toBeUndefined()
    })

    test('resolves multi-provider values and factories in registration order', async () => {
        const container = createContainer()
        const valuePlugin: Plugin = {
            name: 'value'
        }

        container.add(PLUGINS).toValue(valuePlugin)
        container.add(PLUGINS).toFactory(() => ({
            name: 'factory'
        }))

        const runtime = await container.freeze()
        const plugins = runtime.getAll(PLUGINS)

        expect(plugins).toEqual([
            valuePlugin,
            {
                name: 'factory'
            }
        ])
    })

    test('rejects thenable results from sync multi-provider factories', async () => {
        const container = createContainer()
        const thenablePlugin = {
            then(resolve: (value: Plugin) => void): void {
                resolve({
                    name: 'resolved'
                })
            }
        } as unknown as Plugin

        container.add(PLUGINS).toFactory(() => thenablePlugin)

        const runtime = await container.freeze()

        expect(() => runtime.getAll(PLUGINS)).toThrow(SyncFactoryPromiseError)
    })

    test('uses token id as canonical multi-provider identity', async () => {
        const container = createContainer()
        const original = token<Plugin>('container.multi.same-id')
        const alias = token<Plugin>('container.multi.same-id')
        const plugin: Plugin = {
            name: 'same-id'
        }

        container.add(original).toValue(plugin)

        const runtime = await container.freeze()

        expect(runtime.getAll(alias)).toEqual([plugin])
    })

    test('returns empty and fresh arrays from getAll', async () => {
        const container = createContainer()

        container.add(PLUGINS).toValue({
            name: 'registered'
        })

        const runtime = await container.freeze()
        const registered = runtime.getAll(PLUGINS)
        const missing = runtime.getAll(MISSING)

        registered.push({
            name: 'mutated'
        })
        missing.push({
            value: 'mutated'
        })

        expect(runtime.getAll(PLUGINS)).toEqual([
            {
                name: 'registered'
            }
        ])
        expect(runtime.getAll(MISSING)).toEqual([])
        expect(runtime.getAll(PLUGINS)).not.toBe(runtime.getAll(PLUGINS))
        expect(runtime.getAll(MISSING)).not.toBe(runtime.getAll(MISSING))
    })

    test('keeps single-provider and multi-provider resolution strict', async () => {
        const multiContainer = createContainer()
        const singleContainer = createContainer()

        multiContainer.add(PLUGINS).toValue({
            name: 'multi'
        })
        singleContainer.bind(LOGGER).toValue(createLogger())

        const multiRuntime = await multiContainer.freeze()
        const singleRuntime = await singleContainer.freeze()

        expect(() => multiRuntime.get(PLUGINS)).toThrow(ProviderKindMismatchError)
        expect(() => multiRuntime.tryGet(PLUGINS)).toThrow(ProviderKindMismatchError)
        expect(() => multiRuntime.get(PLUGINS)).toThrow('container.plugins')
        expect(() => singleRuntime.getAll(LOGGER)).toThrow(ProviderKindMismatchError)
        expect(() => singleRuntime.getAll(LOGGER)).toThrow('container.logger')
    })

    test('rejects mixing bind and add registrations for the same token id', () => {
        const singleFirst = createContainer()
        const multiFirst = createContainer()
        const staleSingleBuilder = createContainer()
        const staleMultiBuilder = createContainer()
        const singleBinding = staleSingleBuilder.bind(LOGGER)
        const multiBinding = staleMultiBuilder.add(LOGGER)

        singleFirst.bind(LOGGER).toValue(createLogger())
        multiFirst.add(LOGGER).toValue(createLogger())
        staleSingleBuilder.add(LOGGER).toValue(createLogger())
        staleMultiBuilder.bind(LOGGER).toValue(createLogger())

        expect(() => singleFirst.add(LOGGER)).toThrow(ProviderKindMismatchError)
        expect(() => multiFirst.bind(LOGGER)).toThrow(ProviderKindMismatchError)
        expect(() => singleBinding.toValue(createLogger())).toThrow(ProviderKindMismatchError)
        expect(() => multiBinding.toValue(createLogger())).toThrow(ProviderKindMismatchError)
    })

    test('uses transient multi-provider factories by default and supports lifetime modifiers', async () => {
        const defaultTransientContainer = createContainer()
        const singletonContainer = createContainer()
        const explicitTransientContainer = createContainer()

        defaultTransientContainer.add(COUNTER).toFactory(createCounterFactory())
        singletonContainer.add(COUNTER).toFactory(createCounterFactory()).singleton()
        explicitTransientContainer.add(COUNTER).toFactory(createCounterFactory()).transient()

        const defaultTransientRuntime = await defaultTransientContainer.freeze()
        const singletonRuntime = await singletonContainer.freeze()
        const explicitTransientRuntime = await explicitTransientContainer.freeze()
        const singletonFirst = singletonRuntime.getAll(COUNTER)
        const singletonSecond = singletonRuntime.getAll(COUNTER)
        const explicitTransientFirst = explicitTransientRuntime.getAll(COUNTER)
        const explicitTransientSecond = explicitTransientRuntime.getAll(COUNTER)

        expect(defaultTransientRuntime.getAll(COUNTER)).toEqual([
            {
                value: 1
            }
        ])
        expect(defaultTransientRuntime.getAll(COUNTER)).toEqual([
            {
                value: 2
            }
        ])
        expect(singletonFirst[0]).toBe(singletonSecond[0])
        expect(explicitTransientFirst[0]).not.toBe(explicitTransientSecond[0])
    })

    test('resolves multi-provider dependencies through sync factory context', async () => {
        const summary = token<string>('container.plugin-summary')
        const container = createContainer()

        container.add(PLUGINS).toValue({
            name: 'first'
        })
        container.add(PLUGINS).toValue({
            name: 'second'
        })
        container.bind(summary).toFactory((context) => {
            expectTypeOf(context).toEqualTypeOf<ResolutionContext>()
            expectTypeOf(context.getAll(PLUGINS)).toEqualTypeOf<Plugin[]>()

            return context
                .getAll(PLUGINS)
                .map((plugin) => plugin.name)
                .join(',')
        })

        const runtime = await container.freeze()

        expect(runtime.get(summary)).toBe('first,second')
    })

    test('throws a typed error for missing get providers and returns undefined from tryGet', async () => {
        const container = createContainer()
        const runtime = await container.freeze()

        expect(() => runtime.get(MISSING)).toThrow(ProviderNotFoundError)
        expect(() => runtime.get(MISSING)).toThrow('container.missing')
        expect(runtime.tryGet(MISSING)).toBeUndefined()
    })

    test('does not suppress provider failures in tryGet', async () => {
        const container = createContainer()

        container.bind(SERVICE).toFactory(() => {
            throw new Error('provider failed')
        })

        const runtime = await container.freeze()

        expect(() => runtime.tryGet(SERVICE)).toThrow('provider failed')
    })

    test('rejects duplicate single-provider registrations by token id', () => {
        const container = createContainer()
        const original = token<Logger>('container.duplicate')
        const alias = token<Logger>('container.duplicate')

        container.bind(original).toValue(createLogger())

        expect(() => container.bind(alias).toValue(createLogger())).toThrow(DuplicateProviderError)
        expect(() => container.bind(alias).toValue(createLogger())).toThrow('container.duplicate')
    })

    test('detects provider cycles with readable token id paths', async () => {
        const first = token<string>('container.cycle.first')
        const second = token<string>('container.cycle.second')
        const container = createContainer()

        container.bind(first).toFactory(({ get }) => get(second))
        container.bind(second).toFactory(({ get }) => get(first))

        const runtime = await container.freeze()
        let error: unknown

        try {
            runtime.get(first)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(ProviderCycleError)

        if (error instanceof ProviderCycleError) {
            expect(error.tokenIds).toEqual([
                'container.cycle.first',
                'container.cycle.second',
                'container.cycle.first'
            ])
            expect(error.message).toContain(
                'container.cycle.first -> container.cycle.second -> container.cycle.first'
            )
        }
    })

    test('detects provider cycles through get and getAll with readable token id paths', async () => {
        const first = token<string>('container.multi-cycle.first')
        const second = token<string>('container.multi-cycle.second')
        const container = createContainer()

        container.add(first).toFactory(({ get }) => get(second))
        container.bind(second).toFactory(({ getAll }) => getAll(first)[0] ?? 'missing')

        const runtime = await container.freeze()
        let error: unknown

        try {
            runtime.getAll(first)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(ProviderCycleError)

        if (error instanceof ProviderCycleError) {
            expect(error.tokenIds).toEqual([
                'container.multi-cycle.first',
                'container.multi-cycle.second',
                'container.multi-cycle.first'
            ])
            expect(error.message).toContain(
                'container.multi-cycle.first -> container.multi-cycle.second -> ' +
                    'container.multi-cycle.first'
            )
        }
    })

    test('detects a re-entrant collection before nested siblings execute', async () => {
        const collection = token<string>('container.collection-frame-cycle')
        const container = createContainer()
        let nestedSiblingCalls = 0

        container.add(collection).toValue('first')
        container.add(collection).toFactory(({ getAll }) => getAll(collection).join(','))
        container.add(collection).toFactory(() => {
            nestedSiblingCalls += 1

            return 'later'
        })

        const runtime = await container.freeze()
        let error: unknown

        try {
            runtime.getAll(collection)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(ProviderCycleError)
        expect(nestedSiblingCalls).toBe(0)

        if (error instanceof ProviderCycleError) {
            expectTypeOf(error.frames).toEqualTypeOf<readonly ProviderCycleFrame[] | undefined>()
            expect(error.frames).toEqual([
                {
                    kind: 'collection',
                    visibility: 'public',
                    tokenId: collection.id
                },
                {
                    kind: 'provider',
                    visibility: 'public',
                    tokenId: collection.id,
                    registrationIndex: 1,
                    registrationKind: 'multi'
                },
                {
                    kind: 'collection',
                    visibility: 'public',
                    tokenId: collection.id
                }
            ])
            expect(error.tokenIds).toEqual([collection.id, collection.id])
        }
    })

    test('resolves ordinary sibling contributions without a false provider cycle', async () => {
        const collection = token<string>('container.collection-frame-siblings')
        const container = createContainer()

        container.add(collection).toFactory(() => 'first')
        container.add(collection).toFactory(() => 'second')

        const runtime = await container.freeze()

        expect(runtime.getAll(collection)).toEqual(['first', 'second'])
        expect(runtime.getAll(collection)).toEqual(['first', 'second'])
    })

    test('freezes configuration and exposes immutable runtime APIs', async () => {
        const container = createContainer()
        const binding = container.bind(LOGGER)
        const lifetime = container.bind(COUNTER).toFactory(createCounterFactory())
        const multiBinding = container.add(SERVICE)
        const multiLifetime = container.add(PLUGINS).toFactory(() => ({
            name: 'late'
        }))

        const runtimePromise = container.freeze()

        expect(runtimePromise).toBeInstanceOf(Promise)

        const runtime = await runtimePromise

        expect(Object.isFrozen(runtime)).toBe(true)
        expect('bind' in runtime).toBe(false)
        expect('add' in runtime).toBe(false)
        expect('freeze' in runtime).toBe(false)
        expect(() => container.bind(SERVICE)).toThrow(ContainerFrozenError)
        expect(() => container.add(MISSING)).toThrow(ContainerFrozenError)
        expect(() => binding.toValue(createLogger())).toThrow(ContainerFrozenError)
        expect(() => lifetime.singleton()).toThrow(ContainerFrozenError)
        expect(() => lifetime.scoped()).toThrow(ContainerFrozenError)
        expect(() =>
            multiBinding.toValue({
                logger: createLogger(),
                missing: undefined
            })
        ).toThrow(ContainerFrozenError)
        expect(() => multiLifetime.singleton()).toThrow(ContainerFrozenError)
        expect(() => multiLifetime.scoped()).toThrow(ContainerFrozenError)
    })

    test('preserves runtime get and tryGet inference', async () => {
        const container = createContainer()

        container.bind(LOGGER).toValue(createLogger())

        const runtime = await container.freeze()

        expectTypeOf(runtime).toEqualTypeOf<ContainerRuntime>()
        expectTypeOf(runtime.get(LOGGER)).toEqualTypeOf<Logger>()
        expectTypeOf(runtime.tryGet(LOGGER)).toEqualTypeOf<Logger | undefined>()
    })

    test('preserves multi-provider add and getAll inference', async () => {
        const container = createContainer()

        expectTypeOf(container.add(PLUGINS)).toEqualTypeOf<ContainerMultiBindingBuilder<Plugin>>()

        container.add(PLUGINS).toValue({
            name: 'typed'
        })

        const runtime = await container.freeze()

        expectTypeOf(runtime.getAll(PLUGINS)).toEqualTypeOf<Plugin[]>()
    })

    test('exposes core async multi factory, resource and collection APIs', async () => {
        const container = createContainer()
        const binding = container.bind(LOGGER)
        const multiBinding = container.add(LOGGER)
        const runtime = await container.freeze()

        expect('add' in container).toBe(true)
        expect('toAsyncFactory' in binding).toBe(true)
        expect('toAsyncResource' in binding).toBe(true)
        expect('toClass' in multiBinding).toBe(false)
        expect('toAsyncFactory' in multiBinding).toBe(true)
        expect('toAsyncResource' in multiBinding).toBe(true)
        expect('getAll' in runtime).toBe(true)
        expect('getAsync' in runtime).toBe(true)
        expect('tryGetAsync' in runtime).toBe(true)
        expect('createScope' in runtime).toBe(true)
        expect('withScope' in runtime).toBe(true)
        expect('dispose' in runtime).toBe(true)
        expect('getAllAsync' in runtime).toBe(true)
    })
})

function createLogger(): Logger {
    return {
        log(): void {}
    }
}

function createCounterFactory(): () => Counter {
    let nextValue = 0

    return () => ({
        value: (nextValue += 1)
    })
}
