import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    InvalidScopeError,
    PrivateProviderAccessError,
    defineModule,
    token,
    type ComposedRuntime,
    type Composer,
    type ModuleDefinition,
    type ModuleGraph,
    type Token
} from '@sagifire/ioc'
import {
    createModuleHarness,
    createTestComposer,
    fakeModule,
    override,
    type FakeModuleDefinition,
    type FakeModuleProvider,
    type ModuleHarness
} from '../src/index.js'

interface AuthReader {
    currentUserId(): string
}

interface Clock {
    now(): string
}

interface ContactRequestsApi {
    submit(): string
}

interface Secret {
    readonly value: string
}

interface Counter {
    read(): number
}

const AUTH_READER = token<AuthReader>('testing.harness.auth-reader')
const FACTORY_AUTH_READER = token<AuthReader>('testing.harness.factory-auth-reader')
const ASYNC_AUTH_READER = token<AuthReader>('testing.harness.async-auth-reader')
const CLOCK = token<Clock>('testing.harness.clock')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>(
    'testing.harness.contact-requests-public-api'
)
const AUDITED_CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>(
    'testing.harness.audited-contact-requests-public-api'
)
const ASYNC_CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>(
    'testing.harness.async-contact-requests-public-api'
)
const SCOPED_COUNTER = token<Counter>('testing.harness.scoped-counter')
const CONTACT_REQUESTS_SECRET = token<Secret>('testing.harness.contact-requests-secret')

const contactRequestsModule = defineModule({
    id: 'testing-harness-contact-requests',
    requires: [
        {
            token: AUTH_READER
        }
    ],
    provides: [
        {
            token: CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api'
        }
    ],
    setup(context): void {
        context.bind(CONTACT_REQUESTS_SECRET).toValue({
            value: 'module-secret'
        })
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((resolutionContext) => {
            const authReader = resolutionContext.get(AUTH_READER)
            const secret = resolutionContext.get(CONTACT_REQUESTS_SECRET)

            return {
                submit(): string {
                    return `${authReader.currentUserId()}:${secret.value}`
                }
            }
        })
    }
})

const auditedContactRequestsModule = defineModule({
    id: 'testing-harness-audited-contact-requests',
    requires: [
        {
            token: AUTH_READER
        },
        {
            token: CLOCK
        }
    ],
    provides: [
        {
            token: AUDITED_CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api'
        }
    ],
    setup(context): void {
        context.bind(AUDITED_CONTACT_REQUESTS_PUBLIC_API).toFactory((resolutionContext) => {
            const authReader = resolutionContext.get(AUTH_READER)
            const clock = resolutionContext.get(CLOCK)

            return {
                submit(): string {
                    return `${authReader.currentUserId()}@${clock.now()}`
                }
            }
        })
    }
})

const asyncScopedContactRequestsModule = defineModule({
    id: 'testing-harness-async-scoped-contact-requests',
    requires: [
        {
            token: ASYNC_AUTH_READER
        }
    ],
    provides: [
        {
            token: ASYNC_CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api'
        },
        {
            token: SCOPED_COUNTER,
            kind: 'shared-service'
        }
    ],
    setup(context): void {
        let factoryCalls = 0

        context
            .bind(ASYNC_CONTACT_REQUESTS_PUBLIC_API)
            .toAsyncFactory(async (resolutionContext) => {
                const authReader = await resolutionContext.getAsync(ASYNC_AUTH_READER)

                return {
                    submit(): string {
                        return authReader.currentUserId()
                    }
                }
            })
            .singleton()
        context
            .bind(SCOPED_COUNTER)
            .toFactory(() => {
                factoryCalls += 1
                const value = factoryCalls

                return {
                    read(): number {
                        return value
                    }
                }
            })
            .scoped()
    }
})

describe('fake modules and module harnesses', () => {
    test('creates explicit fake module definitions with value, factory and async providers', async () => {
        let factoryCalls = 0
        let asyncFactoryCalls = 0
        const valueProvider = {
            token: AUTH_READER,
            kind: 'public-api',
            description: 'Fake auth reader',
            useValue: {
                currentUserId(): string {
                    return 'fake-user'
                }
            }
        } satisfies FakeModuleProvider<AuthReader>
        const factoryProvider = {
            token: FACTORY_AUTH_READER,
            kind: 'shared-service',
            useFactory(resolutionContext) {
                expectTypeOf(resolutionContext.get(AUTH_READER)).toEqualTypeOf<AuthReader>()

                factoryCalls += 1

                return {
                    currentUserId(): string {
                        return `factory-${resolutionContext.get(AUTH_READER).currentUserId()}`
                    }
                }
            }
        } satisfies FakeModuleProvider<AuthReader>
        const asyncProvider = {
            token: ASYNC_AUTH_READER,
            kind: 'shared-service',
            useAsyncFactory: async () => {
                asyncFactoryCalls += 1

                return {
                    currentUserId(): string {
                        return 'async-fake-user'
                    }
                }
            }
        } satisfies FakeModuleProvider<AuthReader>
        const fakeAuthModule = fakeModule({
            id: 'testing-harness-fake-auth',
            metadata: {
                purpose: 'test fake'
            },
            provides: [valueProvider, factoryProvider, asyncProvider]
        })

        expectTypeOf(valueProvider.token).toEqualTypeOf<Token<AuthReader>>()
        expectTypeOf(fakeAuthModule).toMatchTypeOf<ModuleDefinition>()
        expectTypeOf(fakeAuthModule).toMatchTypeOf<FakeModuleDefinition>()
        expect(Object.isFrozen(fakeAuthModule)).toBe(true)
        expect(fakeAuthModule.provides).toEqual([
            {
                token: AUTH_READER,
                kind: 'public-api',
                cardinality: 'single',
                description: 'Fake auth reader'
            },
            {
                token: FACTORY_AUTH_READER,
                kind: 'shared-service',
                cardinality: 'single'
            },
            {
                token: ASYNC_AUTH_READER,
                kind: 'shared-service',
                cardinality: 'single'
            }
        ])

        const runtime = await createTestComposer({
            modules: [fakeAuthModule]
        }).compose()

        expect(runtime.get(AUTH_READER).currentUserId()).toBe('fake-user')
        expect(runtime.get(FACTORY_AUTH_READER).currentUserId()).toBe('factory-fake-user')
        expect((await runtime.getAsync(ASYNC_AUTH_READER)).currentUserId()).toBe('async-fake-user')
        expect(factoryCalls).toBe(1)
        expect(asyncFactoryCalls).toBe(1)
        expect(runtime.inspect().modules).toEqual([
            {
                id: 'testing-harness-fake-auth',
                metadata: {
                    valueType: 'object'
                },
                requiredPortIds: [],
                capabilityIds: [AUTH_READER.id, FACTORY_AUTH_READER.id, ASYNC_AUTH_READER.id]
            }
        ])

        await runtime.dispose()
    })

    test('composes one module under test with fake required ports through overrides', async () => {
        const harness = createModuleHarness({
            module: contactRequestsModule,
            overrides: [
                override(AUTH_READER).toValue({
                    currentUserId(): string {
                        return 'override-user'
                    }
                })
            ]
        })

        expectTypeOf(harness).toMatchTypeOf<ModuleHarness<typeof contactRequestsModule>>()
        expectTypeOf(harness.module).toEqualTypeOf<typeof contactRequestsModule>()
        expectTypeOf(harness.composer).toEqualTypeOf<Composer>()
        expectTypeOf(harness.getGraph()).toEqualTypeOf<ModuleGraph>()
        expectTypeOf(harness.compose()).toEqualTypeOf<Promise<ComposedRuntime>>()
        expect(Object.isFrozen(harness)).toBe(true)
        expect(harness.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(harness.getGraph().edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'testing-harness-contact-requests',
                requiredTokenId: AUTH_READER.id,
                dependencyKind: 'external',
                bindingTokenId: AUTH_READER.id,
                bindingKind: 'value'
            }
        ])

        const runtime = await harness.compose()

        expect(runtime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe(
            'override-user:module-secret'
        )
        expect(() => runtime.get(AUTH_READER)).toThrow(PrivateProviderAccessError)
        expect(() => runtime.get(CONTACT_REQUESTS_SECRET)).toThrow(PrivateProviderAccessError)

        await runtime.dispose()
    })

    test('composes one module under test with support modules and fake modules', async () => {
        const fakeAuthModule = fakeModule('testing-harness-fake-auth-support', {
            provides: [
                {
                    token: AUTH_READER,
                    useValue: {
                        currentUserId(): string {
                            return 'module-fake-user'
                        }
                    }
                }
            ]
        })
        const clockSupportModule = defineModule({
            id: 'testing-harness-clock-support',
            provides: [
                {
                    token: CLOCK,
                    kind: 'shared-service'
                }
            ],
            setup(context): void {
                context.bind(CLOCK).toValue({
                    now(): string {
                        return '2026-07-01'
                    }
                })
            }
        })
        const harness = createModuleHarness({
            module: auditedContactRequestsModule,
            supportModules: [clockSupportModule],
            fakeModules: [fakeAuthModule]
        })

        expect(harness.modules.map((moduleDefinition) => moduleDefinition.id)).toEqual([
            'testing-harness-audited-contact-requests',
            'testing-harness-clock-support',
            'testing-harness-fake-auth-support'
        ])
        expect(harness.getGraph().edges).toEqual([
            {
                edgeKind: 'capability',
                consumerModuleId: 'testing-harness-audited-contact-requests',
                requiredTokenId: AUTH_READER.id,
                dependencyKind: 'external',
                providerModuleId: 'testing-harness-fake-auth-support',
                capabilityTokenId: AUTH_READER.id,
                capabilityKind: 'public-api'
            },
            {
                edgeKind: 'capability',
                consumerModuleId: 'testing-harness-audited-contact-requests',
                requiredTokenId: CLOCK.id,
                dependencyKind: 'external',
                providerModuleId: 'testing-harness-clock-support',
                capabilityTokenId: CLOCK.id,
                capabilityKind: 'shared-service'
            }
        ])

        const runtime = await harness.compose()

        expect(runtime.inspect().modules.map((moduleDefinition) => moduleDefinition.id)).toEqual([
            'testing-harness-audited-contact-requests',
            'testing-harness-clock-support',
            'testing-harness-fake-auth-support'
        ])
        expect(runtime.get(AUDITED_CONTACT_REQUESTS_PUBLIC_API).submit()).toBe(
            'module-fake-user@2026-07-01'
        )

        await runtime.dispose()
    })

    test('preserves async fake providers and scoped public runtime behavior', async () => {
        const fakeAsyncAuthModule = fakeModule({
            id: 'testing-harness-fake-async-auth',
            provides: [
                {
                    token: ASYNC_AUTH_READER,
                    kind: 'shared-service',
                    useAsyncFactory: async () => {
                        return {
                            currentUserId(): string {
                                return 'async-module-fake-user'
                            }
                        }
                    }
                }
            ]
        })
        const harness = createModuleHarness({
            module: asyncScopedContactRequestsModule,
            fakeModules: [fakeAsyncAuthModule]
        })
        const runtime = await harness.compose()

        expect((await runtime.getAsync(ASYNC_CONTACT_REQUESTS_PUBLIC_API)).submit()).toBe(
            'async-module-fake-user'
        )
        expect(() => runtime.get(SCOPED_COUNTER)).toThrow(InvalidScopeError)

        const firstScope = runtime.createScope()
        const secondScope = runtime.createScope()
        const firstCounter = firstScope.get(SCOPED_COUNTER)

        expect(firstScope.get(SCOPED_COUNTER)).toBe(firstCounter)
        expect(firstCounter.read()).toBe(1)
        expect(secondScope.get(SCOPED_COUNTER).read()).toBe(2)

        await firstScope.dispose()
        await secondScope.dispose()
        await runtime.dispose()
    })
})
