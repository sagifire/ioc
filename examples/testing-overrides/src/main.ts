import {
    PrivateProviderAccessError,
    defineModule,
    namespace,
    type ComposedRuntime
} from '@sagifire/ioc'
import {
    assertDiagnosticReportHasDiagnostic,
    assertDiagnosticReportOk,
    assertErrorDiagnostic,
    assertGraphHasBinding,
    assertGraphHasCapability,
    assertGraphHasEdge,
    assertGraphHasModule,
    assertGraphHasRequiredPort,
    createModuleHarness,
    createTestComposer,
    createTestRuntime,
    fakeModule,
    multiOverride,
    override
} from '@sagifire/ioc-testing'

interface AuthReader {
    currentUserId(): string
}

interface Clock {
    now(): string
}

interface ContactRequestsPublicApi {
    submit(subject: string): string
}

interface ContactRequestSecret {
    readonly value: string
}

const tokens = namespace('examples.testing-overrides')

const AUTH_READER = tokens.token<AuthReader>('auth-reader')
const CLOCK = tokens.token<Clock>('clock')
const CONTACT_REQUESTS_PUBLIC_API = tokens.token<ContactRequestsPublicApi>(
    'contact-requests-public-api'
)
const CONTACT_REQUEST_SECRET = tokens.token<ContactRequestSecret>('contact-request-secret')
const AUDIT_HANDLERS = tokens.token<string>('audit-handlers')

const contactRequestsModule = defineModule({
    id: 'examples-testing-overrides-contact-requests',
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
            token: CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api',
            description: 'Contact request use cases'
        }
    ],
    setup(context): void {
        context.bind(CONTACT_REQUEST_SECRET).toValue({
            value: 'private-secret'
        })
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory(({ get }) => {
            const authReader = get(AUTH_READER)
            const clock = get(CLOCK)
            const secret = get(CONTACT_REQUEST_SECRET)

            return {
                submit(subject): string {
                    return [authReader.currentUserId(), clock.now(), secret.value, subject].join(
                        ':'
                    )
                }
            }
        })
    }
})

async function main(): Promise<void> {
    await demonstrateTestRuntime()
    await demonstrateTestComposerOverrides()
    await demonstrateModuleHarnessWithFakeModules()
    await demonstrateAsyncMultiTestingHelpers()
    await demonstrateRuntimeIsolation()
    demonstrateDiagnosticAssertions()
}

async function demonstrateAsyncMultiTestingHelpers(): Promise<void> {
    const disposed: string[] = []
    const runtime = await createTestRuntime({
        multiOverrides: [
            multiOverride(AUDIT_HANDLERS).appendValue('sync-handler'),
            multiOverride(AUDIT_HANDLERS).appendAsyncFactory(async () => 'async-handler', {
                lifetime: 'singleton'
            }),
            multiOverride(AUDIT_HANDLERS).appendAsyncResource(
                async () => ({
                    value: 'resource-handler',
                    dispose(): void {
                        disposed.push('resource-handler')
                    }
                }),
                { lifetime: 'singleton' }
            )
        ]
    })

    try {
        assertEqual(
            (await runtime.getAllAsync(AUDIT_HANDLERS)).join(','),
            'sync-handler,async-handler,resource-handler',
            'async multi override order'
        )
    } finally {
        await runtime.dispose()
    }

    assertEqual(disposed.join(','), 'resource-handler', 'async multi resource disposal')

    const asyncFakeModule = fakeModule('examples-testing-overrides-async-audit', {
        provides: [
            {
                token: AUDIT_HANDLERS,
                kind: 'event-subscriber',
                cardinality: 'multi',
                useAsyncFactory: async () => 'fake-module-handler',
                lifetime: 'singleton'
            }
        ]
    })
    const fakeRuntime = await createTestComposer({
        modules: [asyncFakeModule]
    }).compose()

    try {
        assertEqual(
            (await fakeRuntime.getAllAsync(AUDIT_HANDLERS)).join(','),
            'fake-module-handler',
            'async multi fake module'
        )
    } finally {
        await fakeRuntime.dispose()
    }
}

async function demonstrateTestRuntime(): Promise<void> {
    const runtime = await createTestRuntime({
        configure(container): void {
            container.bind(CLOCK).toValue({
                now(): string {
                    return '2026-07-02'
                }
            })
        },
        overrides: [
            override(AUTH_READER).toValue({
                currentUserId(): string {
                    return 'runtime-user'
                }
            })
        ]
    })

    try {
        assertEqual(runtime.get(AUTH_READER).currentUserId(), 'runtime-user', 'runtime auth')
        assertEqual(runtime.get(CLOCK).now(), '2026-07-02', 'runtime clock')
    } finally {
        await runtime.dispose()
    }
}

async function demonstrateTestComposerOverrides(): Promise<void> {
    const composer = createTestComposer({
        modules: [contactRequestsModule],
        overrides: [
            override(AUTH_READER).toValue({
                currentUserId(): string {
                    return 'override-user'
                }
            }),
            override(CLOCK).toValue({
                now(): string {
                    return 'test-clock'
                }
            })
        ]
    })

    assertDiagnosticReportOk(composer.validate())
    assertGraphHasBinding(composer.getGraph(), {
        tokenId: AUTH_READER.id,
        kind: 'value',
        providerKind: 'value'
    })
    assertGraphHasEdge(composer.inspect(), {
        edgeKind: 'binding',
        consumerModuleId: contactRequestsModule.id,
        requiredTokenId: AUTH_READER.id,
        bindingTokenId: AUTH_READER.id,
        bindingKind: 'value'
    })

    const runtime = await composer.compose()

    try {
        assertSubmit(
            runtime,
            'composer',
            'override-user:test-clock:private-secret:composer',
            'composer override'
        )
        assertThrowsInstance(
            () => runtime.get(CONTACT_REQUEST_SECRET),
            PrivateProviderAccessError,
            'private provider visibility'
        )
    } finally {
        await runtime.dispose()
    }
}

async function demonstrateModuleHarnessWithFakeModules(): Promise<void> {
    const fakeAuthModule = fakeModule('examples-testing-overrides-fake-auth', {
        provides: [
            {
                token: AUTH_READER,
                useValue: {
                    currentUserId(): string {
                        return 'fake-module-user'
                    }
                }
            }
        ]
    })
    const fakeClockModule = fakeModule('examples-testing-overrides-fake-clock', {
        provides: [
            {
                token: CLOCK,
                kind: 'shared-service',
                useValue: {
                    now(): string {
                        return 'fake-clock'
                    }
                }
            }
        ]
    })
    const harness = createModuleHarness({
        module: contactRequestsModule,
        fakeModules: [fakeAuthModule],
        supportModules: [fakeClockModule]
    })

    assertDiagnosticReportOk(harness.validate())
    assertGraphHasModule(harness.getGraph(), contactRequestsModule.id)
    assertGraphHasModule(harness.getGraph(), fakeAuthModule.id)
    assertGraphHasCapability(harness.inspect(), {
        moduleId: contactRequestsModule.id,
        tokenId: CONTACT_REQUESTS_PUBLIC_API.id,
        kind: 'public-api'
    })
    assertGraphHasRequiredPort(harness.getGraph(), {
        moduleId: contactRequestsModule.id,
        tokenId: AUTH_READER.id,
        satisfiedBy: 'capability'
    })
    assertGraphHasEdge(harness.getGraph(), {
        edgeKind: 'capability',
        consumerModuleId: contactRequestsModule.id,
        requiredTokenId: AUTH_READER.id,
        providerModuleId: fakeAuthModule.id,
        capabilityTokenId: AUTH_READER.id
    })

    const runtime = await harness.compose()

    try {
        assertSubmit(
            runtime,
            'harness',
            'fake-module-user:fake-clock:private-secret:harness',
            'module harness'
        )
    } finally {
        await runtime.dispose()
    }
}

async function demonstrateRuntimeIsolation(): Promise<void> {
    const productionRuntime = await createProductionRuntime()
    const testRuntime = await createTestComposer({
        modules: [contactRequestsModule],
        overrides: [
            override(AUTH_READER).toValue({
                currentUserId(): string {
                    return 'isolated-test-user'
                }
            }),
            override(CLOCK).toValue({
                now(): string {
                    return 'isolated-test-clock'
                }
            })
        ]
    }).compose()

    try {
        assertSubmit(
            productionRuntime,
            'isolation',
            'production-user:production-clock:private-secret:isolation',
            'production before test runtime assertion'
        )
        assertSubmit(
            testRuntime,
            'isolation',
            'isolated-test-user:isolated-test-clock:private-secret:isolation',
            'isolated test runtime'
        )
        assertSubmit(
            productionRuntime,
            'isolation',
            'production-user:production-clock:private-secret:isolation',
            'production after test runtime assertion'
        )
    } finally {
        await testRuntime.dispose()
        await productionRuntime.dispose()
    }
}

function demonstrateDiagnosticAssertions(): void {
    const missingClockComposer = createTestComposer({
        modules: [contactRequestsModule],
        overrides: [
            override(AUTH_READER).toValue({
                currentUserId(): string {
                    return 'diagnostic-user'
                }
            })
        ]
    })

    assertDiagnosticReportHasDiagnostic(missingClockComposer.validate(), {
        code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
        severity: 'error',
        messageIncludes: CLOCK.id
    })

    const duplicateOverrideError = captureError(() => {
        createTestComposer({
            overrides: [
                override(AUTH_READER).toValue({
                    currentUserId(): string {
                        return 'first'
                    }
                }),
                override(AUTH_READER).toValue({
                    currentUserId(): string {
                        return 'second'
                    }
                })
            ]
        })
    })

    assertErrorDiagnostic(duplicateOverrideError, {
        code: 'SAGIFIRE_IOC_TESTING_DUPLICATE_OVERRIDE',
        severity: 'error',
        details: {
            tokenId: AUTH_READER.id
        }
    })
}

function createProductionRuntime(): Promise<ComposedRuntime> {
    const fakeAuthModule = fakeModule('examples-testing-overrides-production-auth', {
        provides: [
            {
                token: AUTH_READER,
                useValue: {
                    currentUserId(): string {
                        return 'production-user'
                    }
                }
            }
        ]
    })
    const fakeClockModule = fakeModule('examples-testing-overrides-production-clock', {
        provides: [
            {
                token: CLOCK,
                kind: 'shared-service',
                useValue: {
                    now(): string {
                        return 'production-clock'
                    }
                }
            }
        ]
    })

    return createModuleHarness({
        module: contactRequestsModule,
        fakeModules: [fakeAuthModule],
        supportModules: [fakeClockModule]
    }).compose()
}

function assertSubmit(
    runtime: ComposedRuntime,
    subject: string,
    expected: string,
    label: string
): void {
    assertEqual(runtime.get(CONTACT_REQUESTS_PUBLIC_API).submit(subject), expected, label)
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
    if (actual !== expected) {
        throw new Error(`${label}: expected ${String(expected)}, received ${String(actual)}`)
    }
}

function assertThrowsInstance(
    callback: () => void,
    errorConstructor: new (...parameters: never[]) => Error,
    label: string
): void {
    try {
        callback()
    } catch (error) {
        if (error instanceof errorConstructor) {
            return
        }

        throw new Error(`${label}: expected ${errorConstructor.name}, received ${String(error)}`)
    }

    throw new Error(`${label}: expected callback to throw`)
}

function captureError(callback: () => void): unknown {
    try {
        callback()
    } catch (error) {
        return error
    }

    throw new Error('expected callback to throw')
}

await main()
