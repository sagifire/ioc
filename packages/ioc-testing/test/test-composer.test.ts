import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    defineModule,
    token,
    type Composer,
    type ComposerBindingBuilder,
    type ComposerInspection,
    type ModuleGraph
} from '@sagifire/ioc'
import {
    DuplicateTestOverrideError,
    createTestComposer,
    override,
    type CreateTestComposerOptions,
    type TestComposerConfigurator,
    type TestOverride
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

class ClassAuthReader implements AuthReader {
    currentUserId(): string {
        return 'class-user'
    }
}

const AUTH_READER = token<AuthReader>('testing.composer.auth-reader')
const VALUE_AUTH_READER = token<AuthReader>('testing.composer.value-auth-reader')
const FACTORY_AUTH_READER = token<AuthReader>('testing.composer.factory-auth-reader')
const CLASS_AUTH_READER = token<AuthReader>('testing.composer.class-auth-reader')
const ASYNC_AUTH_READER = token<AuthReader>('testing.composer.async-auth-reader')
const CLOCK = token<Clock>('testing.composer.clock')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>(
    'testing.composer.contact-requests-public-api'
)
const AUDITED_CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>(
    'testing.composer.audited-contact-requests-public-api'
)

const contactRequestsModule = defineModule({
    id: 'testing-composer-contact-requests',
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
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((resolutionContext) => {
            const authReader = resolutionContext.get(AUTH_READER)

            return {
                submit(): string {
                    return authReader.currentUserId()
                }
            }
        })
    }
})

const auditedContactRequestsModule = defineModule({
    id: 'testing-composer-audited-contact-requests',
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

describe('test composer overrides', () => {
    test('applies required-port overrides before compose and keeps graph inspection visible', async () => {
        const composer = createTestComposer({
            modules: [contactRequestsModule],
            overrides: [
                override(AUTH_READER).toValue({
                    currentUserId(): string {
                        return 'override-user'
                    }
                })
            ]
        })

        expectTypeOf(composer).toEqualTypeOf<Composer>()
        expectTypeOf(composer.inspect()).toEqualTypeOf<ComposerInspection>()
        expectTypeOf(composer.getGraph()).toEqualTypeOf<ModuleGraph>()
        expect(composer.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(composer.inspect().edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'testing-composer-contact-requests',
                requiredTokenId: AUTH_READER.id,
                dependencyKind: 'external',
                bindingTokenId: AUTH_READER.id,
                bindingKind: 'value'
            }
        ])

        const runtime = await composer.compose()

        expect(runtime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('override-user')
        expect(runtime.inspect().bindings).toEqual([
            {
                tokenId: AUTH_READER.id,
                kind: 'value',
                providerKind: 'value',
                lifetime: 'singleton'
            }
        ])

        await runtime.dispose()
    })

    test('supports existing composer bindings and test overrides in one fresh composer', async () => {
        const authOverride = override(AUTH_READER).toFactory((context) => {
            expectTypeOf(context.get(CLOCK)).toEqualTypeOf<Clock>()

            return {
                currentUserId(): string {
                    return 'factory-user'
                }
            }
        })
        const composer = createTestComposer({
            modules: [auditedContactRequestsModule],
            configure(configuredComposer): void {
                expectTypeOf(configuredComposer.bind(CLOCK)).toEqualTypeOf<
                    ComposerBindingBuilder<Clock>
                >()

                configuredComposer.bind(CLOCK).toValue({
                    now(): string {
                        return '2026-07-01'
                    }
                })
            },
            overrides: [authOverride]
        })

        expectTypeOf(authOverride).toMatchTypeOf<TestOverride<AuthReader>>()
        expect(composer.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(composer.getGraph().edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'testing-composer-audited-contact-requests',
                requiredTokenId: AUTH_READER.id,
                dependencyKind: 'external',
                bindingTokenId: AUTH_READER.id,
                bindingKind: 'factory'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'testing-composer-audited-contact-requests',
                requiredTokenId: CLOCK.id,
                dependencyKind: 'external',
                bindingTokenId: CLOCK.id,
                bindingKind: 'value'
            }
        ])

        const runtime = await composer.compose()

        expect(runtime.get(AUDITED_CONTACT_REQUESTS_PUBLIC_API).submit()).toBe(
            'factory-user@2026-07-01'
        )

        await runtime.dispose()
    })

    test('creates fresh composer configuration per helper call', async () => {
        let configureCalls = 0
        const configure: TestComposerConfigurator = (composer) => {
            configureCalls += 1
            const callNumber = configureCalls

            composer.bind(AUTH_READER).toValue({
                currentUserId(): string {
                    return `configured-${callNumber}`
                }
            })
        }
        const options: CreateTestComposerOptions = {
            modules: [contactRequestsModule],
            configure
        }
        const firstComposer = createTestComposer(options)
        const secondComposer = createTestComposer(options)
        const firstRuntime = await firstComposer.compose()
        const secondRuntime = await secondComposer.compose()

        expectTypeOf(firstComposer).toEqualTypeOf<Composer>()
        expect(firstComposer).not.toBe(secondComposer)
        expect(firstRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('configured-1')
        expect(secondRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('configured-2')
        expect(configureCalls).toBe(2)

        await firstRuntime.dispose()
        await secondRuntime.dispose()
    })

    test('records value, factory, class and async factory overrides without executing factories', () => {
        const moduleDefinition = defineModule({
            id: 'testing-composer-override-kinds',
            requires: [
                {
                    token: VALUE_AUTH_READER
                },
                {
                    token: FACTORY_AUTH_READER
                },
                {
                    token: CLASS_AUTH_READER
                },
                {
                    token: ASYNC_AUTH_READER
                }
            ],
            setup(): void {}
        })
        let factoryCalls = 0
        let asyncFactoryCalls = 0
        const composer = createTestComposer({
            modules: [moduleDefinition],
            overrides: [
                override(VALUE_AUTH_READER).toValue({
                    currentUserId(): string {
                        return 'value-user'
                    }
                }),
                override(FACTORY_AUTH_READER).toFactory(() => {
                    factoryCalls += 1

                    return {
                        currentUserId(): string {
                            return 'factory-user'
                        }
                    }
                }),
                override(CLASS_AUTH_READER).toClass(ClassAuthReader),
                override(ASYNC_AUTH_READER).toAsyncFactory(async () => {
                    asyncFactoryCalls += 1

                    return {
                        currentUserId(): string {
                            return 'async-user'
                        }
                    }
                })
            ]
        })

        expect(composer.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(composer.getGraph().bindings).toEqual([
            {
                tokenId: VALUE_AUTH_READER.id,
                kind: 'value',
                providerKind: 'value',
                lifetime: 'singleton'
            },
            {
                tokenId: FACTORY_AUTH_READER.id,
                kind: 'factory',
                providerKind: 'factory',
                lifetime: 'transient'
            },
            {
                tokenId: CLASS_AUTH_READER.id,
                kind: 'class',
                providerKind: 'class',
                lifetime: 'transient'
            },
            {
                tokenId: ASYNC_AUTH_READER.id,
                kind: 'async-factory',
                providerKind: 'async-factory',
                lifetime: 'transient',
                initialization: 'lazy'
            }
        ])
        expect(factoryCalls).toBe(0)
        expect(asyncFactoryCalls).toBe(0)
    })

    test('rejects duplicate composer overrides before configuration runs', () => {
        let configureCalls = 0

        expect(() =>
            createTestComposer({
                modules: [contactRequestsModule],
                configure(): void {
                    configureCalls += 1
                },
                overrides: [
                    override(AUTH_READER).toValue({
                        currentUserId(): string {
                            return 'first'
                        }
                    }),
                    override(AUTH_READER).toClass(ClassAuthReader)
                ]
            })
        ).toThrow(DuplicateTestOverrideError)
        let error: unknown

        try {
            createTestComposer({
                overrides: [
                    override(CLOCK).toValue({
                        now(): string {
                            return 'first'
                        }
                    }),
                    override(CLOCK).toValue({
                        now(): string {
                            return 'second'
                        }
                    })
                ]
            })
        } catch (caughtError) {
            error = caughtError
        }

        expect(error).toMatchObject({
            name: 'DuplicateTestOverrideError',
            code: 'SAGIFIRE_IOC_TESTING_DUPLICATE_OVERRIDE',
            tokenId: CLOCK.id,
            details: {
                tokenId: CLOCK.id
            }
        })
        expect(configureCalls).toBe(0)
    })

    test('does not mutate an existing composed runtime when overrides are used', async () => {
        const productionRuntime = await createTestComposer({
            modules: [contactRequestsModule],
            overrides: [
                override(AUTH_READER).toValue({
                    currentUserId(): string {
                        return 'production-user'
                    }
                })
            ]
        }).compose()
        const testRuntime = await createTestComposer({
            modules: [contactRequestsModule],
            overrides: [
                override(AUTH_READER).toValue({
                    currentUserId(): string {
                        return 'test-user'
                    }
                })
            ]
        }).compose()

        expect(productionRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('production-user')
        expect(testRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('test-user')
        expect(productionRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('production-user')

        await testRuntime.dispose()
        await productionRuntime.dispose()
    })
})
