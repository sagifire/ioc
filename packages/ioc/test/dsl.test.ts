import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    createComposer,
    DuplicateModuleDependencyError,
    InvalidModuleDefinitionError,
    type ModuleDefinition,
    type ModuleDependencyDefinition,
    type ModuleSetupContext
} from '../src/composer.js'
import {
    module as moduleDsl,
    type ModuleDslDefinition,
    type ModuleDslDefinitionInput
} from '../src/dsl.js'
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
                description: 'Authentication reader'
            },
            {
                token: OPTIONAL_AUTH_READER,
                required: false,
                kind: 'shared'
            }
        ])
        expect(moduleDefinition.provides).toEqual([
            {
                token: CONTACT_REQUESTS_PUBLIC_API,
                kind: 'public-api',
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
                satisfiedBy: 'capability'
            }
        ])
        expect(graph.capabilities).toEqual([
            {
                moduleId: 'dsl-auth',
                tokenId: 'dsl.auth-public-api',
                kind: 'public-api'
            },
            {
                moduleId: 'dsl-contact-requests-composer',
                tokenId: 'dsl.contact-requests-public-api',
                kind: 'public-api'
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
        expectTypeOf(objectFormModule.requires[0]).toEqualTypeOf<
            ModuleDependencyDefinition<AuthReader>
        >()
        expectTypeOf<TokenValue<(typeof objectFormModule.requires)[0]['token']>>().toEqualTypeOf<
            AuthReader
        >()
        expectTypeOf<TokenValue<(typeof objectFormModule.requires)[1]['token']>>().toEqualTypeOf<
            AuthReader
        >()
        expectTypeOf<
            TokenValue<(typeof objectFormModule.provides)[0]['token']>
        >().toEqualTypeOf<ContactRequestsPublicApi>()
        expectTypeOf<TokenValue<(typeof shorthandModule.requires)[0]['token']>>().toEqualTypeOf<
            AuthReader
        >()
        expectTypeOf<TokenValue<(typeof shorthandModule.provides)[0]['token']>>().toEqualTypeOf<
            AuthPublicApi
        >()
    })
})
