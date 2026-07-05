import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    type ComposedRuntime,
    createComposer,
    defineModule,
    DuplicateModuleDependencyError,
    InvalidModuleDefinitionError,
    type ComposerBindingContext,
    type ComposerBindingFactory,
    type ComposerInspection,
    type ModuleCardinality,
    type ModuleGraph,
    type ModuleDefinition,
    type ModuleDependencyDefinition,
    type ModuleSetupContext
} from '../src/composer.js'
import {
    adapt,
    bind,
    defineApp,
    module as moduleDsl,
    type AppDslAsyncFactoryBindingDefinition,
    type AppDslDefinition,
    type AppDslFactoryBindingDefinition,
    type AppDslValueBindingDefinition,
    type BindDslBuilder,
    type ModuleDslDefinition,
    type ModuleDslDefinitionInput
} from '../src/dsl.js'
import type { DiagnosticReport } from '../src/diagnostics.js'
import { type Token, token } from '../src/tokens.js'

interface AuthReader {
    currentUserId(): string
}

interface AuthPublicApi {
    requireUser(): string
}

interface ContactRequestsPublicApi {
    submit(): string
}

type TokenValue<TToken> = TToken extends Token<infer TValue> ? TValue : never

const AUTH_READER = token<AuthReader>('dsl.auth-reader')
const OPTIONAL_AUTH_READER = token<AuthReader>('dsl.optional-auth-reader')
const AUTH_PUBLIC_API = token<AuthPublicApi>('dsl.auth-public-api')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsPublicApi>(
    'dsl.contact-requests-public-api'
)
const VALUE_AUTH_READER = token<AuthReader>('dsl.value-auth-reader')
const FACTORY_AUTH_READER = token<AuthReader>('dsl.factory-auth-reader')
const CLASS_AUTH_READER = token<AuthReader>('dsl.class-auth-reader')
const ASYNC_AUTH_READER = token<AuthReader>('dsl.async-auth-reader')

class ClassAuthReader implements AuthReader {
    currentUserId(): string {
        return 'class-user'
    }
}

describe('module DSL foundation', () => {
    test('creates module definitions through the object form', () => {
        const setup = (): void => {}
        const moduleDefinition = moduleDsl({
            id: 'dsl-contact-requests',
            version: '1.0.0',
            metadata: {
                owner: 'product'
            },
            requires: [
                {
                    token: AUTH_READER,
                    description: 'Authentication reader'
                },
                {
                    token: OPTIONAL_AUTH_READER,
                    required: false,
                    kind: 'shared'
                }
            ],
            provides: [
                {
                    token: CONTACT_REQUESTS_PUBLIC_API,
                    kind: 'public-api',
                    description: 'Contact requests public API'
                }
            ],
            setup
        })

        expect(moduleDefinition.id).toBe('dsl-contact-requests')
        expect(moduleDefinition.version).toBe('1.0.0')
        expect(moduleDefinition.metadata).toEqual({
            owner: 'product'
        })
        expect(moduleDefinition.requires).toEqual([
            {
                token: AUTH_READER,
                required: true,
                kind: 'external',
                cardinality: 'single',
                description: 'Authentication reader'
            },
            {
                token: OPTIONAL_AUTH_READER,
                required: false,
                kind: 'shared',
                cardinality: 'single'
            }
        ])
        expect(moduleDefinition.provides).toEqual([
            {
                token: CONTACT_REQUESTS_PUBLIC_API,
                kind: 'public-api',
                cardinality: 'single',
                description: 'Contact requests public API'
            }
        ])
        expect(moduleDefinition.setup).toBe(setup)
        expect(Object.isFrozen(moduleDefinition)).toBe(true)
        expect(Object.isFrozen(moduleDefinition.requires)).toBe(true)
        expect(Object.isFrozen(moduleDefinition.provides)).toBe(true)
    })

    test('supports id shorthand and remains compatible with composer use', async () => {
        const authModule = moduleDsl('dsl-auth', {
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'user-1'
                    }
                })
            }
        })
        const contactRequestsModule = moduleDsl('dsl-contact-requests-composer', {
            requires: [
                {
                    token: AUTH_PUBLIC_API
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
                    const auth = resolutionContext.get(AUTH_PUBLIC_API)

                    return {
                        submit(): string {
                            return auth.requireUser()
                        }
                    }
                })
            }
        })
        const composer = createComposer().use(authModule).use(contactRequestsModule)
        const validation = composer.validate()
        const graph = composer.getGraph()
        const runtime = await composer.compose()

        expect(validation.ok).toBe(true)
        expect(graph.requiredPorts).toEqual([
            {
                moduleId: 'dsl-contact-requests-composer',
                tokenId: 'dsl.auth-public-api',
                required: true,
                kind: 'external',
                cardinality: 'single',
                providerCount: 1,
                satisfiedBy: 'capability'
            }
        ])
        expect(graph.capabilities).toEqual([
            {
                moduleId: 'dsl-auth',
                tokenId: 'dsl.auth-public-api',
                kind: 'public-api',
                cardinality: 'single',
                providers: [
                    {
                        source: 'module',
                        moduleId: 'dsl-auth',
                        registrationKind: 'bind',
                        registrationIndex: 0
                    }
                ]
            },
            {
                moduleId: 'dsl-contact-requests-composer',
                tokenId: 'dsl.contact-requests-public-api',
                kind: 'public-api',
                cardinality: 'single',
                providers: [
                    {
                        source: 'module',
                        moduleId: 'dsl-contact-requests-composer',
                        registrationKind: 'bind',
                        registrationIndex: 0
                    }
                ]
            }
        ])
        expect(runtime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('user-1')
        expect(runtime.inspect().edges).toEqual([
            {
                edgeKind: 'capability',
                consumerModuleId: 'dsl-contact-requests-composer',
                requiredTokenId: 'dsl.auth-public-api',
                dependencyKind: 'external',
                providerModuleId: 'dsl-auth',
                capabilityTokenId: 'dsl.auth-public-api',
                capabilityKind: 'public-api'
            }
        ])

        await runtime.dispose()
    })

    test('reuses module definition validation diagnostics', () => {
        const authReaderAlias = token<AuthReader>('dsl.auth-reader')

        expect(() =>
            moduleDsl({
                id: 'dsl-duplicate-requires',
                requires: [
                    {
                        token: AUTH_READER
                    },
                    {
                        token: authReaderAlias
                    }
                ],
                setup(): void {}
            })
        ).toThrow(DuplicateModuleDependencyError)
        expect(() =>
            moduleDsl({
                id: 'dsl-invalid-setup'
            } as unknown as ModuleDslDefinitionInput)
        ).toThrow(InvalidModuleDefinitionError)
    })

    test('preserves token inference for required ports and capabilities', () => {
        const objectFormModule = moduleDsl({
            id: 'dsl-typed-object',
            metadata: {
                feature: 'dsl'
            },
            requires: [
                {
                    token: AUTH_READER
                },
                {
                    token: OPTIONAL_AUTH_READER,
                    required: false
                }
            ],
            provides: [
                {
                    token: CONTACT_REQUESTS_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context) {
                expectTypeOf(context).toEqualTypeOf<ModuleSetupContext>()
            }
        })
        const shorthandModule = moduleDsl('dsl-typed-shorthand', {
            requires: [
                {
                    token: AUTH_READER
                }
            ],
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context) {
                expectTypeOf(context).toEqualTypeOf<ModuleSetupContext>()
            }
        })

        expect(shorthandModule.id).toBe('dsl-typed-shorthand')
        expectTypeOf(objectFormModule).toMatchTypeOf<ModuleDefinition>()
        expectTypeOf(objectFormModule).toMatchTypeOf<ModuleDslDefinition>()
        expectTypeOf(objectFormModule.requires[0]).toMatchTypeOf<
            ModuleDependencyDefinition<AuthReader>
        >()
        expectTypeOf(objectFormModule.requires[0].cardinality).toEqualTypeOf<ModuleCardinality>()
        expectTypeOf(objectFormModule.provides[0].cardinality).toEqualTypeOf<ModuleCardinality>()
        expectTypeOf<
            TokenValue<(typeof objectFormModule.requires)[0]['token']>
        >().toEqualTypeOf<AuthReader>()
        expectTypeOf<
            TokenValue<(typeof objectFormModule.requires)[1]['token']>
        >().toEqualTypeOf<AuthReader>()
        expectTypeOf<
            TokenValue<(typeof objectFormModule.provides)[0]['token']>
        >().toEqualTypeOf<ContactRequestsPublicApi>()
        expectTypeOf<
            TokenValue<(typeof shorthandModule.requires)[0]['token']>
        >().toEqualTypeOf<AuthReader>()
        expectTypeOf<
            TokenValue<(typeof shorthandModule.provides)[0]['token']>
        >().toEqualTypeOf<AuthPublicApi>()
    })
})

describe('defineApp DSL', () => {
    test('converts modules and binding declarations to equivalent composer configuration', async () => {
        const authModule = defineModule({
            id: 'dsl-app-auth-object',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'app-user'
                    }
                })
            }
        })
        const contactRequestsModule = moduleDsl('dsl-app-contact-module', {
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
        const authReaderFactory = (context: ComposerBindingContext): AuthReader => {
            const auth = context.get(AUTH_PUBLIC_API)

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        }
        const objectComposer = createComposer().use(authModule).use(contactRequestsModule)

        objectComposer.bind(AUTH_READER).toFactory(authReaderFactory)

        const app = defineApp({
            modules: [authModule, contactRequestsModule],
            bindings: [
                {
                    token: AUTH_READER,
                    useFactory: authReaderFactory
                }
            ]
        })
        const appRuntime = await app.compose()
        const objectRuntime = await objectComposer.compose()

        expect(app.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(app.getGraph()).toEqual(objectComposer.getGraph())
        expect(app.inspect().graph).toEqual(objectComposer.inspect().graph)
        expect(appRuntime.inspect().graph).toEqual(objectRuntime.inspect().graph)
        expect(appRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('app-user')
        expect(Object.isFrozen(app)).toBe(true)
        expect(Object.isFrozen(app.modules)).toBe(true)
        expect(Object.isFrozen(app.bindings)).toBe(true)

        await appRuntime.dispose()
        await objectRuntime.dispose()
    })

    test('exposes existing composer validation and inspection semantics', () => {
        const moduleDefinition = moduleDsl('dsl-app-missing-port', {
            requires: [
                {
                    token: AUTH_READER
                }
            ],
            setup(): void {}
        })
        const app = defineApp({
            modules: [moduleDefinition]
        })
        const composer = app.createComposer()

        expect(composer.validate()).toEqual(app.validate())
        expect(composer.inspect().validation).toEqual(app.inspect().validation)
        expect(app.validate().diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
                severity: 'error',
                message:
                    'Missing required port "dsl.auth-reader" for module "dsl-app-missing-port"',
                details: {
                    moduleId: 'dsl-app-missing-port',
                    tokenId: 'dsl.auth-reader',
                    dependencyKind: 'external'
                }
            }
        ])
    })

    test('reuses composer duplicate binding validation for app bindings', async () => {
        const moduleDefinition = moduleDsl('dsl-app-duplicate-binding', {
            requires: [
                {
                    token: AUTH_READER
                }
            ],
            setup(): void {}
        })
        const expectedReport = {
            ok: false,
            diagnostics: [
                {
                    code: 'SAGIFIRE_IOC_DUPLICATE_COMPOSER_BINDING',
                    severity: 'error',
                    message: 'Duplicate composer binding for token "dsl.auth-reader"',
                    details: {
                        tokenId: 'dsl.auth-reader',
                        bindingKinds: ['value', 'factory']
                    }
                }
            ]
        }
        const app = defineApp({
            modules: [moduleDefinition],
            bindings: [
                bind(AUTH_READER).toValue({
                    currentUserId(): string {
                        return 'first-user'
                    }
                }),
                adapt(AUTH_READER, () => {
                    return {
                        currentUserId(): string {
                            return 'second-user'
                        }
                    }
                })
            ]
        })

        expect(app.validate()).toEqual(expectedReport)
        expect(app.inspect().validation).toEqual(expectedReport)
        await expect(app.prepare()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_COMPOSER_VALIDATION_FAILED',
            report: expectedReport
        })
        await expect(app.compose()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_COMPOSER_VALIDATION_FAILED',
            report: expectedReport
        })
    })

    test('records supported binding forms without executing factories during graph inspection', () => {
        const moduleDefinition = moduleDsl('dsl-app-binding-forms', {
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
        const app = defineApp({
            modules: [moduleDefinition],
            bindings: [
                {
                    token: VALUE_AUTH_READER,
                    useValue: {
                        currentUserId(): string {
                            return 'value-user'
                        }
                    }
                },
                {
                    token: FACTORY_AUTH_READER,
                    useFactory(): AuthReader {
                        factoryCalls += 1

                        return {
                            currentUserId(): string {
                                return 'factory-user'
                            }
                        }
                    }
                },
                {
                    token: CLASS_AUTH_READER,
                    useClass: ClassAuthReader
                },
                {
                    token: ASYNC_AUTH_READER,
                    async useAsyncFactory(): Promise<AuthReader> {
                        asyncFactoryCalls += 1

                        return {
                            currentUserId(): string {
                                return 'async-user'
                            }
                        }
                    }
                }
            ]
        })

        expect(app.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(app.getGraph().bindings).toEqual([
            {
                tokenId: 'dsl.value-auth-reader',
                kind: 'value',
                providerKind: 'value',
                lifetime: 'singleton'
            },
            {
                tokenId: 'dsl.factory-auth-reader',
                kind: 'factory',
                providerKind: 'factory',
                lifetime: 'transient'
            },
            {
                tokenId: 'dsl.class-auth-reader',
                kind: 'class',
                providerKind: 'class',
                lifetime: 'transient'
            },
            {
                tokenId: 'dsl.async-auth-reader',
                kind: 'async-factory',
                providerKind: 'async-factory',
                lifetime: 'transient',
                initialization: 'lazy'
            }
        ])
        expect(app.inspect().edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-app-binding-forms',
                requiredTokenId: 'dsl.value-auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.value-auth-reader',
                bindingKind: 'value'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-app-binding-forms',
                requiredTokenId: 'dsl.factory-auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.factory-auth-reader',
                bindingKind: 'factory'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-app-binding-forms',
                requiredTokenId: 'dsl.class-auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.class-auth-reader',
                bindingKind: 'class'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-app-binding-forms',
                requiredTokenId: 'dsl.async-auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.async-auth-reader',
                bindingKind: 'async-factory'
            }
        ])
        expect(factoryCalls).toBe(0)
        expect(asyncFactoryCalls).toBe(0)
    })

    test('preserves app DSL type inference', () => {
        const moduleDefinition = moduleDsl('dsl-app-typed', {
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
            setup(): void {}
        })
        const authReader: AuthReader = {
            currentUserId(): string {
                return 'typed-user'
            }
        }
        const app = defineApp({
            modules: [moduleDefinition],
            bindings: [
                {
                    token: AUTH_READER,
                    useValue: authReader
                }
            ]
        })

        expectTypeOf(app).toMatchTypeOf<AppDslDefinition>()
        expectTypeOf(app.modules[0]).toMatchTypeOf<ModuleDefinition | undefined>()
        expectTypeOf<
            TokenValue<(typeof app.modules)[0]['requires'][0]['token']>
        >().toEqualTypeOf<AuthReader>()
        expectTypeOf<
            TokenValue<(typeof app.modules)[0]['provides'][0]['token']>
        >().toEqualTypeOf<ContactRequestsPublicApi>()
        expectTypeOf<TokenValue<(typeof app.bindings)[0]['token']>>().toEqualTypeOf<AuthReader>()
        expectTypeOf<
            NonNullable<(typeof app.bindings)[0]>['useValue']
        >().toEqualTypeOf<AuthReader>()
        expectTypeOf(app.createComposer()).toMatchTypeOf<ReturnType<typeof createComposer>>()
        expectTypeOf(app.validate()).toEqualTypeOf<DiagnosticReport>()
        expectTypeOf(app.inspect()).toEqualTypeOf<ComposerInspection>()
        expectTypeOf(app.getGraph()).toEqualTypeOf<ModuleGraph>()
        expectTypeOf<ReturnType<typeof app.compose>>().toEqualTypeOf<Promise<ComposedRuntime>>()
    })
})

describe('bind/adapt DSL', () => {
    test('converts bind helper declarations through defineApp for supported binding forms', async () => {
        const moduleDefinition = moduleDsl('dsl-bind-helper-forms', {
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
            provides: [
                {
                    token: CONTACT_REQUESTS_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context
                    .bind(CONTACT_REQUESTS_PUBLIC_API)
                    .toAsyncFactory(async (resolutionContext) => {
                        const valueReader = resolutionContext.get(VALUE_AUTH_READER)
                        const factoryReader = resolutionContext.get(FACTORY_AUTH_READER)
                        const classReader = resolutionContext.get(CLASS_AUTH_READER)
                        const asyncReader = await resolutionContext.getAsync(ASYNC_AUTH_READER)

                        return {
                            submit(): string {
                                return [
                                    valueReader.currentUserId(),
                                    factoryReader.currentUserId(),
                                    classReader.currentUserId(),
                                    asyncReader.currentUserId()
                                ].join('|')
                            }
                        }
                    })
            }
        })
        let factoryCalls = 0
        let asyncFactoryCalls = 0
        const app = defineApp({
            modules: [moduleDefinition],
            bindings: [
                bind(VALUE_AUTH_READER).toValue({
                    currentUserId(): string {
                        return 'value-user'
                    }
                }),
                bind(FACTORY_AUTH_READER).toFactory(() => {
                    factoryCalls += 1

                    return {
                        currentUserId(): string {
                            return 'factory-user'
                        }
                    }
                }),
                bind(CLASS_AUTH_READER).toClass(ClassAuthReader),
                bind(ASYNC_AUTH_READER).toAsyncFactory(async () => {
                    asyncFactoryCalls += 1

                    return {
                        currentUserId(): string {
                            return 'async-user'
                        }
                    }
                })
            ]
        })

        expect(app.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(app.getGraph().bindings).toEqual([
            {
                tokenId: 'dsl.value-auth-reader',
                kind: 'value',
                providerKind: 'value',
                lifetime: 'singleton'
            },
            {
                tokenId: 'dsl.factory-auth-reader',
                kind: 'factory',
                providerKind: 'factory',
                lifetime: 'transient'
            },
            {
                tokenId: 'dsl.class-auth-reader',
                kind: 'class',
                providerKind: 'class',
                lifetime: 'transient'
            },
            {
                tokenId: 'dsl.async-auth-reader',
                kind: 'async-factory',
                providerKind: 'async-factory',
                lifetime: 'transient',
                initialization: 'lazy'
            }
        ])
        expect(app.inspect().edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-bind-helper-forms',
                requiredTokenId: 'dsl.value-auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.value-auth-reader',
                bindingKind: 'value'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-bind-helper-forms',
                requiredTokenId: 'dsl.factory-auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.factory-auth-reader',
                bindingKind: 'factory'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-bind-helper-forms',
                requiredTokenId: 'dsl.class-auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.class-auth-reader',
                bindingKind: 'class'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-bind-helper-forms',
                requiredTokenId: 'dsl.async-auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.async-auth-reader',
                bindingKind: 'async-factory'
            }
        ])
        expect(factoryCalls).toBe(0)
        expect(asyncFactoryCalls).toBe(0)

        const runtime = await app.compose()

        expect(factoryCalls).toBe(0)
        expect(asyncFactoryCalls).toBe(0)
        const publicApi = await runtime.getAsync(CONTACT_REQUESTS_PUBLIC_API)

        expect(publicApi.submit()).toBe('value-user|factory-user|class-user|async-user')
        expect(factoryCalls).toBe(1)
        expect(asyncFactoryCalls).toBe(1)

        await runtime.dispose()
    })

    test('adapts a required port from explicit context access without hidden graph edges', async () => {
        const authModule = moduleDsl('dsl-adapt-auth', {
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'adapted-user'
                    }
                })
            }
        })
        const contactRequestsModule = moduleDsl('dsl-adapt-contact-requests', {
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
        let adapterCalls = 0
        const app = defineApp({
            modules: [authModule, contactRequestsModule],
            bindings: [
                adapt(AUTH_READER, (context) => {
                    adapterCalls += 1

                    const auth = context.get(AUTH_PUBLIC_API)

                    return {
                        currentUserId(): string {
                            return auth.requireUser()
                        }
                    }
                })
            ]
        })

        expect(app.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(app.inspect().edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-adapt-contact-requests',
                requiredTokenId: 'dsl.auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.auth-reader',
                bindingKind: 'factory'
            }
        ])
        expect(JSON.stringify(app.inspect().edges)).not.toContain('dsl.auth-public-api')
        expect(adapterCalls).toBe(0)

        const runtime = await app.compose()

        expect(runtime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('adapted-user')
        expect(adapterCalls).toBe(1)

        await runtime.dispose()
    })

    test('uses adapt declarations as explicit binding priority metadata', () => {
        const authReaderProviderModule = moduleDsl('dsl-bind-priority-provider', {
            provides: [
                {
                    token: AUTH_READER,
                    kind: 'shared-service'
                }
            ],
            setup(): void {}
        })
        const consumerModule = moduleDsl('dsl-bind-priority-consumer', {
            requires: [
                {
                    token: AUTH_READER
                }
            ],
            setup(): void {}
        })
        const app = defineApp({
            modules: [authReaderProviderModule, consumerModule],
            bindings: [
                adapt(AUTH_READER, () => {
                    return {
                        currentUserId(): string {
                            return 'binding-priority-user'
                        }
                    }
                })
            ]
        })
        const graph = app.getGraph()

        expect(graph.requiredPorts[0]?.satisfiedBy).toBe('binding')
        expect(graph.edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'dsl-bind-priority-consumer',
                requiredTokenId: 'dsl.auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'dsl.auth-reader',
                bindingKind: 'factory'
            }
        ])
        expect(graph.edges.some((edge) => edge.edgeKind === 'capability')).toBe(false)
        expect(JSON.stringify(graph)).not.toContain('binding-priority-user')
    })

    test('preserves bind and adapt type inference', () => {
        const bindBuilder = bind(AUTH_READER)
        const valueBinding = bindBuilder.toValue({
            currentUserId(): string {
                return 'typed-value-user'
            }
        })
        const factoryBinding = bind(AUTH_READER).toFactory((context) => {
            const auth = context.get(AUTH_PUBLIC_API)

            expectTypeOf(auth).toEqualTypeOf<AuthPublicApi>()

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })
        const asyncFactoryBinding = bind(AUTH_READER).toAsyncFactory(async (context) => {
            const auth = await context.getAsync(AUTH_PUBLIC_API)

            expectTypeOf(auth).toEqualTypeOf<AuthPublicApi>()

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })
        const adapterBinding = adapt(AUTH_READER, (context) => {
            const auth = context.get(AUTH_PUBLIC_API)

            expectTypeOf(auth).toEqualTypeOf<AuthPublicApi>()

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })

        expectTypeOf(bindBuilder).toEqualTypeOf<BindDslBuilder<AuthReader>>()
        expectTypeOf(valueBinding).toEqualTypeOf<AppDslValueBindingDefinition<AuthReader>>()
        expectTypeOf(factoryBinding).toEqualTypeOf<AppDslFactoryBindingDefinition<AuthReader>>()
        expectTypeOf(asyncFactoryBinding).toEqualTypeOf<
            AppDslAsyncFactoryBindingDefinition<AuthReader>
        >()
        expectTypeOf(adapterBinding).toEqualTypeOf<AppDslFactoryBindingDefinition<AuthReader>>()
        expectTypeOf(adapterBinding.useFactory).toEqualTypeOf<ComposerBindingFactory<AuthReader>>()
        expectTypeOf<TokenValue<typeof adapterBinding.token>>().toEqualTypeOf<AuthReader>()
    })
})

describe('DSL hardening', () => {
    test('matches equivalent object API graph inspection for the final DSL path', async () => {
        const createAuthSetup = (userId: string) => {
            return (context: ModuleSetupContext): void => {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return userId
                    }
                })
            }
        }
        const createContactSetup = () => {
            return (context: ModuleSetupContext): void => {
                context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((resolutionContext) => {
                    const authReader = resolutionContext.get(AUTH_READER)

                    return {
                        submit(): string {
                            return authReader.currentUserId()
                        }
                    }
                })
            }
        }
        const authReaderAdapter = (context: ComposerBindingContext): AuthReader => {
            const auth = context.get(AUTH_PUBLIC_API)

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        }
        const objectAuthModule = defineModule({
            id: 'dsl-hardening-auth',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup: createAuthSetup('hardening-user')
        })
        const objectContactModule = defineModule({
            id: 'dsl-hardening-contact-requests',
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
            setup: createContactSetup()
        })
        const dslAuthModule = moduleDsl('dsl-hardening-auth', {
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup: createAuthSetup('hardening-user')
        })
        const dslContactModule = moduleDsl('dsl-hardening-contact-requests', {
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
            setup: createContactSetup()
        })
        const objectComposer = createComposer().use(objectAuthModule).use(objectContactModule)

        objectComposer.bind(AUTH_READER).toFactory(authReaderAdapter)

        const app = defineApp({
            modules: [dslAuthModule, dslContactModule],
            bindings: [adapt(AUTH_READER, authReaderAdapter)]
        })
        const objectRuntime = await objectComposer.compose()
        const appRuntime = await app.compose()

        expect(app.validate()).toEqual(objectComposer.validate())
        expect(app.getGraph()).toEqual(objectComposer.getGraph())
        expect(app.inspect()).toEqual(objectComposer.inspect())
        expect(appRuntime.inspect()).toEqual(objectRuntime.inspect())
        expect(appRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('hardening-user')
        expect(objectRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('hardening-user')

        await appRuntime.dispose()
        await objectRuntime.dispose()
    })

    test('keeps modules and bindings explicit without shared registry or auto discovery', () => {
        const orphanAuthModule = moduleDsl('dsl-hardening-orphan-auth', {
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const consumerModule = moduleDsl('dsl-hardening-explicit-consumer', {
            requires: [
                {
                    token: AUTH_PUBLIC_API
                },
                {
                    token: AUTH_READER
                }
            ],
            setup(): void {}
        })
        const orphanBinding = bind(AUTH_READER).toValue({
            currentUserId(): string {
                return 'orphan-binding-user'
            }
        })
        const missingApp = defineApp({
            modules: [consumerModule]
        })
        const explicitApp = defineApp({
            modules: [orphanAuthModule, consumerModule],
            bindings: [orphanBinding]
        })

        expect(missingApp.validate()).toEqual({
            ok: false,
            diagnostics: [
                {
                    code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
                    severity: 'error',
                    message:
                        'Missing required port "dsl.auth-public-api" for module "dsl-hardening-explicit-consumer"',
                    details: {
                        moduleId: 'dsl-hardening-explicit-consumer',
                        tokenId: 'dsl.auth-public-api',
                        dependencyKind: 'external'
                    }
                },
                {
                    code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
                    severity: 'error',
                    message:
                        'Missing required port "dsl.auth-reader" for module "dsl-hardening-explicit-consumer"',
                    details: {
                        moduleId: 'dsl-hardening-explicit-consumer',
                        tokenId: 'dsl.auth-reader',
                        dependencyKind: 'external'
                    }
                }
            ]
        })
        expect(explicitApp.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(explicitApp.getGraph().modules.map((moduleNode) => moduleNode.id)).toEqual([
            'dsl-hardening-orphan-auth',
            'dsl-hardening-explicit-consumer'
        ])
        expect(explicitApp.getGraph().bindings).toEqual([
            {
                tokenId: 'dsl.auth-reader',
                kind: 'value',
                providerKind: 'value',
                lifetime: 'singleton'
            }
        ])
    })

    test('preserves final DSL tuple inference for module, app, bind and adapt declarations', () => {
        const moduleDefinition = moduleDsl('dsl-hardening-typed', {
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
            setup(): void {}
        })
        const valueBinding = bind(AUTH_READER).toValue({
            currentUserId(): string {
                return 'typed-hardening-user'
            }
        })
        const adapterBinding = adapt(AUTH_READER, () => {
            return {
                currentUserId(): string {
                    return 'typed-adapter-user'
                }
            }
        })
        const app = defineApp({
            modules: [moduleDefinition],
            bindings: [valueBinding, adapterBinding]
        })

        expectTypeOf(app).toMatchTypeOf<AppDslDefinition>()
        expectTypeOf(app.modules[0]).toEqualTypeOf<typeof moduleDefinition>()
        expectTypeOf(app.bindings[0]).toEqualTypeOf<AppDslValueBindingDefinition<AuthReader>>()
        expectTypeOf(app.bindings[1]).toEqualTypeOf<AppDslFactoryBindingDefinition<AuthReader>>()
        expectTypeOf<
            TokenValue<(typeof app.modules)[0]['requires'][0]['token']>
        >().toEqualTypeOf<AuthReader>()
        expectTypeOf<
            TokenValue<(typeof app.modules)[0]['provides'][0]['token']>
        >().toEqualTypeOf<ContactRequestsPublicApi>()
    })
})
