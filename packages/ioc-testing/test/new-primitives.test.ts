import { describe, expect, expectTypeOf, test } from 'vitest'

import { defineModule, token, type Scope } from '@sagifire/ioc'
import {
    ScopeAssertionError,
    assertChildScopeHasValue,
    assertChildScopeHasValues,
    assertDiagnosticReportOk,
    assertGraphHasAdapterSourceEdge,
    assertGraphHasMultiCapability,
    assertGraphHasMultiCapabilityProvider,
    createTestComposer,
    createTestRuntime,
    fakeModule,
    multiOverride,
    type ChildScopeMultiValueExpectation,
    type ChildScopeValueExpectation,
    type GraphAdapterSourceExpectation,
    type GraphMultiCapabilityExpectation,
    type GraphMultiCapabilityProviderExpectation,
    type TestMultiOverride
} from '../src/index.js'

interface AuditSink {
    events(): string[]
}

interface AuthPublicApi {
    currentUserId(): string
}

interface AuthReader {
    read(): string
}

interface ContactRequestsApi {
    submit(): string
}

const AUDIT_EVENTS = token<string>('testing.new-primitives.audit-events')
const AUDIT_SINK = token<AuditSink>('testing.new-primitives.audit-sink')
const AUTH_PUBLIC_API = token<AuthPublicApi>('testing.new-primitives.auth-public-api')
const AUTH_READER = token<AuthReader>('testing.new-primitives.auth-reader')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>(
    'testing.new-primitives.contact-requests-public-api'
)
const USER_ID = token<string>('testing.new-primitives.user-id')
const TAGS = token<string>('testing.new-primitives.tags')

const auditConsumerModule = defineModule({
    id: 'testing-new-primitives-audit-consumer',
    requires: [
        {
            token: AUDIT_EVENTS,
            cardinality: 'multi'
        }
    ],
    provides: [
        {
            token: AUDIT_SINK,
            kind: 'public-api'
        }
    ],
    setup(context): void {
        context.bind(AUDIT_SINK).toFactory((resolutionContext) => {
            return {
                events(): string[] {
                    return resolutionContext.getAll(AUDIT_EVENTS)
                }
            }
        })
    }
})

const firstFakeAuditModule = fakeModule('testing-new-primitives-audit-first', {
    provides: [
        {
            token: AUDIT_EVENTS,
            kind: 'event-subscriber',
            cardinality: 'multi',
            useValue: 'module-first'
        }
    ]
})

const secondFakeAuditModule = fakeModule('testing-new-primitives-audit-second', {
    provides: [
        {
            token: AUDIT_EVENTS,
            kind: 'event-subscriber',
            cardinality: 'multi',
            useFactory(): string {
                return 'module-second'
            }
        }
    ]
})

const authModule = defineModule({
    id: 'testing-new-primitives-auth',
    provides: [
        {
            token: AUTH_PUBLIC_API,
            kind: 'public-api'
        }
    ],
    setup(context): void {
        context.bind(AUTH_PUBLIC_API).toValue({
            currentUserId(): string {
                return 'auth-user'
            }
        })
    }
})

const contactRequestsModule = defineModule({
    id: 'testing-new-primitives-contact-requests',
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
                    return authReader.read()
                }
            }
        })
    }
})

describe('testing helpers for Stage 17 primitives', () => {
    test('asserts multi capability contributors and applies replace/append multi overrides before compose', async () => {
        const productionRuntime = await createTestComposer({
            modules: [auditConsumerModule, firstFakeAuditModule, secondFakeAuditModule]
        }).compose()
        const composer = createTestComposer({
            modules: [auditConsumerModule, firstFakeAuditModule, secondFakeAuditModule],
            multiOverrides: [
                multiOverride(AUDIT_EVENTS).appendValue('discarded-test-contribution'),
                multiOverride(AUDIT_EVENTS).replaceWithValues(['root-replacement']),
                multiOverride(AUDIT_EVENTS).appendFactory(() => 'root-factory')
            ]
        })
        const graph = composer.getGraph()

        assertDiagnosticReportOk(composer.validate())
        assertGraphHasMultiCapability(graph, {
            moduleId: 'testing-new-primitives-audit-first',
            tokenId: AUDIT_EVENTS.id,
            kind: 'event-subscriber',
            providerCount: 4
        })
        assertGraphHasMultiCapabilityProvider(graph, {
            tokenId: AUDIT_EVENTS.id,
            source: 'module',
            moduleId: 'testing-new-primitives-audit-first',
            registrationKind: 'add',
            registrationIndex: 0
        })
        assertGraphHasMultiCapabilityProvider(graph, {
            tokenId: AUDIT_EVENTS.id,
            source: 'composition-root',
            registrationKind: 'add',
            registrationIndex: 3
        })

        const testRuntime = await composer.compose()

        expect(productionRuntime.get(AUDIT_SINK).events()).toEqual([
            'module-first',
            'module-second'
        ])
        expect(testRuntime.get(AUDIT_SINK).events()).toEqual([
            'module-first',
            'module-second',
            'root-replacement',
            'root-factory'
        ])
        expect(productionRuntime.get(AUDIT_SINK).events()).toEqual([
            'module-first',
            'module-second'
        ])

        await testRuntime.dispose()
        await productionRuntime.dispose()
    })

    test('asserts graph-aware adapter source edges through a dedicated helper', async () => {
        const composer = createTestComposer({
            modules: [authModule, contactRequestsModule],
            configure(configuredComposer): void {
                configuredComposer
                    .adapt(AUTH_READER)
                    .from(AUTH_PUBLIC_API)
                    .using((auth) => {
                        return {
                            read(): string {
                                return auth.currentUserId()
                            }
                        }
                    })
            }
        })
        const runtime = await composer.compose()

        assertGraphHasAdapterSourceEdge(composer.inspect(), {
            consumerModuleId: 'testing-new-primitives-contact-requests',
            requiredTokenId: AUTH_READER.id,
            adapterTargetTokenId: AUTH_READER.id,
            adapterSourceTokenId: AUTH_PUBLIC_API.id,
            adapterSourceKind: 'token'
        })
        expect(runtime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe('auth-user')

        await runtime.dispose()
    })

    test('asserts child scope value and multi-value behavior through public scope APIs', async () => {
        const runtime = await createTestRuntime({
            multiOverrides: [multiOverride(TAGS).appendValue('runtime-tag')]
        })
        const parent = runtime.createScope({
            values: [[USER_ID, 'parent-user']],
            multiValues: [[TAGS, 'parent-tag']]
        })

        await assertChildScopeHasValue({
            parent,
            token: USER_ID,
            options: {
                values: [[USER_ID, 'child-user']]
            },
            expectedValue: 'child-user',
            expectedParentValue: 'parent-user'
        })
        await assertChildScopeHasValues({
            parent,
            token: TAGS,
            options: {
                multiValues: [[TAGS, 'child-tag']]
            },
            expectedValues: ['runtime-tag', 'parent-tag', 'child-tag'],
            expectedParentValues: ['runtime-tag', 'parent-tag']
        })
        await expect(
            assertChildScopeHasValue({
                parent,
                token: USER_ID,
                expectedValue: 'wrong-user'
            })
        ).rejects.toThrow(ScopeAssertionError)

        await parent.dispose()
        await runtime.dispose()
    })

    test('preserves new helper inference', () => {
        const appendOverride = multiOverride(AUDIT_EVENTS).appendValue('typed')
        const replaceOverride = multiOverride(AUDIT_EVENTS).replaceWithFactory(() => 'typed')
        const valueExpectation: ChildScopeValueExpectation<string> = {
            parent: {} as Scope,
            token: USER_ID,
            expectedValue: 'typed'
        }
        const multiValueExpectation: ChildScopeMultiValueExpectation<string> = {
            parent: {} as Scope,
            token: TAGS,
            expectedValues: ['typed']
        }

        expectTypeOf(appendOverride).toEqualTypeOf<TestMultiOverride<string>>()
        expectTypeOf(replaceOverride).toEqualTypeOf<TestMultiOverride<string>>()
        expectTypeOf(valueExpectation.token).toEqualTypeOf<typeof USER_ID>()
        expectTypeOf(multiValueExpectation.token).toEqualTypeOf<typeof TAGS>()
        expectTypeOf<
            Parameters<typeof assertGraphHasMultiCapability>[1]
        >().toEqualTypeOf<GraphMultiCapabilityExpectation>()
        expectTypeOf<
            Parameters<typeof assertGraphHasMultiCapabilityProvider>[1]
        >().toEqualTypeOf<GraphMultiCapabilityProviderExpectation>()
        expectTypeOf<
            Parameters<typeof assertGraphHasAdapterSourceEdge>[1]
        >().toEqualTypeOf<GraphAdapterSourceExpectation>()
        expectTypeOf<Parameters<typeof assertChildScopeHasValue>[0]>().toEqualTypeOf<
            ChildScopeValueExpectation<unknown>
        >()
        expectTypeOf<Parameters<typeof assertChildScopeHasValues>[0]>().toEqualTypeOf<
            ChildScopeMultiValueExpectation<unknown>
        >()
    })
})
