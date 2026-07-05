import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    CapabilityCardinalityConflictError,
    CapabilityRegistrationCardinalityMismatchError,
    ComposerBindingCardinalityConflictError,
    ComposerValidationError,
    DuplicateComposerBindingError,
    DuplicateModuleIdError,
    DuplicateModuleCapabilityError,
    DuplicateModuleDependencyError,
    DuplicateSingleCapabilityError,
    GetAllUsedForSingleTokenError,
    GetUsedForMultiTokenError,
    InvalidComposerBindingError,
    InvalidComposerMultiBindingError,
    InvalidModuleDefinitionError,
    MissingModuleProviderError,
    MissingRequiredPortError,
    ModuleCycleError,
    PrivateProviderAccessError,
    RequiredMultiCapabilityMissingError,
    RequiredPortCardinalityMismatchError,
    type ComposedRuntime,
    createComposer,
    defineModule,
    type BindingDependencyEdge,
    type CapabilityMetadata,
    type CapabilityDependencyEdge,
    type CapabilityProviderMetadata,
    type CapabilityProviderRegistrationKind,
    type CapabilityProviderSource,
    type Composer,
    type ComposerBindingBuilder,
    type ComposerBindingContext,
    type ComposerInspection,
    type ComposerMultiBindingBuilder,
    type CompositionBindingMetadata,
    type ComposerBindingCardinalityConflictErrorDetails,
    type DuplicateComposerBindingErrorDetails,
    type InspectionProviderKind,
    type InvalidComposerMultiBindingErrorDetails,
    type ModuleCardinality,
    type ModuleCapabilityDefinition,
    type ModuleCapabilityDefinitionInput,
    type ModuleDefinition,
    type ModuleDefinitionInput,
    type ModuleDependencyDefinition,
    type ModuleDependencyDefinitionInput,
    type ModuleDependencyEdge,
    type ModuleDependencyEdgeBase,
    type ModuleDependencyEdgeKind,
    type ModuleDependencyKind,
    type ModuleCycleErrorDetails,
    type ModuleGraph,
    type ModuleNodeMetadata,
    type ModuleSetupContext,
    type ModuleSetupResult,
    type PreparedComposition,
    type ProviderRegistrationProviderSummary,
    type ProviderRegistrationSource,
    type ProviderRegistrationSummary,
    type RequiredPortMetadata,
    type RequiredPortSatisfaction,
    type RuntimeInspection
} from '../src/composer.js'
import {
    AsyncProviderAccessError,
    InvalidScopeError,
    ProviderCycleError,
    RuntimeDisposedError
} from '../src/container.js'
import type {
    BindingBuilder,
    LifetimeBinding,
    MultiBindingBuilder,
    Scope
} from '../src/container.js'
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

interface NotificationPublicApi {
    notify(): string
}

interface ResourcePublicApi {
    status(): string
}

type TokenValue<TToken> = TToken extends Token<infer TValue> ? TValue : never

const AUTH_READER = token<AuthReader>('composer.auth-reader')
const OPTIONAL_AUTH_READER = token<AuthReader>('composer.optional-auth-reader')
const AUTH_PUBLIC_API = token<AuthPublicApi>('composer.auth-public-api')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsPublicApi>(
    'composer.contact-requests-public-api'
)
const NOTIFICATION_PUBLIC_API = token<NotificationPublicApi>('composer.notification-public-api')
const VALUE_AUTH_READER = token<AuthReader>('composer.value-auth-reader')
const FACTORY_AUTH_READER = token<AuthReader>('composer.factory-auth-reader')
const CLASS_AUTH_READER = token<AuthReader>('composer.class-auth-reader')
const ASYNC_AUTH_READER = token<AuthReader>('composer.async-auth-reader')
const AUTH_SECRET = token<{ readonly secret: string }>('composer.auth-secret')
const AUDIT_EVENTS = token<string>('composer.audit-events')
const SCOPED_COUNTER = token<{ read(): number }>('composer.scoped-counter')
const RESOURCE_PUBLIC_API = token<ResourcePublicApi>('composer.resource-public-api')

class ClassAuthReader implements AuthReader {
    currentUserId(): string {
        return 'class-user'
    }
}

describe('module definition foundation', () => {
    test('defines a module with normalized required ports and capabilities', () => {
        const setup = (): ModuleSetupResult => {
            return {}
        }
        const module = defineModule({
            id: 'contact-requests',
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

        expect(module.id).toBe('contact-requests')
        expect(module.version).toBe('1.0.0')
        expect(module.metadata).toEqual({
            owner: 'product'
        })
        expect(module.requires).toEqual([
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
        expect(module.provides).toEqual([
            {
                token: CONTACT_REQUESTS_PUBLIC_API,
                kind: 'public-api',
                cardinality: 'single',
                description: 'Contact requests public API'
            }
        ])
        expect(module.setup).toBe(setup)
    })

    test('normalizes explicit multi cardinality for required ports and capabilities', () => {
        const module = defineModule({
            id: 'multi-cardinality',
            requires: [
                {
                    token: NOTIFICATION_PUBLIC_API,
                    required: false,
                    kind: 'shared',
                    cardinality: 'multi'
                }
            ],
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })

        expect(module.requires).toEqual([
            {
                token: NOTIFICATION_PUBLIC_API,
                required: false,
                kind: 'shared',
                cardinality: 'multi'
            }
        ])
        expect(module.provides).toEqual([
            {
                token: AUDIT_EVENTS,
                kind: 'event-subscriber',
                cardinality: 'multi'
            }
        ])
    })

    test('normalizes missing requires and provides to empty immutable arrays', () => {
        const module = defineModule({
            id: 'auth',
            setup(): void {}
        })

        expect(module.requires).toEqual([])
        expect(module.provides).toEqual([])
        expect(Object.isFrozen(module.requires)).toBe(true)
        expect(Object.isFrozen(module.provides)).toBe(true)
    })

    test.each(['', ' auth', 'auth ', 'auth module', 'автентифікація', 'auth#module'])(
        'rejects invalid module id %j',
        (id) => {
            expect(() =>
                defineModule({
                    id,
                    setup(): void {}
                })
            ).toThrow(InvalidModuleDefinitionError)
            expect(() =>
                defineModule({
                    id,
                    setup(): void {}
                })
            ).toThrow(/Invalid module definition/)
        }
    )

    test('throws typed diagnostics for invalid JavaScript definitions', () => {
        expect(() => defineModule(undefined as unknown as ModuleDefinitionInput)).toThrow(
            InvalidModuleDefinitionError
        )
        expect(() =>
            defineModule({
                id: 123,
                setup(): void {}
            } as unknown as ModuleDefinitionInput)
        ).toThrow(InvalidModuleDefinitionError)
        expect(() =>
            defineModule({
                id: 'invalid-setup'
            } as unknown as ModuleDefinitionInput)
        ).toThrow(InvalidModuleDefinitionError)
        expect(() =>
            defineModule({
                id: 'invalid-kind',
                requires: [
                    {
                        token: AUTH_READER,
                        kind: 'local'
                    }
                ],
                setup(): void {}
            } as unknown as ModuleDefinitionInput)
        ).toThrow(InvalidModuleDefinitionError)
        expect(() =>
            defineModule({
                id: 'invalid-capability-kind',
                provides: [
                    {
                        token: AUTH_PUBLIC_API,
                        kind: 'internal'
                    }
                ],
                setup(): void {}
            } as unknown as ModuleDefinitionInput)
        ).toThrow(InvalidModuleDefinitionError)
    })

    test('throws typed diagnostics for invalid cardinality declarations', () => {
        const invalidRequiredPort = () => {
            return defineModule({
                id: 'invalid-required-cardinality',
                requires: [
                    {
                        token: AUTH_READER,
                        cardinality: 'many'
                    }
                ],
                setup(): void {}
            } as unknown as ModuleDefinitionInput)
        }
        const invalidCapability = () => {
            return defineModule({
                id: 'invalid-capability-cardinality',
                provides: [
                    {
                        token: AUTH_PUBLIC_API,
                        kind: 'public-api',
                        cardinality: 2
                    }
                ],
                setup(): void {}
            } as unknown as ModuleDefinitionInput)
        }

        expect(invalidRequiredPort).toThrow(InvalidModuleDefinitionError)
        expect(invalidCapability).toThrow(InvalidModuleDefinitionError)

        try {
            invalidRequiredPort()
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidModuleDefinitionError)

            if (error instanceof InvalidModuleDefinitionError) {
                expect(error.code).toBe('SAGIFIRE_IOC_INVALID_MODULE_DEFINITION')
                expect(error.details).toEqual({
                    moduleId: 'invalid-required-cardinality',
                    reason: 'requires[0].cardinality must be "single" or "multi" when provided',
                    value: 'many'
                })
            }
        }

        try {
            invalidCapability()
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidModuleDefinitionError)

            if (error instanceof InvalidModuleDefinitionError) {
                expect(error.details).toEqual({
                    moduleId: 'invalid-capability-cardinality',
                    reason: 'provides[0].cardinality must be "single" or "multi" when provided',
                    value: 2
                })
            }
        }
    })

    test('rejects duplicate required ports by token id', () => {
        const alias = token<AuthReader>('composer.auth-reader')

        expect(() =>
            defineModule({
                id: 'duplicate-requires',
                requires: [
                    {
                        token: AUTH_READER
                    },
                    {
                        token: alias,
                        required: false
                    }
                ],
                setup(): void {}
            })
        ).toThrow(DuplicateModuleDependencyError)

        try {
            defineModule({
                id: 'duplicate-requires',
                requires: [
                    {
                        token: AUTH_READER
                    },
                    {
                        token: alias
                    }
                ],
                setup(): void {}
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DuplicateModuleDependencyError)

            if (error instanceof DuplicateModuleDependencyError) {
                expect(error.code).toBe('SAGIFIRE_IOC_DUPLICATE_MODULE_DEPENDENCY')
                expect(error.details).toEqual({
                    moduleId: 'duplicate-requires',
                    tokenId: 'composer.auth-reader',
                    section: 'requires'
                })
            }
        }
    })

    test('rejects duplicate provided capabilities by token id', () => {
        const alias = token<ContactRequestsPublicApi>('composer.contact-requests-public-api')

        expect(() =>
            defineModule({
                id: 'duplicate-provides',
                provides: [
                    {
                        token: CONTACT_REQUESTS_PUBLIC_API,
                        kind: 'public-api'
                    },
                    {
                        token: alias,
                        kind: 'shared-service'
                    }
                ],
                setup(): void {}
            })
        ).toThrow(DuplicateModuleCapabilityError)

        try {
            defineModule({
                id: 'duplicate-provides',
                provides: [
                    {
                        token: CONTACT_REQUESTS_PUBLIC_API,
                        kind: 'public-api'
                    },
                    {
                        token: alias,
                        kind: 'shared-service'
                    }
                ],
                setup(): void {}
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DuplicateModuleCapabilityError)

            if (error instanceof DuplicateModuleCapabilityError) {
                expect(error.code).toBe('SAGIFIRE_IOC_DUPLICATE_MODULE_CAPABILITY')
                expect(error.details).toEqual({
                    moduleId: 'duplicate-provides',
                    tokenId: 'composer.contact-requests-public-api',
                    section: 'provides'
                })
            }
        }
    })

    test('freezes returned definitions at the public object boundary', () => {
        const module = defineModule({
            id: 'immutable',
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
            setup(): void {}
        })

        expect(Object.isFrozen(module)).toBe(true)
        expect(Object.isFrozen(module.requires)).toBe(true)
        expect(Object.isFrozen(module.provides)).toBe(true)
        expect(Object.isFrozen(module.requires[0])).toBe(true)
        expect(Object.isFrozen(module.provides[0])).toBe(true)
        expect(() => {
            const mutableModule = module as { id: string }

            mutableModule.id = 'changed'
        }).toThrow(TypeError)
        expect(() => {
            const mutableRequires =
                module.requires as unknown as ModuleDependencyDefinition<AuthReader>[]

            mutableRequires.push({
                token: OPTIONAL_AUTH_READER,
                required: true,
                kind: 'external'
            })
        }).toThrow(TypeError)
        expect(() => {
            const mutableDependency = module.requires[0] as { required: boolean }

            mutableDependency.required = false
        }).toThrow(TypeError)
    })

    test('preserves metadata, required port and capability token inference', () => {
        const module = defineModule({
            id: 'typed-module',
            metadata: {
                feature: 'typed'
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
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context) {
                expectTypeOf(context).toEqualTypeOf<ModuleSetupContext>()

                return {
                    metadata: {
                        feature: 'typed'
                    }
                }
            }
        })
        const setupResult: ModuleSetupResult<{
            readonly feature: string
        }> = {
            metadata: {
                feature: 'typed'
            }
        }

        expect(module.id).toBe('typed-module')
        expectTypeOf(module).toMatchTypeOf<ModuleDefinition>()
        expectTypeOf(module.metadata).toMatchTypeOf<
            | {
                  readonly feature: string
              }
            | undefined
        >()
        expectTypeOf(module.requires[0]).toMatchTypeOf<ModuleDependencyDefinition<AuthReader>>()
        expectTypeOf(module.provides[0]).toMatchTypeOf<ModuleCapabilityDefinition<AuthPublicApi>>()
        expectTypeOf(module.requires[0].cardinality).toEqualTypeOf<ModuleCardinality>()
        expectTypeOf(module.provides[0].cardinality).toEqualTypeOf<ModuleCardinality>()
        expectTypeOf<ModuleCardinality>().toEqualTypeOf<'single' | 'multi'>()
        expectTypeOf<ModuleDependencyKind>().toEqualTypeOf<'external' | 'shared'>()
        expectTypeOf<ModuleDependencyDefinitionInput<AuthReader>>().toMatchTypeOf<{
            readonly cardinality?: ModuleCardinality
        }>()
        expectTypeOf<ModuleCapabilityDefinitionInput<AuthPublicApi>>().toMatchTypeOf<{
            readonly cardinality?: ModuleCardinality
        }>()
        expectTypeOf<TokenValue<(typeof module.requires)[0]['token']>>().toEqualTypeOf<AuthReader>()
        expectTypeOf<TokenValue<(typeof module.requires)[1]['token']>>().toEqualTypeOf<AuthReader>()
        expectTypeOf<
            TokenValue<(typeof module.provides)[0]['token']>
        >().toEqualTypeOf<AuthPublicApi>()
        expectTypeOf(setupResult.metadata).toEqualTypeOf<
            | {
                  readonly feature: string
              }
            | undefined
        >()
    })
})

describe('composer builder and static validation', () => {
    test('registers modules and validates a satisfied graph', () => {
        const authModule = defineModule({
            id: 'auth',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const contactRequestsModule = defineModule({
            id: 'contact-requests',
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
        const composer = createComposer()

        expect(composer.use(authModule)).toBe(composer)
        expect(composer.use(contactRequestsModule)).toBe(composer)

        composer.bind(AUTH_READER).toFactory((context) => {
            const auth = context.get(AUTH_PUBLIC_API)

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })

        expect(composer.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
    })

    test('records value, factory, class and async factory bindings without executing them', () => {
        const module = defineModule({
            id: 'binding-kinds',
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
        const composer = createComposer().use(module)
        let factoryCalls = 0
        let asyncFactoryCalls = 0

        composer.bind(VALUE_AUTH_READER).toValue({
            currentUserId(): string {
                return 'value-user'
            }
        })
        composer.bind(FACTORY_AUTH_READER).toFactory(() => {
            factoryCalls += 1

            return {
                currentUserId(): string {
                    return 'factory-user'
                }
            }
        })
        composer.bind(CLASS_AUTH_READER).toClass(ClassAuthReader)
        composer.bind(ASYNC_AUTH_READER).toAsyncFactory(async () => {
            asyncFactoryCalls += 1

            return {
                currentUserId(): string {
                    return 'async-user'
                }
            }
        })

        expect(composer.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(factoryCalls).toBe(0)
        expect(asyncFactoryCalls).toBe(0)
    })

    test('reports duplicate composer bindings before prepare and compose reach container', async () => {
        let setupCalls = 0
        const module = defineModule({
            id: 'duplicate-composer-binding',
            requires: [
                {
                    token: AUTH_READER
                }
            ],
            setup(): void {
                setupCalls += 1
            }
        })
        const composer = createComposer().use(module)
        const expectedReport = {
            ok: false,
            diagnostics: [
                {
                    code: 'SAGIFIRE_IOC_DUPLICATE_COMPOSER_BINDING',
                    severity: 'error',
                    message: 'Duplicate composer binding for token "composer.auth-reader"',
                    details: {
                        tokenId: 'composer.auth-reader',
                        bindingKinds: ['value', 'factory']
                    }
                }
            ]
        }

        composer.bind(AUTH_READER).toValue({
            currentUserId(): string {
                return 'first-user'
            }
        })
        composer.bind(AUTH_READER).toFactory(() => {
            return {
                currentUserId(): string {
                    return 'second-user'
                }
            }
        })

        expect(composer.validate()).toEqual(expectedReport)
        expect(composer.inspect().validation).toEqual(expectedReport)
        await expect(composer.prepare()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_COMPOSER_VALIDATION_FAILED',
            report: expectedReport
        })
        await expect(composer.compose()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_COMPOSER_VALIDATION_FAILED',
            report: expectedReport
        })
        await expect(composer.compose()).rejects.not.toMatchObject({
            code: 'SAGIFIRE_IOC_DUPLICATE_PROVIDER'
        })
        expect(setupCalls).toBe(0)
        expect(
            new DuplicateComposerBindingError(AUTH_READER.id, ['value', 'factory'])
        ).toBeInstanceOf(DuplicateComposerBindingError)
    })

    test('uses declared capabilities to satisfy required ports without explicit bindings', () => {
        const authModule = defineModule({
            id: 'auth-capability-provider',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const consumerModule = defineModule({
            id: 'auth-capability-consumer',
            requires: [
                {
                    token: AUTH_PUBLIC_API
                }
            ],
            setup(): void {}
        })
        const composer = createComposer().use(authModule).use(consumerModule)

        expect(composer.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
    })

    test('reports duplicate module ids in registration order', () => {
        const first = defineModule({
            id: 'duplicate-module',
            setup(): void {}
        })
        const second = defineModule({
            id: 'duplicate-module',
            requires: [
                {
                    token: AUTH_READER
                }
            ],
            setup(): void {}
        })
        const report = createComposer().use(first).use(second).validate()

        expect(report.ok).toBe(false)
        expect(report.diagnostics[0]).toEqual({
            code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_ID',
            severity: 'error',
            message: 'Duplicate module id "duplicate-module"',
            details: {
                moduleId: 'duplicate-module'
            }
        })
        expect(report.diagnostics[0]).toEqual(
            expect.objectContaining({
                code: new DuplicateModuleIdError('duplicate-module').code
            })
        )
    })

    test('reports missing required ports with requiring module and token ids', () => {
        const module = defineModule({
            id: 'missing-port-module',
            requires: [
                {
                    token: AUTH_READER
                },
                {
                    token: OPTIONAL_AUTH_READER,
                    required: false
                }
            ],
            setup(): void {}
        })
        const report = createComposer().use(module).validate()

        expect(report.ok).toBe(false)
        expect(report.diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
                severity: 'error',
                message:
                    'Missing required port "composer.auth-reader" for module "missing-port-module"',
                details: {
                    moduleId: 'missing-port-module',
                    tokenId: 'composer.auth-reader',
                    dependencyKind: 'external'
                }
            }
        ])
        expect(
            new MissingRequiredPortError('missing-port-module', AUTH_READER.id, 'external')
        ).toBeInstanceOf(MissingRequiredPortError)
    })

    test('reports bindings that target no declared required port without exposing values', () => {
        const secret = {
            secret: 'do-not-render',
            currentUserId(): string {
                return 'secret-user'
            }
        }
        const composer = createComposer()

        composer.bind(AUTH_READER).toValue(secret)

        const validation = composer.validate()

        expect(validation.ok).toBe(false)
        expect(validation.diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_INVALID_COMPOSER_BINDING',
                severity: 'error',
                message:
                    'Invalid composer binding for token "composer.auth-reader": ' +
                    'binding target is not declared by any module required port',
                details: {
                    tokenId: 'composer.auth-reader',
                    bindingKind: 'value',
                    reason: 'missing-required-port'
                }
            }
        ])
        expect(JSON.stringify(validation)).not.toContain('do-not-render')
        expect(new InvalidComposerBindingError(AUTH_READER.id, 'value')).toBeInstanceOf(
            InvalidComposerBindingError
        )
    })

    test('reports duplicate declared single capabilities across modules', () => {
        const first = defineModule({
            id: 'first-capability-provider',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const second = defineModule({
            id: 'second-capability-provider',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'shared-service'
                }
            ],
            setup(): void {}
        })
        const report = createComposer().use(first).use(second).validate()

        expect(report.ok).toBe(false)
        expect(report.diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_DUPLICATE_SINGLE_CAPABILITY',
                severity: 'error',
                message:
                    'Duplicate single capability "composer.auth-public-api" in modules: ' +
                    'first-capability-provider, second-capability-provider',
                details: {
                    moduleId: 'first-capability-provider',
                    moduleIds: ['first-capability-provider', 'second-capability-provider'],
                    tokenId: 'composer.auth-public-api',
                    section: 'provides'
                }
            }
        ])
        expect(
            new DuplicateSingleCapabilityError(AUTH_PUBLIC_API.id, [
                'first-capability-provider',
                'second-capability-provider'
            ])
        ).toBeInstanceOf(DuplicateSingleCapabilityError)
    })

    test('allows compatible multi capability declarations for the same token', () => {
        const first = defineModule({
            id: 'first-audit-contributor',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const second = defineModule({
            id: 'second-audit-contributor',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })

        expect(createComposer().use(first).use(second).validate()).toEqual({
            ok: true,
            diagnostics: []
        })
    })

    test('reports single and multi capability declaration conflicts deterministically', () => {
        const singleProvider = defineModule({
            id: 'single-audit-provider',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber'
                }
            ],
            setup(): void {}
        })
        const multiProvider = defineModule({
            id: 'multi-audit-provider',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const report = createComposer().use(singleProvider).use(multiProvider).validate()

        expect(report.diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_CAPABILITY_CARDINALITY_CONFLICT',
                severity: 'error',
                message:
                    'Capability cardinality conflict for token "composer.audit-events": ' +
                    'single sources: provides:single-audit-provider; ' +
                    'multi sources: provides:multi-audit-provider',
                details: {
                    tokenId: 'composer.audit-events',
                    singleSources: ['provides:single-audit-provider'],
                    multiSources: ['provides:multi-audit-provider']
                }
            }
        ])
        expect(
            new CapabilityCardinalityConflictError(
                AUDIT_EVENTS.id,
                ['provides:single-audit-provider'],
                ['provides:multi-audit-provider']
            )
        ).toBeInstanceOf(CapabilityCardinalityConflictError)
    })

    test('reports required port cardinality mismatch against capabilities and bindings', () => {
        const multiProvider = defineModule({
            id: 'required-mismatch-multi-provider',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const singleConsumer = defineModule({
            id: 'required-mismatch-single-consumer',
            requires: [
                {
                    token: AUDIT_EVENTS
                }
            ],
            setup(): void {}
        })
        const singleProvider = defineModule({
            id: 'required-mismatch-single-provider',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const multiConsumer = defineModule({
            id: 'required-mismatch-multi-consumer',
            requires: [
                {
                    token: AUTH_PUBLIC_API,
                    cardinality: 'multi'
                },
                {
                    token: NOTIFICATION_PUBLIC_API,
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const composer = createComposer()
            .use(multiProvider)
            .use(singleConsumer)
            .use(singleProvider)
            .use(multiConsumer)

        composer.bind(NOTIFICATION_PUBLIC_API).toValue({
            notify(): string {
                return 'binding-notification'
            }
        })

        const report = composer.validate()

        expect(report.diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_REQUIRED_PORT_CARDINALITY_MISMATCH',
                severity: 'error',
                message:
                    'Required port "composer.audit-events" for module ' +
                    '"required-mismatch-single-consumer" expects single cardinality but ' +
                    'capability provides multi cardinality',
                details: {
                    moduleId: 'required-mismatch-single-consumer',
                    tokenId: 'composer.audit-events',
                    dependencyKind: 'external',
                    requiredCardinality: 'single',
                    providerCardinality: 'multi',
                    providerSource: 'capability'
                }
            },
            {
                code: 'SAGIFIRE_IOC_REQUIRED_PORT_CARDINALITY_MISMATCH',
                severity: 'error',
                message:
                    'Required port "composer.auth-public-api" for module ' +
                    '"required-mismatch-multi-consumer" expects multi cardinality but ' +
                    'capability provides single cardinality',
                details: {
                    moduleId: 'required-mismatch-multi-consumer',
                    tokenId: 'composer.auth-public-api',
                    dependencyKind: 'external',
                    requiredCardinality: 'multi',
                    providerCardinality: 'single',
                    providerSource: 'capability'
                }
            },
            {
                code: 'SAGIFIRE_IOC_REQUIRED_PORT_CARDINALITY_MISMATCH',
                severity: 'error',
                message:
                    'Required port "composer.notification-public-api" for module ' +
                    '"required-mismatch-multi-consumer" expects multi cardinality but ' +
                    'binding provides single cardinality',
                details: {
                    moduleId: 'required-mismatch-multi-consumer',
                    tokenId: 'composer.notification-public-api',
                    dependencyKind: 'external',
                    requiredCardinality: 'multi',
                    providerCardinality: 'single',
                    providerSource: 'binding'
                }
            }
        ])
        expect(
            new RequiredPortCardinalityMismatchError(
                'required-mismatch-multi-consumer',
                NOTIFICATION_PUBLIC_API.id,
                'external',
                'multi',
                'single',
                'binding'
            )
        ).toBeInstanceOf(RequiredPortCardinalityMismatchError)
    })

    test('validates required and optional multi dependency contributor availability', () => {
        const requiredConsumer = defineModule({
            id: 'required-multi-consumer',
            requires: [
                {
                    token: AUDIT_EVENTS,
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const optionalConsumer = defineModule({
            id: 'optional-multi-consumer',
            requires: [
                {
                    token: AUDIT_EVENTS,
                    required: false,
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })

        expect(createComposer().use(optionalConsumer).validate()).toEqual({
            ok: true,
            diagnostics: []
        })

        const report = createComposer().use(requiredConsumer).validate()

        expect(report.diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_REQUIRED_MULTI_CAPABILITY_MISSING',
                severity: 'error',
                message:
                    'Missing required multi capability "composer.audit-events" for module ' +
                    '"required-multi-consumer": at least one contributor is required',
                details: {
                    moduleId: 'required-multi-consumer',
                    tokenId: 'composer.audit-events',
                    dependencyKind: 'external'
                }
            }
        ])
        expect(
            new RequiredMultiCapabilityMissingError(
                'required-multi-consumer',
                AUDIT_EVENTS.id,
                'external'
            )
        ).toBeInstanceOf(RequiredMultiCapabilityMissingError)
    })

    test('detects simple module cycles with module and token paths', () => {
        const first = defineModule({
            id: 'cycle-a',
            requires: [
                {
                    token: NOTIFICATION_PUBLIC_API
                }
            ],
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const second = defineModule({
            id: 'cycle-b',
            requires: [
                {
                    token: AUTH_PUBLIC_API
                }
            ],
            provides: [
                {
                    token: NOTIFICATION_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const report = createComposer().use(first).use(second).validate()

        expect(report.ok).toBe(false)
        expect(report.diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_MODULE_CYCLE',
                severity: 'error',
                message: 'Module dependency cycle detected: cycle-a -> cycle-b -> cycle-a',
                details: {
                    moduleIdPath: ['cycle-a', 'cycle-b', 'cycle-a'],
                    tokenIdPath: ['composer.notification-public-api', 'composer.auth-public-api'],
                    edgeKinds: ['capability', 'capability']
                }
            }
        ])

        const cycleError = new ModuleCycleError({
            moduleIdPath: ['cycle-a', 'cycle-b', 'cycle-a'],
            tokenIdPath: ['composer.notification-public-api', 'composer.auth-public-api'],
            edgeKinds: ['capability', 'capability']
        })

        expect(cycleError).toBeInstanceOf(ModuleCycleError)
        expect(cycleError.details).toEqual(report.diagnostics[0]?.details)
    })

    test('detects longer module cycles deterministically', () => {
        const first = defineModule({
            id: 'long-cycle-a',
            requires: [
                {
                    token: CONTACT_REQUESTS_PUBLIC_API
                }
            ],
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const second = defineModule({
            id: 'long-cycle-b',
            requires: [
                {
                    token: NOTIFICATION_PUBLIC_API
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
        const third = defineModule({
            id: 'long-cycle-c',
            requires: [
                {
                    token: AUTH_PUBLIC_API
                }
            ],
            provides: [
                {
                    token: NOTIFICATION_PUBLIC_API,
                    kind: 'event-publisher'
                }
            ],
            setup(): void {}
        })
        const report = createComposer().use(first).use(second).use(third).validate()

        expect(report.ok).toBe(false)
        expect(report.diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_MODULE_CYCLE',
                severity: 'error',
                message:
                    'Module dependency cycle detected: ' +
                    'long-cycle-a -> long-cycle-b -> long-cycle-c -> long-cycle-a',
                details: {
                    moduleIdPath: ['long-cycle-a', 'long-cycle-b', 'long-cycle-c', 'long-cycle-a'],
                    tokenIdPath: [
                        'composer.contact-requests-public-api',
                        'composer.notification-public-api',
                        'composer.auth-public-api'
                    ],
                    edgeKinds: ['capability', 'capability', 'capability']
                }
            }
        ])
    })

    test('does not treat binding edges as module cycles', () => {
        const first = defineModule({
            id: 'binding-broken-cycle-a',
            requires: [
                {
                    token: NOTIFICATION_PUBLIC_API
                }
            ],
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const second = defineModule({
            id: 'binding-broken-cycle-b',
            requires: [
                {
                    token: AUTH_PUBLIC_API
                }
            ],
            provides: [
                {
                    token: NOTIFICATION_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const composer = createComposer().use(first).use(second)

        composer.bind(NOTIFICATION_PUBLIC_API).toValue({
            notify(): string {
                return 'binding-break'
            }
        })

        const report = composer.validate()

        expect(report).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(composer.getGraph().edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'binding-broken-cycle-a',
                requiredTokenId: 'composer.notification-public-api',
                dependencyKind: 'external',
                bindingTokenId: 'composer.notification-public-api',
                bindingKind: 'value'
            },
            {
                edgeKind: 'capability',
                consumerModuleId: 'binding-broken-cycle-b',
                requiredTokenId: 'composer.auth-public-api',
                dependencyKind: 'external',
                providerModuleId: 'binding-broken-cycle-a',
                capabilityTokenId: 'composer.auth-public-api',
                capabilityKind: 'public-api'
            }
        ])
    })

    test('preserves composer binding token and factory context inference', () => {
        const composer = createComposer()
        const binding = composer.bind(AUTH_READER)
        const multiBinding = composer.add(AUDIT_EVENTS)

        expectTypeOf(composer).toEqualTypeOf<Composer>()
        expectTypeOf(binding).toEqualTypeOf<ComposerBindingBuilder<AuthReader>>()
        expectTypeOf(multiBinding).toEqualTypeOf<ComposerMultiBindingBuilder<string>>()

        binding.toFactory((context) => {
            expectTypeOf(context).toEqualTypeOf<ComposerBindingContext>()
            expectTypeOf(context.get(AUTH_PUBLIC_API)).toEqualTypeOf<AuthPublicApi>()
            expectTypeOf(context.tryGet(AUTH_PUBLIC_API)).toEqualTypeOf<AuthPublicApi | undefined>()
            expectTypeOf(context.getAll(AUTH_PUBLIC_API)).toEqualTypeOf<AuthPublicApi[]>()
            expectTypeOf(context.getAsync(AUTH_PUBLIC_API)).toEqualTypeOf<Promise<AuthPublicApi>>()
            expectTypeOf(context.tryGetAsync(AUTH_PUBLIC_API)).toEqualTypeOf<
                Promise<AuthPublicApi | undefined>
            >()

            return {
                currentUserId(): string {
                    return 'typed-user'
                }
            }
        })
        composer.bind(AUTH_READER).toAsyncFactory(async (context) => {
            expectTypeOf(context).toEqualTypeOf<ComposerBindingContext>()

            return context.get(AUTH_READER)
        })

        const lifetime = multiBinding.toFactory((context) => {
            expectTypeOf(context).toEqualTypeOf<ComposerBindingContext>()
            expectTypeOf(context.get(AUTH_PUBLIC_API)).toEqualTypeOf<AuthPublicApi>()
            expectTypeOf(context.tryGet(AUTH_PUBLIC_API)).toEqualTypeOf<AuthPublicApi | undefined>()
            expectTypeOf(context.getAll(AUDIT_EVENTS)).toEqualTypeOf<string[]>()

            return 'typed-event'
        })

        expectTypeOf(lifetime).toEqualTypeOf<LifetimeBinding>()
    })
})

describe('module setup and private providers', () => {
    test('prepares modules, registers private providers and keeps public registry safe', async () => {
        let setupCalls = 0
        let contactSetupContext: ModuleSetupContext | undefined
        let observedFactoryState:
            | {
                  readonly userId: string
                  readonly secret: string
                  readonly auditEvents: readonly string[]
              }
            | undefined
        const authModule = defineModule({
            id: 'setup-auth',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                setupCalls += 1
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'auth-user'
                    }
                })
            }
        })
        const contactRequestsModule = defineModule({
            id: 'setup-contact-requests',
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
                setupCalls += 1
                contactSetupContext = context

                context.bind(AUTH_SECRET).toValue({
                    secret: 'module-secret'
                })
                context.add(AUDIT_EVENTS).toValue('setup-event')
                context
                    .add(AUDIT_EVENTS)
                    .toFactory(() => {
                        return 'factory-event'
                    })
                    .singleton()
                context
                    .bind(CONTACT_REQUESTS_PUBLIC_API)
                    .toAsyncFactory(async (providerContext) => {
                        const auth = providerContext.get(AUTH_PUBLIC_API)
                        const secret = providerContext.get(AUTH_SECRET)
                        const auditEvents = providerContext.getAll(AUDIT_EVENTS)

                        observedFactoryState = {
                            userId: auth.requireUser(),
                            secret: secret.secret,
                            auditEvents
                        }

                        return {
                            submit(): string {
                                return `${auth.requireUser()}:${secret.secret}`
                            }
                        }
                    })
                    .singleton()
                    .eager()
            }
        })
        const prepared = await createComposer().use(authModule).use(contactRequestsModule).prepare()

        expect(setupCalls).toBe(2)
        expect(prepared).toEqual({
            modules: [
                {
                    id: 'setup-auth'
                },
                {
                    id: 'setup-contact-requests'
                }
            ],
            capabilities: [
                {
                    source: 'module',
                    moduleId: 'setup-auth',
                    tokenId: 'composer.auth-public-api',
                    kind: 'public-api',
                    registrationKind: 'single'
                },
                {
                    source: 'module',
                    moduleId: 'setup-contact-requests',
                    tokenId: 'composer.contact-requests-public-api',
                    kind: 'public-api',
                    registrationKind: 'single'
                }
            ]
        })
        expect(observedFactoryState).toEqual({
            userId: 'auth-user',
            secret: 'module-secret',
            auditEvents: ['setup-event', 'factory-event']
        })
        expect(contactSetupContext?.get(AUTH_SECRET)).toEqual({
            secret: 'module-secret'
        })
        expect(contactSetupContext?.get(AUTH_PUBLIC_API).requireUser()).toBe('auth-user')
        expect(contactSetupContext?.getAll(AUDIT_EVENTS)).toEqual(['setup-event', 'factory-event'])
        expect(JSON.stringify(prepared)).not.toContain('composer.auth-secret')
        expect(JSON.stringify(prepared)).not.toContain('composer.audit-events')
    })

    test('keeps private providers isolated even when token ids match across modules', async () => {
        let firstSecret: string | undefined
        let secondSecret: string | undefined
        const firstModule = defineModule({
            id: 'same-private-token-first',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_SECRET).toValue({
                    secret: 'first'
                })
                context
                    .bind(AUTH_PUBLIC_API)
                    .toAsyncFactory(async (providerContext) => {
                        firstSecret = providerContext.get(AUTH_SECRET).secret

                        return {
                            requireUser(): string {
                                return 'first-user'
                            }
                        }
                    })
                    .singleton()
                    .eager()
            }
        })
        const secondModule = defineModule({
            id: 'same-private-token-second',
            provides: [
                {
                    token: NOTIFICATION_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_SECRET).toValue({
                    secret: 'second'
                })
                context
                    .bind(NOTIFICATION_PUBLIC_API)
                    .toAsyncFactory(async (providerContext) => {
                        secondSecret = providerContext.get(AUTH_SECRET).secret

                        return {
                            notify(): string {
                                return 'notified'
                            }
                        }
                    })
                    .singleton()
                    .eager()
            }
        })

        await createComposer().use(firstModule).use(secondModule).prepare()

        expect(firstSecret).toBe('first')
        expect(secondSecret).toBe('second')
    })

    test('rejects access to another module private provider through provider context', async () => {
        const privateOwner = defineModule({
            id: 'private-owner',
            setup(context): void {
                context.bind(AUTH_SECRET).toValue({
                    secret: 'hidden'
                })
            }
        })
        const foreignReader = defineModule({
            id: 'foreign-private-reader',
            provides: [
                {
                    token: NOTIFICATION_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context
                    .bind(NOTIFICATION_PUBLIC_API)
                    .toAsyncFactory(async (providerContext) => {
                        providerContext.get(AUTH_SECRET)

                        return {
                            notify(): string {
                                return 'unreachable'
                            }
                        }
                    })
                    .singleton()
                    .eager()
            }
        })

        await expect(
            createComposer().use(privateOwner).use(foreignReader).prepare()
        ).rejects.toBeInstanceOf(PrivateProviderAccessError)

        try {
            await createComposer().use(privateOwner).use(foreignReader).prepare()
        } catch (error) {
            expect(error).toBeInstanceOf(PrivateProviderAccessError)

            if (error instanceof PrivateProviderAccessError) {
                expect(error.code).toBe('SAGIFIRE_IOC_PRIVATE_PROVIDER_ACCESS')
                expect(error.details).toEqual({
                    moduleId: 'foreign-private-reader',
                    tokenId: 'composer.auth-secret',
                    requester: 'module',
                    reason: 'token-not-visible'
                })
            }
        }
    })

    test('validates declared capabilities are registered by module setup', async () => {
        const module = defineModule({
            id: 'missing-actual-provider',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })

        await expect(createComposer().use(module).prepare()).rejects.toBeInstanceOf(
            ComposerValidationError
        )

        try {
            await createComposer().use(module).prepare()
        } catch (error) {
            expect(error).toBeInstanceOf(ComposerValidationError)

            if (error instanceof ComposerValidationError) {
                expect(error.report.diagnostics).toEqual([
                    {
                        code: 'SAGIFIRE_IOC_MISSING_MODULE_PROVIDER',
                        severity: 'error',
                        message:
                            'Module "missing-actual-provider" declares provided capability ' +
                            '"composer.auth-public-api" but did not register a provider for it ' +
                            'during setup',
                        details: {
                            moduleId: 'missing-actual-provider',
                            tokenId: 'composer.auth-public-api'
                        }
                    }
                ])
                expect(
                    new MissingModuleProviderError('missing-actual-provider', AUTH_PUBLIC_API.id)
                ).toBeInstanceOf(MissingModuleProviderError)
            }
        }
    })

    test('rejects declared multi capabilities registered with bind after setup', async () => {
        let factoryCalls = 0
        const module = defineModule({
            id: 'multi-registered-with-bind',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.bind(AUDIT_EVENTS).toFactory(() => {
                    factoryCalls += 1

                    return 'wrong-registration'
                })
            }
        })

        await expect(createComposer().use(module).prepare()).rejects.toBeInstanceOf(
            ComposerValidationError
        )

        try {
            await createComposer().use(module).prepare()
        } catch (error) {
            expect(error).toBeInstanceOf(ComposerValidationError)

            if (error instanceof ComposerValidationError) {
                expect(error.report.diagnostics).toEqual([
                    {
                        code: 'SAGIFIRE_IOC_CAPABILITY_REGISTRATION_CARDINALITY_MISMATCH',
                        severity: 'error',
                        message:
                            'Module "multi-registered-with-bind" declares capability ' +
                            '"composer.audit-events" as multi but registered it with single ' +
                            'provider API',
                        details: {
                            moduleId: 'multi-registered-with-bind',
                            tokenId: 'composer.audit-events',
                            declaredCardinality: 'multi',
                            registrationKind: 'single'
                        }
                    }
                ])
            }
        }

        expect(factoryCalls).toBe(0)
        expect(
            new CapabilityRegistrationCardinalityMismatchError(
                'multi-registered-with-bind',
                AUDIT_EVENTS.id,
                'multi',
                'single'
            )
        ).toBeInstanceOf(CapabilityRegistrationCardinalityMismatchError)
    })

    test('rejects declared single capabilities registered with add after setup', async () => {
        const module = defineModule({
            id: 'single-registered-with-add',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('wrong-registration')
            }
        })

        await expect(createComposer().use(module).prepare()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_COMPOSER_VALIDATION_FAILED',
            report: {
                diagnostics: [
                    {
                        code: 'SAGIFIRE_IOC_CAPABILITY_REGISTRATION_CARDINALITY_MISMATCH',
                        details: {
                            moduleId: 'single-registered-with-add',
                            tokenId: 'composer.audit-events',
                            declaredCardinality: 'single',
                            registrationKind: 'multi'
                        }
                    }
                ]
            }
        })
    })

    test('prepares compatible multi capability contributors in module registration order', async () => {
        const first = defineModule({
            id: 'prepare-first-audit-contributor',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('first')
            }
        })
        const second = defineModule({
            id: 'prepare-second-audit-contributor',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('second')
            }
        })
        const runtime = await createComposer().use(first).use(second).compose()

        expect(runtime.getAll(AUDIT_EVENTS)).toEqual(['first', 'second'])
        expect(runtime.inspect().providerRegistrations).toEqual([
            {
                source: 'module',
                moduleId: 'prepare-first-audit-contributor',
                tokenId: 'composer.audit-events',
                capabilityKind: 'event-subscriber',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'value',
                        registrationIndex: 0,
                        lifetime: 'singleton'
                    }
                ]
            },
            {
                source: 'module',
                moduleId: 'prepare-second-audit-contributor',
                tokenId: 'composer.audit-events',
                capabilityKind: 'event-subscriber',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'value',
                        registrationIndex: 1,
                        lifetime: 'singleton'
                    }
                ]
            }
        ])

        await runtime.dispose()
    })

    test('rejects setup-time resolution before composition is prepared', async () => {
        const module = defineModule({
            id: 'early-resolution',
            setup(context): void {
                context.get(AUTH_SECRET)
            }
        })

        await expect(createComposer().use(module).prepare()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_PRIVATE_PROVIDER_ACCESS',
            details: {
                moduleId: 'early-resolution',
                tokenId: 'composer.auth-secret',
                requester: 'module',
                reason: 'composition-not-ready'
            }
        })
    })

    test('preserves module setup context binding and resolution inference', async () => {
        const module = defineModule({
            id: 'typed-setup-context',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                expectTypeOf(context).toEqualTypeOf<ModuleSetupContext>()
                expectTypeOf(context.bind(AUTH_PUBLIC_API)).toMatchTypeOf<
                    BindingBuilder<AuthPublicApi>
                >()
                expectTypeOf(context.add(AUDIT_EVENTS)).toMatchTypeOf<MultiBindingBuilder<string>>()
                expectTypeOf(context.get<AuthPublicApi>).returns.toEqualTypeOf<AuthPublicApi>()
                expectTypeOf(context.tryGet<AuthPublicApi>).returns.toEqualTypeOf<
                    AuthPublicApi | undefined
                >()
                expectTypeOf(context.getAll<string>).returns.toEqualTypeOf<string[]>()
                expectTypeOf(context.getAsync<AuthPublicApi>).returns.toEqualTypeOf<
                    Promise<AuthPublicApi>
                >()
                expectTypeOf(context.tryGetAsync<AuthPublicApi>).returns.toEqualTypeOf<
                    Promise<AuthPublicApi | undefined>
                >()

                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'typed-user'
                    }
                })
            }
        })

        const preparedComposition: PreparedComposition = await createComposer()
            .use(module)
            .prepare()

        expect(preparedComposition.capabilities[0]?.tokenId).toBe('composer.auth-public-api')
    })

    test('exposes composer runtime, inspection and cycle diagnostics API without DSL APIs', async () => {
        const module = await import('../src/composer.js')
        const composer = createComposer()

        expect(module.defineModule).toBeTypeOf('function')
        expect(module.createComposer).toBeTypeOf('function')
        expect(module.PrivateProviderAccessError).toBeTypeOf('function')
        expect(module.MissingModuleProviderError).toBeTypeOf('function')
        expect(module.ModuleCycleError).toBeTypeOf('function')
        expect(composer.validate).toBeTypeOf('function')
        expect(composer.inspect).toBeTypeOf('function')
        expect(composer.getGraph).toBeTypeOf('function')
        expect(composer.prepare).toBeTypeOf('function')
        expect(composer.compose).toBeTypeOf('function')
        expect('detectCycles' in composer).toBe(false)
        expect('assertGraph' in module).toBe(false)
        expect('module' in module).toBe(false)
        expect('defineApp' in module).toBe(false)
        expect('adapt' in module).toBe(false)
        expect(new ComposerValidationError(composer.validate())).toBeInstanceOf(
            ComposerValidationError
        )
    })
})

describe('composition-root multi contributions', () => {
    test('adds root multi contributions after module setup contributions', async () => {
        let rootFactoryCalls = 0
        const firstAuditModule = defineModule({
            id: 'root-add-first-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('module-first')
            }
        })
        const secondAuditModule = defineModule({
            id: 'root-add-second-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('module-second')
            }
        })
        const consumerModule = defineModule({
            id: 'root-add-audit-consumer',
            requires: [
                {
                    token: AUDIT_EVENTS,
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const composer = createComposer()
            .use(firstAuditModule)
            .use(secondAuditModule)
            .use(consumerModule)

        composer.add(AUDIT_EVENTS).toValue('root-first')
        composer
            .add(AUDIT_EVENTS)
            .toFactory(() => {
                rootFactoryCalls += 1

                return 'root-second'
            })
            .singleton()

        const expectedGraphProviders = [
            {
                source: 'module',
                moduleId: 'root-add-first-audit',
                registrationKind: 'add',
                registrationIndex: 0
            },
            {
                source: 'module',
                moduleId: 'root-add-second-audit',
                registrationKind: 'add',
                registrationIndex: 1
            },
            {
                source: 'composition-root',
                registrationKind: 'add',
                registrationIndex: 2
            },
            {
                source: 'composition-root',
                registrationKind: 'add',
                registrationIndex: 3
            }
        ]
        const graph = composer.getGraph()
        const validation = composer.validate()

        expect(rootFactoryCalls).toBe(0)
        expect(validation).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(graph.capabilities).toEqual([
            {
                moduleId: 'root-add-first-audit',
                tokenId: 'composer.audit-events',
                kind: 'event-subscriber',
                cardinality: 'multi',
                providers: expectedGraphProviders
            },
            {
                moduleId: 'root-add-second-audit',
                tokenId: 'composer.audit-events',
                kind: 'event-subscriber',
                cardinality: 'multi',
                providers: expectedGraphProviders
            }
        ])
        expect(graph.requiredPorts).toEqual([
            {
                moduleId: 'root-add-audit-consumer',
                tokenId: 'composer.audit-events',
                required: true,
                kind: 'external',
                cardinality: 'multi',
                providerCount: 4,
                satisfiedBy: 'capability'
            }
        ])

        const runtime = await composer.compose()
        const inspection = runtime.inspect()

        expect(rootFactoryCalls).toBe(0)
        expect(inspection.providerRegistrations).toEqual([
            {
                source: 'module',
                moduleId: 'root-add-first-audit',
                tokenId: 'composer.audit-events',
                capabilityKind: 'event-subscriber',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'value',
                        registrationIndex: 0,
                        lifetime: 'singleton'
                    }
                ]
            },
            {
                source: 'module',
                moduleId: 'root-add-second-audit',
                tokenId: 'composer.audit-events',
                capabilityKind: 'event-subscriber',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'value',
                        registrationIndex: 1,
                        lifetime: 'singleton'
                    }
                ]
            },
            {
                source: 'composition-root',
                tokenId: 'composer.audit-events',
                capabilityKind: 'event-subscriber',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'value',
                        registrationIndex: 2,
                        lifetime: 'singleton'
                    },
                    {
                        providerKind: 'factory',
                        registrationIndex: 3,
                        lifetime: 'singleton'
                    }
                ]
            }
        ])
        expect(() => runtime.get(AUDIT_EVENTS)).toThrow(GetUsedForMultiTokenError)
        expect(runtime.getAll(AUDIT_EVENTS)).toEqual([
            'module-first',
            'module-second',
            'root-first',
            'root-second'
        ])
        expect(rootFactoryCalls).toBe(1)

        await runtime.dispose()
    })

    test('reports typed diagnostics for invalid root multi contribution targets', async () => {
        let privateOwnerSetupCalls = 0
        const singleCapabilityModule = defineModule({
            id: 'root-add-single-capability',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'single-user'
                    }
                })
            }
        })
        const requiredOnlyModule = defineModule({
            id: 'root-add-required-only',
            requires: [
                {
                    token: AUTH_READER,
                    required: false
                }
            ],
            setup(): void {}
        })
        const privateOwnerModule = defineModule({
            id: 'root-add-private-owner',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                privateOwnerSetupCalls += 1
                context.add(AUTH_SECRET).toValue({
                    secret: 'private'
                })
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'private-owner'
                    }
                })
            }
        })
        const singleCapabilityComposer = createComposer().use(singleCapabilityModule)
        const requiredOnlyComposer = createComposer().use(requiredOnlyModule)
        const undeclaredComposer = createComposer()
        const privateTokenComposer = createComposer().use(privateOwnerModule)

        singleCapabilityComposer.add(AUTH_PUBLIC_API).toValue({
            requireUser(): string {
                return 'root'
            }
        })
        requiredOnlyComposer.add(AUTH_READER).toValue({
            currentUserId(): string {
                return 'root'
            }
        })
        undeclaredComposer.add(OPTIONAL_AUTH_READER).toValue({
            currentUserId(): string {
                return 'root'
            }
        })
        privateTokenComposer.add(AUTH_SECRET).toValue({
            secret: 'root'
        })

        expect(singleCapabilityComposer.validate().diagnostics).toContainEqual({
            code: 'SAGIFIRE_IOC_INVALID_COMPOSER_MULTI_BINDING',
            severity: 'error',
            message:
                'Invalid composer multi binding for token "composer.auth-public-api": ' +
                'target is declared as a single public capability',
            details: {
                tokenId: 'composer.auth-public-api',
                bindingKind: 'value',
                reason: 'single-capability'
            }
        })
        expect(requiredOnlyComposer.validate().diagnostics).toContainEqual({
            code: 'SAGIFIRE_IOC_INVALID_COMPOSER_MULTI_BINDING',
            severity: 'error',
            message:
                'Invalid composer multi binding for token "composer.auth-reader": ' +
                'target is declared only as a required port',
            details: {
                tokenId: 'composer.auth-reader',
                bindingKind: 'value',
                reason: 'required-port-only'
            }
        })
        expect(undeclaredComposer.validate().diagnostics).toContainEqual({
            code: 'SAGIFIRE_IOC_INVALID_COMPOSER_MULTI_BINDING',
            severity: 'error',
            message:
                'Invalid composer multi binding for token "composer.optional-auth-reader": ' +
                'target is not a declared public multi capability',
            details: {
                tokenId: 'composer.optional-auth-reader',
                bindingKind: 'value',
                reason: 'missing-public-multi-capability'
            }
        })
        await expect(privateTokenComposer.compose()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_COMPOSER_VALIDATION_FAILED',
            report: {
                diagnostics: [
                    {
                        code: 'SAGIFIRE_IOC_INVALID_COMPOSER_MULTI_BINDING',
                        details: {
                            tokenId: 'composer.auth-secret',
                            bindingKind: 'value',
                            reason: 'missing-public-multi-capability'
                        }
                    }
                ]
            }
        })
        expect(privateOwnerSetupCalls).toBe(0)
        expect(
            new InvalidComposerMultiBindingError(AUTH_PUBLIC_API.id, 'value', 'single-capability')
        ).toBeInstanceOf(InvalidComposerMultiBindingError)
    })

    test('reports typed diagnostics when root bind and add target the same token', () => {
        const providerModule = defineModule({
            id: 'root-add-conflict-provider',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('module')
            }
        })
        const consumerModule = defineModule({
            id: 'root-add-conflict-consumer',
            requires: [
                {
                    token: AUDIT_EVENTS,
                    required: false
                }
            ],
            setup(): void {}
        })
        const composer = createComposer().use(providerModule).use(consumerModule)

        composer.bind(AUDIT_EVENTS).toValue('single-root')
        composer.add(AUDIT_EVENTS).toValue('multi-root')

        expect(composer.validate().diagnostics).toContainEqual({
            code: 'SAGIFIRE_IOC_COMPOSER_BINDING_CARDINALITY_CONFLICT',
            severity: 'error',
            message:
                'Composer binding cardinality conflict for token "composer.audit-events": ' +
                'bind() and add() cannot target the same token',
            details: {
                tokenId: 'composer.audit-events',
                bindingKinds: ['value'],
                multiBindingKinds: ['value']
            }
        })
        expect(
            new ComposerBindingCardinalityConflictError(AUDIT_EVENTS.id, ['value'], ['value'])
        ).toBeInstanceOf(ComposerBindingCardinalityConflictError)
    })
})

describe('inspection api', () => {
    test('inspects composer graph metadata deterministically without exposing provider values', () => {
        const authModule = defineModule({
            id: 'inspect-auth',
            version: '1.0.0',
            metadata: {
                secret: 'metadata-secret'
            },
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api',
                    description: 'Authentication public API'
                }
            ],
            setup(): void {}
        })
        const contactRequestsModule = defineModule({
            id: 'inspect-contact-requests',
            metadata: 'contact-metadata',
            requires: [
                {
                    token: AUTH_READER,
                    description: 'Consumer-owned auth reader'
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
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const composer = createComposer().use(authModule).use(contactRequestsModule)

        composer.bind(AUTH_READER).toValue({
            currentUserId(): string {
                return 'binding-secret-user'
            }
        })

        const graph = composer.getGraph()
        const inspection = composer.inspect()

        expect(inspection.graph).toEqual(graph)
        expect(inspection.modules).toEqual([
            {
                id: 'inspect-auth',
                version: '1.0.0',
                metadata: {
                    valueType: 'object'
                },
                requiredPortIds: [],
                capabilityIds: ['composer.auth-public-api']
            },
            {
                id: 'inspect-contact-requests',
                metadata: {
                    valueType: 'string',
                    value: 'contact-metadata'
                },
                requiredPortIds: ['composer.auth-reader', 'composer.optional-auth-reader'],
                capabilityIds: ['composer.contact-requests-public-api']
            }
        ])
        expect(inspection.requiredPorts).toEqual([
            {
                moduleId: 'inspect-contact-requests',
                tokenId: 'composer.auth-reader',
                required: true,
                kind: 'external',
                cardinality: 'single',
                providerCount: 1,
                description: 'Consumer-owned auth reader',
                satisfiedBy: 'binding'
            },
            {
                moduleId: 'inspect-contact-requests',
                tokenId: 'composer.optional-auth-reader',
                required: false,
                kind: 'shared',
                cardinality: 'single',
                providerCount: 0,
                satisfiedBy: 'optional'
            }
        ])
        expect(inspection.capabilities).toEqual([
            {
                moduleId: 'inspect-auth',
                tokenId: 'composer.auth-public-api',
                kind: 'public-api',
                cardinality: 'single',
                providers: [
                    {
                        source: 'module',
                        moduleId: 'inspect-auth',
                        registrationKind: 'bind',
                        registrationIndex: 0
                    }
                ],
                description: 'Authentication public API'
            },
            {
                moduleId: 'inspect-contact-requests',
                tokenId: 'composer.contact-requests-public-api',
                kind: 'public-api',
                cardinality: 'single',
                providers: [
                    {
                        source: 'module',
                        moduleId: 'inspect-contact-requests',
                        registrationKind: 'bind',
                        registrationIndex: 0
                    }
                ]
            }
        ])
        expect(inspection.bindings).toEqual([
            {
                tokenId: 'composer.auth-reader',
                kind: 'value',
                providerKind: 'value',
                lifetime: 'singleton'
            }
        ])
        expect(inspection.edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'inspect-contact-requests',
                requiredTokenId: 'composer.auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'composer.auth-reader',
                bindingKind: 'value'
            }
        ])
        expect(inspection.validation).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(composer.inspect()).toEqual(inspection)
        expect(composer.getGraph()).toEqual(graph)
        expect(Object.isFrozen(inspection)).toBe(true)
        expect(Object.isFrozen(inspection.modules)).toBe(true)
        expect(Object.isFrozen(inspection.requiredPorts)).toBe(true)
        expect(Object.isFrozen(inspection.edges)).toBe(true)

        const renderedInspection = JSON.stringify(inspection)

        expect(renderedInspection).not.toContain('binding-secret-user')
        expect(renderedInspection).not.toContain('metadata-secret')
        expect('edges' in graph).toBe(true)
        expect('cycles' in graph).toBe(false)

        const invalidInspection = createComposer()
            .use(
                defineModule({
                    id: 'inspect-missing-required-port',
                    requires: [
                        {
                            token: AUTH_READER
                        }
                    ],
                    setup(): void {}
                })
            )
            .inspect()

        expect(invalidInspection.validation.ok).toBe(false)
        expect(invalidInspection.requiredPorts[0]?.satisfiedBy).toBe('missing')
    })

    test('inspects multi-capability declaration providers and multi required ports', () => {
        const optionalAuditEvents = token<string>('composer.optional-audit-events')
        const firstAuditModule = defineModule({
            id: 'inspect-multi-first-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const secondAuditModule = defineModule({
            id: 'inspect-multi-second-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const requiredConsumerModule = defineModule({
            id: 'inspect-multi-required-consumer',
            requires: [
                {
                    token: AUDIT_EVENTS,
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const optionalConsumerModule = defineModule({
            id: 'inspect-multi-optional-consumer',
            requires: [
                {
                    token: optionalAuditEvents,
                    required: false,
                    cardinality: 'multi'
                }
            ],
            setup(): void {}
        })
        const composer = createComposer()
            .use(firstAuditModule)
            .use(secondAuditModule)
            .use(requiredConsumerModule)
            .use(optionalConsumerModule)
        const graph = composer.getGraph()
        const inspection = composer.inspect()
        const expectedProviders = [
            {
                source: 'module',
                moduleId: 'inspect-multi-first-audit',
                registrationKind: 'add',
                registrationIndex: 0
            },
            {
                source: 'module',
                moduleId: 'inspect-multi-second-audit',
                registrationKind: 'add',
                registrationIndex: 1
            }
        ]

        expect(inspection.graph).toEqual(graph)
        expect(graph.capabilities).toEqual([
            {
                moduleId: 'inspect-multi-first-audit',
                tokenId: 'composer.audit-events',
                kind: 'event-subscriber',
                cardinality: 'multi',
                providers: expectedProviders
            },
            {
                moduleId: 'inspect-multi-second-audit',
                tokenId: 'composer.audit-events',
                kind: 'event-subscriber',
                cardinality: 'multi',
                providers: expectedProviders
            }
        ])
        expect(graph.requiredPorts).toEqual([
            {
                moduleId: 'inspect-multi-required-consumer',
                tokenId: 'composer.audit-events',
                required: true,
                kind: 'external',
                cardinality: 'multi',
                providerCount: 2,
                satisfiedBy: 'capability'
            },
            {
                moduleId: 'inspect-multi-optional-consumer',
                tokenId: 'composer.optional-audit-events',
                required: false,
                kind: 'external',
                cardinality: 'multi',
                providerCount: 0,
                satisfiedBy: 'optional'
            }
        ])
        expect(Object.isFrozen(graph.capabilities[0]?.providers)).toBe(true)
    })

    test('records deterministic capability and binding dependency edges without executing factories', () => {
        let setupCalls = 0
        let bindingFactoryCalls = 0
        const authModule = defineModule({
            id: 'edge-auth',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {
                setupCalls += 1
            }
        })
        const contactRequestsModule = defineModule({
            id: 'edge-contact-requests',
            requires: [
                {
                    token: AUTH_PUBLIC_API
                },
                {
                    token: OPTIONAL_AUTH_READER,
                    required: false
                }
            ],
            setup(): void {}
        })
        const notificationModule = defineModule({
            id: 'edge-notifications',
            requires: [
                {
                    token: AUTH_READER,
                    kind: 'shared'
                }
            ],
            setup(): void {}
        })
        const composer = createComposer()
            .use(authModule)
            .use(contactRequestsModule)
            .use(notificationModule)

        composer.bind(AUTH_READER).toFactory(() => {
            bindingFactoryCalls += 1

            return {
                currentUserId(): string {
                    return 'edge-secret-user'
                }
            }
        })

        const graph = composer.getGraph()
        const inspection = composer.inspect()

        expect(graph.edges).toEqual([
            {
                edgeKind: 'capability',
                consumerModuleId: 'edge-contact-requests',
                requiredTokenId: 'composer.auth-public-api',
                dependencyKind: 'external',
                providerModuleId: 'edge-auth',
                capabilityTokenId: 'composer.auth-public-api',
                capabilityKind: 'public-api'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'edge-notifications',
                requiredTokenId: 'composer.auth-reader',
                dependencyKind: 'shared',
                bindingTokenId: 'composer.auth-reader',
                bindingKind: 'factory'
            }
        ])
        expect(inspection.edges).toEqual(graph.edges)
        expect(inspection.requiredPorts).toEqual([
            {
                moduleId: 'edge-contact-requests',
                tokenId: 'composer.auth-public-api',
                required: true,
                kind: 'external',
                cardinality: 'single',
                providerCount: 1,
                satisfiedBy: 'capability'
            },
            {
                moduleId: 'edge-contact-requests',
                tokenId: 'composer.optional-auth-reader',
                required: false,
                kind: 'external',
                cardinality: 'single',
                providerCount: 0,
                satisfiedBy: 'optional'
            },
            {
                moduleId: 'edge-notifications',
                tokenId: 'composer.auth-reader',
                required: true,
                kind: 'shared',
                cardinality: 'single',
                providerCount: 1,
                satisfiedBy: 'binding'
            }
        ])
        expect(setupCalls).toBe(0)
        expect(bindingFactoryCalls).toBe(0)
        expect(JSON.stringify(graph)).not.toContain('edge-secret-user')
    })

    test('records binding edges instead of capability edges when a binding satisfies a port', () => {
        const authReaderProviderModule = defineModule({
            id: 'edge-auth-reader-provider',
            provides: [
                {
                    token: AUTH_READER,
                    kind: 'shared-service'
                }
            ],
            setup(): void {}
        })
        const consumerModule = defineModule({
            id: 'edge-auth-reader-consumer',
            requires: [
                {
                    token: AUTH_READER
                }
            ],
            setup(): void {}
        })
        const composer = createComposer().use(authReaderProviderModule).use(consumerModule)

        composer.bind(AUTH_READER).toValue({
            currentUserId(): string {
                return 'binding-priority-user'
            }
        })

        const graph = composer.getGraph()

        expect(graph.requiredPorts[0]?.satisfiedBy).toBe('binding')
        expect(graph.edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'edge-auth-reader-consumer',
                requiredTokenId: 'composer.auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'composer.auth-reader',
                bindingKind: 'value'
            }
        ])
        expect(graph.edges.some((edge) => edge.edgeKind === 'capability')).toBe(false)
        expect(JSON.stringify(graph)).not.toContain('binding-priority-user')
    })

    test('inspects composed runtime exported provider registrations without private internals', async () => {
        const authModule = defineModule({
            id: 'inspect-runtime-auth',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context
                    .bind(AUTH_PUBLIC_API)
                    .toFactory(() => {
                        return {
                            requireUser(): string {
                                return 'runtime-secret-user'
                            }
                        }
                    })
                    .singleton()
            }
        })
        const contactRequestsModule = defineModule({
            id: 'inspect-runtime-contact-requests',
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
                context.bind(AUTH_SECRET).toValue({
                    secret: 'runtime-private-secret'
                })
                context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((providerContext) => {
                    const authReader = providerContext.get(AUTH_READER)
                    const secret = providerContext.get(AUTH_SECRET)

                    return {
                        submit(): string {
                            return `${authReader.currentUserId()}:${secret.secret}`
                        }
                    }
                })
            }
        })
        const auditModule = defineModule({
            id: 'inspect-runtime-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('created')
                context
                    .add(AUDIT_EVENTS)
                    .toFactory(() => {
                        return 'submitted'
                    })
                    .singleton()
            }
        })
        const resourceModule = defineModule({
            id: 'inspect-runtime-resource',
            provides: [
                {
                    token: RESOURCE_PUBLIC_API,
                    kind: 'shared-service'
                }
            ],
            setup(context): void {
                context
                    .bind(RESOURCE_PUBLIC_API)
                    .toAsyncResource(async () => {
                        return {
                            value: {
                                status(): string {
                                    return 'open'
                                }
                            }
                        }
                    })
                    .singleton()
                    .eager()
            }
        })
        const composer = createComposer()
            .use(authModule)
            .use(contactRequestsModule)
            .use(auditModule)
            .use(resourceModule)

        composer.bind(AUTH_READER).toFactory((context) => {
            const auth = context.get(AUTH_PUBLIC_API)

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })

        const runtime = await composer.compose()
        const inspection = runtime.inspect()

        expect(runtime.inspect()).toBe(inspection)
        expect(runtime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe(
            'runtime-secret-user:runtime-private-secret'
        )
        expect(inspection.validation).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(inspection.bindings).toEqual([
            {
                tokenId: 'composer.auth-reader',
                kind: 'factory',
                providerKind: 'factory',
                lifetime: 'transient'
            }
        ])
        expect(inspection.requiredPorts).toEqual([
            {
                moduleId: 'inspect-runtime-contact-requests',
                tokenId: 'composer.auth-reader',
                required: true,
                kind: 'external',
                cardinality: 'single',
                providerCount: 1,
                satisfiedBy: 'binding'
            }
        ])
        expect(inspection.edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'inspect-runtime-contact-requests',
                requiredTokenId: 'composer.auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'composer.auth-reader',
                bindingKind: 'factory'
            }
        ])
        expect(inspection.providerRegistrations).toEqual([
            {
                source: 'module',
                moduleId: 'inspect-runtime-auth',
                tokenId: 'composer.auth-public-api',
                capabilityKind: 'public-api',
                cardinality: 'single',
                visibility: 'exported',
                registrationKind: 'single',
                providers: [
                    {
                        providerKind: 'factory',
                        registrationIndex: 0,
                        lifetime: 'singleton'
                    }
                ]
            },
            {
                source: 'module',
                moduleId: 'inspect-runtime-contact-requests',
                tokenId: 'composer.contact-requests-public-api',
                capabilityKind: 'public-api',
                cardinality: 'single',
                visibility: 'exported',
                registrationKind: 'single',
                providers: [
                    {
                        providerKind: 'factory',
                        registrationIndex: 0,
                        lifetime: 'transient'
                    }
                ]
            },
            {
                source: 'module',
                moduleId: 'inspect-runtime-audit',
                tokenId: 'composer.audit-events',
                capabilityKind: 'event-subscriber',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'value',
                        registrationIndex: 0,
                        lifetime: 'singleton'
                    },
                    {
                        providerKind: 'factory',
                        registrationIndex: 1,
                        lifetime: 'singleton'
                    }
                ]
            },
            {
                source: 'module',
                moduleId: 'inspect-runtime-resource',
                tokenId: 'composer.resource-public-api',
                capabilityKind: 'shared-service',
                cardinality: 'single',
                visibility: 'exported',
                registrationKind: 'single',
                providers: [
                    {
                        providerKind: 'async-resource',
                        registrationIndex: 0,
                        lifetime: 'singleton',
                        initialization: 'eager'
                    }
                ]
            }
        ])
        expect(Object.isFrozen(inspection)).toBe(true)
        expect(Object.isFrozen(inspection.providerRegistrations)).toBe(true)
        expect(Object.isFrozen(inspection.providerRegistrations[0]?.providers)).toBe(true)

        const renderedInspection = JSON.stringify(inspection)

        expect(renderedInspection).not.toContain('runtime-private-secret')
        expect(renderedInspection).not.toContain('composer.auth-secret')
        expect(renderedInspection).not.toContain('sagifire/ioc/private')
        expect('edges' in inspection.graph).toBe(true)
        expect('cycles' in inspection.graph).toBe(false)

        await runtime.dispose()
    })

    test('orders runtime multi provider inspection to match getAll resolution order', async () => {
        const firstAuditModule = defineModule({
            id: 'inspect-runtime-order-first-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('first-a')
                context.add(AUDIT_EVENTS).toFactory(() => {
                    return 'first-b'
                })
            }
        })
        const secondAuditModule = defineModule({
            id: 'inspect-runtime-order-second-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('second-a')
            }
        })
        const runtime = await createComposer()
            .use(firstAuditModule)
            .use(secondAuditModule)
            .compose()
        const inspection = runtime.inspect()

        expect(runtime.getAll(AUDIT_EVENTS)).toEqual(['first-a', 'first-b', 'second-a'])
        expect(
            inspection.providerRegistrations.map((registration) => {
                return {
                    moduleId: registration.moduleId,
                    registrationIndexes: registration.providers.map((provider) => {
                        return provider.registrationIndex
                    })
                }
            })
        ).toEqual([
            {
                moduleId: 'inspect-runtime-order-first-audit',
                registrationIndexes: [0, 1]
            },
            {
                moduleId: 'inspect-runtime-order-second-audit',
                registrationIndexes: [2]
            }
        ])

        await runtime.dispose()
    })

    test('matches runtime inspection graph edges with composer graph for acyclic runtime', async () => {
        const authModule = defineModule({
            id: 'inspect-runtime-edge-auth',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'edge-runtime-user'
                    }
                })
            }
        })
        const contactRequestsModule = defineModule({
            id: 'inspect-runtime-edge-contact-requests',
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
                context.bind(CONTACT_REQUESTS_PUBLIC_API).toValue({
                    submit(): string {
                        return 'edge-contact-request'
                    }
                })
            }
        })
        const notificationModule = defineModule({
            id: 'inspect-runtime-edge-notifications',
            requires: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'shared'
                }
            ],
            provides: [
                {
                    token: NOTIFICATION_PUBLIC_API,
                    kind: 'event-publisher'
                }
            ],
            setup(context): void {
                context.bind(NOTIFICATION_PUBLIC_API).toValue({
                    notify(): string {
                        return 'edge-notification'
                    }
                })
            }
        })
        const composer = createComposer()
            .use(authModule)
            .use(contactRequestsModule)
            .use(notificationModule)

        composer.bind(AUTH_READER).toValue({
            currentUserId(): string {
                return 'edge-binding-user'
            }
        })

        const graph = composer.getGraph()
        const runtime = await composer.compose()
        const inspection = runtime.inspect()

        expect(inspection.graph).toEqual(graph)
        expect(inspection.edges).toEqual(graph.edges)
        expect(inspection.edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'inspect-runtime-edge-contact-requests',
                requiredTokenId: 'composer.auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'composer.auth-reader',
                bindingKind: 'value'
            },
            {
                edgeKind: 'capability',
                consumerModuleId: 'inspect-runtime-edge-notifications',
                requiredTokenId: 'composer.auth-public-api',
                dependencyKind: 'shared',
                providerModuleId: 'inspect-runtime-edge-auth',
                capabilityTokenId: 'composer.auth-public-api',
                capabilityKind: 'public-api'
            }
        ])
        expect(inspection.validation).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(Object.isFrozen(inspection.graph)).toBe(true)
        expect(Object.isFrozen(inspection.edges[0])).toBe(true)
        expect(JSON.stringify(inspection)).not.toContain('edge-binding-user')

        await runtime.dispose()
    })

    test('does not execute lazy factories or resources during runtime inspection', async () => {
        let bindingFactoryCalls = 0
        let providerFactoryCalls = 0
        let resourceFactoryCalls = 0
        const contactRequestsModule = defineModule({
            id: 'inspect-runtime-lazy-contact-requests',
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
                context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((providerContext) => {
                    providerFactoryCalls += 1
                    const authReader = providerContext.get(AUTH_READER)

                    return {
                        submit(): string {
                            return authReader.currentUserId()
                        }
                    }
                })
            }
        })
        const resourceModule = defineModule({
            id: 'inspect-runtime-lazy-resource',
            provides: [
                {
                    token: RESOURCE_PUBLIC_API,
                    kind: 'shared-service'
                }
            ],
            setup(context): void {
                context
                    .bind(RESOURCE_PUBLIC_API)
                    .toAsyncResource(async () => {
                        resourceFactoryCalls += 1

                        return {
                            value: {
                                status(): string {
                                    return 'lazy-open'
                                }
                            }
                        }
                    })
                    .singleton()
            }
        })
        const composer = createComposer().use(contactRequestsModule).use(resourceModule)

        composer.bind(AUTH_READER).toFactory(() => {
            bindingFactoryCalls += 1

            return {
                currentUserId(): string {
                    return 'lazy-binding-user'
                }
            }
        })

        expect(composer.validate()).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(composer.inspect().validation.ok).toBe(true)
        expect(composer.getGraph().edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'inspect-runtime-lazy-contact-requests',
                requiredTokenId: 'composer.auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'composer.auth-reader',
                bindingKind: 'factory'
            }
        ])
        expect(bindingFactoryCalls).toBe(0)
        expect(providerFactoryCalls).toBe(0)
        expect(resourceFactoryCalls).toBe(0)

        const runtime = await composer.compose()
        const inspection = runtime.inspect()

        expect(inspection.validation).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(inspection.providerRegistrations).toEqual([
            {
                source: 'module',
                moduleId: 'inspect-runtime-lazy-contact-requests',
                tokenId: 'composer.contact-requests-public-api',
                capabilityKind: 'public-api',
                cardinality: 'single',
                visibility: 'exported',
                registrationKind: 'single',
                providers: [
                    {
                        providerKind: 'factory',
                        registrationIndex: 0,
                        lifetime: 'transient'
                    }
                ]
            },
            {
                source: 'module',
                moduleId: 'inspect-runtime-lazy-resource',
                tokenId: 'composer.resource-public-api',
                capabilityKind: 'shared-service',
                cardinality: 'single',
                visibility: 'exported',
                registrationKind: 'single',
                providers: [
                    {
                        providerKind: 'async-resource',
                        registrationIndex: 0,
                        lifetime: 'singleton',
                        initialization: 'lazy'
                    }
                ]
            }
        ])
        expect(bindingFactoryCalls).toBe(0)
        expect(providerFactoryCalls).toBe(0)
        expect(resourceFactoryCalls).toBe(0)

        const renderedInspection = JSON.stringify(inspection)

        expect(renderedInspection).not.toContain('lazy-binding-user')
        expect(renderedInspection).not.toContain('lazy-open')

        await runtime.dispose()
    })

    test('preserves inspection public API type assertions', async () => {
        const composer = createComposer()
        const composerInspection = composer.inspect()
        const graph = composer.getGraph()

        expectTypeOf(composerInspection).toEqualTypeOf<ComposerInspection>()
        expectTypeOf(graph).toEqualTypeOf<ModuleGraph>()
        expectTypeOf(composerInspection.modules[0]).toEqualTypeOf<ModuleNodeMetadata | undefined>()
        expectTypeOf(composerInspection.requiredPorts[0]).toEqualTypeOf<
            RequiredPortMetadata | undefined
        >()
        expectTypeOf(composerInspection.capabilities[0]).toEqualTypeOf<
            CapabilityMetadata | undefined
        >()
        expectTypeOf(composerInspection.bindings[0]).toEqualTypeOf<
            CompositionBindingMetadata | undefined
        >()
        expectTypeOf(composerInspection.edges[0]).toEqualTypeOf<ModuleDependencyEdge | undefined>()
        expectTypeOf(composerInspection.validation.ok).toEqualTypeOf<boolean>()
        expectTypeOf<InspectionProviderKind>().toEqualTypeOf<
            'value' | 'factory' | 'class' | 'async-factory' | 'async-resource'
        >()
        expectTypeOf<CapabilityProviderRegistrationKind>().toEqualTypeOf<'bind' | 'add'>()
        expectTypeOf<CapabilityProviderSource>().toEqualTypeOf<'module' | 'composition-root'>()
        expectTypeOf<ProviderRegistrationSource>().toEqualTypeOf<'module' | 'composition-root'>()
        expectTypeOf<CapabilityProviderMetadata>().toEqualTypeOf<{
            readonly source: 'module' | 'composition-root'
            readonly moduleId?: string
            readonly registrationKind: CapabilityProviderRegistrationKind
            readonly registrationIndex: number
        }>()
        expectTypeOf<RequiredPortSatisfaction>().toEqualTypeOf<
            'binding' | 'capability' | 'optional' | 'missing'
        >()
        expectTypeOf<ModuleDependencyEdgeKind>().toEqualTypeOf<'capability' | 'binding'>()
        expectTypeOf<CapabilityDependencyEdge>().toMatchTypeOf<ModuleDependencyEdgeBase>()
        expectTypeOf<BindingDependencyEdge>().toMatchTypeOf<ModuleDependencyEdgeBase>()
        expectTypeOf<ModuleDependencyEdge>().toMatchTypeOf<
            CapabilityDependencyEdge | BindingDependencyEdge
        >()
        expectTypeOf<ModuleCycleErrorDetails>().toEqualTypeOf<{
            readonly moduleIdPath: readonly string[]
            readonly tokenIdPath: readonly string[]
            readonly edgeKinds: readonly ModuleDependencyEdgeKind[]
        }>()
        expectTypeOf<DuplicateComposerBindingErrorDetails>().toEqualTypeOf<{
            readonly tokenId: string
            readonly bindingKinds: readonly ('value' | 'factory' | 'class' | 'async-factory')[]
        }>()
        expectTypeOf<InvalidComposerMultiBindingErrorDetails>().toEqualTypeOf<{
            readonly tokenId: string
            readonly bindingKind: 'value' | 'factory'
            readonly reason:
                'missing-public-multi-capability' | 'required-port-only' | 'single-capability'
        }>()
        expectTypeOf<ComposerBindingCardinalityConflictErrorDetails>().toEqualTypeOf<{
            readonly tokenId: string
            readonly bindingKinds: readonly ('value' | 'factory' | 'class' | 'async-factory')[]
            readonly multiBindingKinds: readonly ('value' | 'factory')[]
        }>()

        const cycleError = new ModuleCycleError({
            moduleIdPath: ['typed-a', 'typed-b', 'typed-a'],
            tokenIdPath: ['typed.b', 'typed.a'],
            edgeKinds: ['capability', 'capability']
        })

        expectTypeOf(cycleError.details).toEqualTypeOf<ModuleCycleErrorDetails | undefined>()

        const module = defineModule({
            id: 'inspect-runtime-typed',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'typed-user'
                    }
                })
            }
        })
        const runtime = await createComposer().use(module).compose()
        const runtimeInspection = runtime.inspect()

        expectTypeOf(runtimeInspection).toEqualTypeOf<RuntimeInspection>()
        expectTypeOf(runtimeInspection.providerRegistrations[0]).toEqualTypeOf<
            ProviderRegistrationSummary | undefined
        >()
        expectTypeOf(runtimeInspection.providerRegistrations[0]?.providers[0]).toEqualTypeOf<
            ProviderRegistrationProviderSummary | undefined
        >()

        await runtime.dispose()
    })
})

describe('composed runtime capabilities', () => {
    test('composes modules and exposes only declared exported capabilities', async () => {
        const authModule = defineModule({
            id: 'runtime-auth',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'auth-user'
                    }
                })
            }
        })
        const contactRequestsModule = defineModule({
            id: 'runtime-contact-requests',
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
                context.bind(AUTH_SECRET).toValue({
                    secret: 'module-secret'
                })
                context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((providerContext) => {
                    const authReader = providerContext.get(AUTH_READER)
                    const secret = providerContext.get(AUTH_SECRET)

                    return {
                        submit(): string {
                            return `${authReader.currentUserId()}:${secret.secret}`
                        }
                    }
                })
            }
        })
        const auditModule = defineModule({
            id: 'runtime-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('created')
                context.add(AUDIT_EVENTS).toFactory(() => {
                    return 'submitted'
                })
            }
        })
        const composer = createComposer()
            .use(authModule)
            .use(contactRequestsModule)
            .use(auditModule)

        composer.bind(AUTH_READER).toFactory((context) => {
            const auth = context.get(AUTH_PUBLIC_API)

            return {
                currentUserId(): string {
                    return auth.requireUser()
                }
            }
        })

        const runtime = await composer.compose()

        expect(Object.isFrozen(runtime)).toBe(true)
        expect(runtime.get(AUTH_PUBLIC_API).requireUser()).toBe('auth-user')
        expect(runtime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('auth-user:module-secret')
        expect(runtime.getAll(AUDIT_EVENTS)).toEqual(['created', 'submitted'])
        expect(() => runtime.get(AUTH_READER)).toThrow(PrivateProviderAccessError)
        expect(() => runtime.tryGet(AUTH_SECRET)).toThrow(PrivateProviderAccessError)

        try {
            runtime.get(AUTH_READER)
        } catch (error) {
            expect(error).toBeInstanceOf(PrivateProviderAccessError)

            if (error instanceof PrivateProviderAccessError) {
                expect(error.details).toEqual({
                    moduleId: undefined,
                    tokenId: 'composer.auth-reader',
                    requester: 'runtime',
                    reason: 'token-not-visible'
                })
            }
        }
    })

    test('enforces public capability cardinality through runtime get and getAll', async () => {
        const authModule = defineModule({
            id: 'runtime-gating-auth',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'auth-user'
                    }
                })
            }
        })
        const firstAuditModule = defineModule({
            id: 'runtime-gating-first-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('first-module-first')
                context.add(AUDIT_EVENTS).toFactory(() => {
                    return 'first-module-second'
                })
            }
        })
        const secondAuditModule = defineModule({
            id: 'runtime-gating-second-audit',
            provides: [
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('second-module-first')
            }
        })
        const runtime = await createComposer()
            .use(firstAuditModule)
            .use(authModule)
            .use(secondAuditModule)
            .compose()

        expect(runtime.get(AUTH_PUBLIC_API).requireUser()).toBe('auth-user')
        expect(runtime.getAll(AUDIT_EVENTS)).toEqual([
            'first-module-first',
            'first-module-second',
            'second-module-first'
        ])
        expect(() => runtime.get(AUDIT_EVENTS)).toThrow(GetUsedForMultiTokenError)
        expect(() => runtime.getAll(AUTH_PUBLIC_API)).toThrow(GetAllUsedForSingleTokenError)

        try {
            runtime.get(AUDIT_EVENTS)
        } catch (error) {
            expect(error).toBeInstanceOf(GetUsedForMultiTokenError)

            if (error instanceof GetUsedForMultiTokenError) {
                expect(error.code).toBe('SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN')
                expect(error.details).toEqual({
                    tokenId: 'composer.audit-events',
                    accessMethod: 'get',
                    cardinality: 'multi'
                })
            }
        }

        try {
            runtime.getAll(AUTH_PUBLIC_API)
        } catch (error) {
            expect(error).toBeInstanceOf(GetAllUsedForSingleTokenError)

            if (error instanceof GetAllUsedForSingleTokenError) {
                expect(error.code).toBe('SAGIFIRE_IOC_GET_ALL_USED_FOR_SINGLE_TOKEN')
                expect(error.details).toEqual({
                    tokenId: 'composer.auth-public-api',
                    accessMethod: 'getAll',
                    cardinality: 'single'
                })
            }
        }

        expect(new GetUsedForMultiTokenError(AUDIT_EVENTS.id)).toBeInstanceOf(
            GetUsedForMultiTokenError
        )
        expect(new GetAllUsedForSingleTokenError(AUTH_PUBLIC_API.id)).toBeInstanceOf(
            GetAllUsedForSingleTokenError
        )

        await runtime.dispose()
    })

    test('resolves optional missing multi dependencies as empty arrays inside modules', async () => {
        const module = defineModule({
            id: 'runtime-optional-missing-multi-consumer',
            requires: [
                {
                    token: AUDIT_EVENTS,
                    required: false,
                    cardinality: 'multi'
                }
            ],
            provides: [
                {
                    token: CONTACT_REQUESTS_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((providerContext) => {
                    const events = providerContext.getAll(AUDIT_EVENTS)

                    return {
                        submit(): string {
                            return `events:${events.length}`
                        }
                    }
                })
            }
        })
        const runtime = await createComposer().use(module).compose()

        expect(runtime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('events:0')
        expect(() => runtime.getAll(AUDIT_EVENTS)).toThrow(PrivateProviderAccessError)

        await runtime.dispose()
    })

    test('does not expose module-private multi providers through composed runtime', async () => {
        const module = defineModule({
            id: 'runtime-private-multi-provider',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.add(AUDIT_EVENTS).toValue('private-event')
                context.bind(AUTH_PUBLIC_API).toFactory((providerContext) => {
                    return {
                        requireUser(): string {
                            return providerContext.getAll(AUDIT_EVENTS).join(',')
                        }
                    }
                })
            }
        })
        const runtime = await createComposer().use(module).compose()

        expect(runtime.get(AUTH_PUBLIC_API).requireUser()).toBe('private-event')
        expect(() => runtime.getAll(AUDIT_EVENTS)).toThrow(PrivateProviderAccessError)

        try {
            runtime.getAll(AUDIT_EVENTS)
        } catch (error) {
            expect(error).toBeInstanceOf(PrivateProviderAccessError)

            if (error instanceof PrivateProviderAccessError) {
                expect(error.details).toEqual({
                    moduleId: undefined,
                    tokenId: 'composer.audit-events',
                    requester: 'runtime',
                    reason: 'token-not-visible'
                })
            }
        }

        await runtime.dispose()
    })

    test('preserves scoped providers and wraps public scopes', async () => {
        let factoryCalls = 0
        const module = defineModule({
            id: 'runtime-scoped',
            provides: [
                {
                    token: SCOPED_COUNTER,
                    kind: 'shared-service'
                }
            ],
            setup(context): void {
                context
                    .bind(SCOPED_COUNTER)
                    .toFactory(() => {
                        factoryCalls += 1

                        return {
                            read(): number {
                                return factoryCalls
                            }
                        }
                    })
                    .scoped()
            }
        })
        const runtime = await createComposer().use(module).compose()

        expect(() => runtime.get(SCOPED_COUNTER)).toThrow(InvalidScopeError)

        const firstScope = runtime.createScope()
        const firstCounter = firstScope.get(SCOPED_COUNTER)
        const secondScope = runtime.createScope()

        expect(Object.isFrozen(firstScope)).toBe(true)
        expect(firstScope.get(SCOPED_COUNTER)).toBe(firstCounter)
        expect(firstCounter.read()).toBe(1)
        expect(secondScope.get(SCOPED_COUNTER).read()).toBe(2)
        expect(() =>
            runtime.createScope({
                values: [
                    [
                        AUTH_READER,
                        {
                            currentUserId(): string {
                                return 'hidden'
                            }
                        }
                    ]
                ]
            })
        ).toThrow(PrivateProviderAccessError)

        await firstScope.dispose()
        await secondScope.dispose()

        await expect(
            runtime.withScope((scope) => {
                return scope.get(SCOPED_COUNTER).read()
            })
        ).resolves.toBe(3)
    })

    test('preserves async provider access and resource disposal', async () => {
        let asyncFactoryCalls = 0
        let disposed = false
        const module = defineModule({
            id: 'runtime-async-resource',
            provides: [
                {
                    token: ASYNC_AUTH_READER,
                    kind: 'shared-service'
                },
                {
                    token: RESOURCE_PUBLIC_API,
                    kind: 'shared-service'
                }
            ],
            setup(context): void {
                context
                    .bind(ASYNC_AUTH_READER)
                    .toAsyncFactory(async () => {
                        asyncFactoryCalls += 1

                        return {
                            currentUserId(): string {
                                return 'async-user'
                            }
                        }
                    })
                    .singleton()
                context
                    .bind(RESOURCE_PUBLIC_API)
                    .toAsyncResource(async () => {
                        return {
                            value: {
                                status(): string {
                                    return disposed ? 'disposed' : 'open'
                                }
                            },
                            dispose(): void {
                                disposed = true
                            }
                        }
                    })
                    .singleton()
                    .eager()
            }
        })
        const runtime = await createComposer().use(module).compose()

        expect(runtime.get(RESOURCE_PUBLIC_API).status()).toBe('open')
        expect(() => runtime.get(ASYNC_AUTH_READER)).toThrow(AsyncProviderAccessError)
        await expect(runtime.getAsync(ASYNC_AUTH_READER)).resolves.toMatchObject({
            currentUserId: expect.any(Function)
        })
        await expect(runtime.tryGetAsync(ASYNC_AUTH_READER)).resolves.toMatchObject({
            currentUserId: expect.any(Function)
        })
        expect(asyncFactoryCalls).toBe(1)

        await runtime.dispose()

        expect(disposed).toBe(true)
        expect(() => runtime.get(RESOURCE_PUBLIC_API)).toThrow(RuntimeDisposedError)
    })

    test('throws typed diagnostics for invalid composed graphs', async () => {
        const missingRequiredPortModule = defineModule({
            id: 'compose-missing-required-port',
            requires: [
                {
                    token: AUTH_READER
                }
            ],
            setup(): void {}
        })
        const missingProviderModule = defineModule({
            id: 'compose-missing-provider',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(): void {}
        })
        const duplicateActualProviderModule = defineModule({
            id: 'compose-duplicate-actual-provider',
            requires: [
                {
                    token: AUTH_PUBLIC_API
                }
            ],
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'module-user'
                    }
                })
            }
        })
        const duplicateActualProviderComposer = createComposer().use(duplicateActualProviderModule)

        duplicateActualProviderComposer.bind(AUTH_PUBLIC_API).toValue({
            requireUser(): string {
                return 'binding-user'
            }
        })

        await expect(
            createComposer().use(missingRequiredPortModule).compose()
        ).rejects.toBeInstanceOf(ComposerValidationError)
        await expect(createComposer().use(missingProviderModule).compose()).rejects.toBeInstanceOf(
            ComposerValidationError
        )
        await expect(duplicateActualProviderComposer.compose()).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_DUPLICATE_PROVIDER'
        })
    })

    test('keeps provider-level factory cycles delegated to container diagnostics', async () => {
        const module = defineModule({
            id: 'runtime-provider-cycle',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toFactory(({ get }) => {
                    return {
                        requireUser(): string {
                            return get(AUTH_SECRET).secret
                        }
                    }
                })
                context.bind(AUTH_SECRET).toFactory(({ get }) => {
                    return {
                        secret: get(AUTH_PUBLIC_API).requireUser()
                    }
                })
            }
        })
        const runtime = await createComposer().use(module).compose()

        expect(runtime.inspect().validation).toEqual({
            ok: true,
            diagnostics: []
        })
        expect(() => runtime.get(AUTH_PUBLIC_API).requireUser()).toThrow(ProviderCycleError)
        expect(() => runtime.get(AUTH_PUBLIC_API).requireUser()).not.toThrow(ModuleCycleError)

        await runtime.dispose()
    })

    test('rejects module cycles during prepare and compose with validation reports', async () => {
        let setupCalls = 0
        const first = defineModule({
            id: 'compose-cycle-a',
            requires: [
                {
                    token: NOTIFICATION_PUBLIC_API
                }
            ],
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                setupCalls += 1
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'cycle-user'
                    }
                })
            }
        })
        const second = defineModule({
            id: 'compose-cycle-b',
            requires: [
                {
                    token: AUTH_PUBLIC_API
                }
            ],
            provides: [
                {
                    token: NOTIFICATION_PUBLIC_API,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                setupCalls += 1
                context.bind(NOTIFICATION_PUBLIC_API).toValue({
                    notify(): string {
                        return 'notified'
                    }
                })
            }
        })
        const composer = createComposer().use(first).use(second)

        await expect(composer.prepare()).rejects.toBeInstanceOf(ComposerValidationError)
        await expect(composer.prepare()).rejects.toMatchObject({
            report: {
                ok: false,
                diagnostics: [
                    {
                        code: 'SAGIFIRE_IOC_MODULE_CYCLE',
                        details: {
                            moduleIdPath: ['compose-cycle-a', 'compose-cycle-b', 'compose-cycle-a'],
                            tokenIdPath: [
                                'composer.notification-public-api',
                                'composer.auth-public-api'
                            ],
                            edgeKinds: ['capability', 'capability']
                        }
                    }
                ]
            }
        })
        await expect(composer.compose()).rejects.toBeInstanceOf(ComposerValidationError)
        await expect(composer.compose()).rejects.toMatchObject({
            report: {
                ok: false,
                diagnostics: [
                    {
                        code: 'SAGIFIRE_IOC_MODULE_CYCLE'
                    }
                ]
            }
        })
        expect(setupCalls).toBe(0)
    })

    test('preserves composed runtime token inference', async () => {
        const module = defineModule({
            id: 'runtime-typed',
            provides: [
                {
                    token: AUTH_PUBLIC_API,
                    kind: 'public-api'
                },
                {
                    token: AUDIT_EVENTS,
                    kind: 'event-subscriber',
                    cardinality: 'multi'
                }
            ],
            setup(context): void {
                context.bind(AUTH_PUBLIC_API).toValue({
                    requireUser(): string {
                        return 'typed-user'
                    }
                })
                context.add(AUDIT_EVENTS).toValue('typed-event')
            }
        })
        const runtime = await createComposer().use(module).compose()
        const scope = runtime.createScope()

        expectTypeOf(runtime).toEqualTypeOf<ComposedRuntime>()
        expectTypeOf(runtime.get(AUTH_PUBLIC_API)).toEqualTypeOf<AuthPublicApi>()
        expectTypeOf(runtime.tryGet(AUTH_PUBLIC_API)).toEqualTypeOf<AuthPublicApi | undefined>()
        expectTypeOf(runtime.getAll(AUDIT_EVENTS)).toEqualTypeOf<string[]>()
        expectTypeOf(runtime.getAsync(AUTH_PUBLIC_API)).toEqualTypeOf<Promise<AuthPublicApi>>()
        expectTypeOf(runtime.tryGetAsync(AUTH_PUBLIC_API)).toEqualTypeOf<
            Promise<AuthPublicApi | undefined>
        >()
        expectTypeOf(scope).toEqualTypeOf<Scope>()
        expectTypeOf(scope.get(AUTH_PUBLIC_API)).toEqualTypeOf<AuthPublicApi>()
        expect(runtime.get(AUTH_PUBLIC_API).requireUser()).toBe('typed-user')

        await scope.dispose()
    })
})
