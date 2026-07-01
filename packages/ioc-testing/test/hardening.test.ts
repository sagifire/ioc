import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    MissingRequiredPortError,
    defineModule,
    token,
    type ComposedRuntime,
    type ComposerInspection,
    type ContainerRuntime,
    type DiagnosticReport,
    type ModuleDefinition,
    type ModuleGraph,
    type RuntimeInspection,
    type SyncProviderFactory
} from '@sagifire/ioc'
import {
    DiagnosticAssertionError,
    DuplicateTestOverrideError,
    GraphAssertionError,
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
    override,
    type CreateTestComposerOptions,
    type CreateTestRuntimeOptions,
    type DiagnosticExpectation,
    type FakeModuleDefinition,
    type FakeModuleProvider,
    type GraphAssertionInput,
    type GraphBindingExpectation,
    type GraphCapabilityExpectation,
    type GraphEdgeExpectation,
    type GraphRequiredPortExpectation,
    type ModuleHarness,
    type TestAsyncFactoryOverride,
    type TestClassOverride,
    type TestFactoryOverride,
    type TestOverride,
    type TestValueOverride
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

interface Logger {
    readonly name: string
}

interface AsyncFlag {
    readonly enabled: boolean
}

class ClassLogger implements Logger {
    readonly name = 'class-logger'
}

class ClassAuthReader implements AuthReader {
    currentUserId(): string {
        return 'class-user'
    }
}

const AUTH_READER = token<AuthReader>('testing.hardening.auth-reader')
const CLOCK = token<Clock>('testing.hardening.clock')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>(
    'testing.hardening.contact-requests-public-api'
)
const LOGGER = token<Logger>('testing.hardening.logger')
const CLASS_LOGGER = token<Logger>('testing.hardening.class-logger')
const ASYNC_FLAG = token<AsyncFlag>('testing.hardening.async-flag')

const contactRequestsModule = defineModule({
    id: 'testing-hardening-contact-requests',
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
            kind: 'public-api'
        }
    ],
    setup(context): void {
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((resolutionContext) => {
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

describe('testing package hardening', () => {
    test('composes the final helper surface without mutating frozen runtimes', async () => {
        const productionAuthModule = fakeModule('testing-hardening-production-auth', {
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
        const testAuthModule = fakeModule('testing-hardening-fake-auth', {
            provides: [
                {
                    token: AUTH_READER,
                    description: 'Fake auth reader for final testing package hardening',
                    useValue: {
                        currentUserId(): string {
                            return 'test-user'
                        }
                    }
                }
            ]
        })
        const productionRuntime = await createTestComposer({
            modules: [contactRequestsModule, productionAuthModule],
            overrides: [
                override(CLOCK).toValue({
                    now(): string {
                        return 'production-clock'
                    }
                })
            ]
        }).compose()
        const isolatedRuntime = await createTestRuntime({
            overrides: [
                override(LOGGER).toFactory(() => ({
                    name: 'isolated-runtime'
                })),
                override(CLASS_LOGGER).toClass(ClassLogger),
                override(ASYNC_FLAG).toAsyncFactory(async () => ({
                    enabled: true
                }))
            ]
        })
        const harness = createModuleHarness({
            module: contactRequestsModule,
            fakeModules: [testAuthModule],
            overrides: [
                override(CLOCK).toValue({
                    now(): string {
                        return 'test-clock'
                    }
                })
            ]
        })

        assertDiagnosticReportOk(harness.validate())
        assertGraphHasModule(harness.inspect(), 'testing-hardening-contact-requests')
        assertGraphHasCapability(harness.getGraph(), {
            moduleId: 'testing-hardening-contact-requests',
            tokenId: CONTACT_REQUESTS_PUBLIC_API.id,
            kind: 'public-api'
        })
        assertGraphHasRequiredPort(harness.getGraph(), {
            moduleId: 'testing-hardening-contact-requests',
            tokenId: AUTH_READER.id,
            satisfiedBy: 'capability'
        })
        assertGraphHasBinding(harness.getGraph(), {
            tokenId: CLOCK.id,
            kind: 'value',
            providerKind: 'value'
        })
        assertGraphHasEdge(harness.getGraph(), {
            edgeKind: 'capability',
            consumerModuleId: 'testing-hardening-contact-requests',
            requiredTokenId: AUTH_READER.id,
            providerModuleId: 'testing-hardening-fake-auth',
            capabilityTokenId: AUTH_READER.id
        })
        assertGraphHasEdge(harness.getGraph(), {
            edgeKind: 'binding',
            consumerModuleId: 'testing-hardening-contact-requests',
            requiredTokenId: CLOCK.id,
            bindingTokenId: CLOCK.id,
            bindingKind: 'value'
        })

        const harnessRuntime = await harness.compose()

        expect(productionRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe(
            'production-user@production-clock'
        )
        expect(harnessRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe(
            'test-user@test-clock'
        )
        expect(productionRuntime.get(CONTACT_REQUESTS_PUBLIC_API).submit()).toBe(
            'production-user@production-clock'
        )
        expect(isolatedRuntime.get(LOGGER)).toEqual({
            name: 'isolated-runtime'
        })
        expect(isolatedRuntime.get(CLASS_LOGGER)).toBeInstanceOf(ClassLogger)
        expect(await isolatedRuntime.getAsync(ASYNC_FLAG)).toEqual({
            enabled: true
        })

        await harnessRuntime.dispose()
        await isolatedRuntime.dispose()
        await productionRuntime.dispose()
    })

    test('asserts diagnostics through reports and typed errors', () => {
        const invalidComposer = createTestComposer({
            modules: [contactRequestsModule]
        })
        const report = invalidComposer.validate()
        const duplicateOverrideError = new DuplicateTestOverrideError(CLOCK.id)
        const missingPortError = new MissingRequiredPortError(
            'testing-hardening-contact-requests',
            AUTH_READER.id,
            'external'
        )

        assertDiagnosticReportHasDiagnostic(report, {
            code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
            severity: 'error',
            details: {
                moduleId: 'testing-hardening-contact-requests',
                tokenId: AUTH_READER.id,
                dependencyKind: 'external'
            }
        })
        assertErrorDiagnostic(duplicateOverrideError, {
            code: 'SAGIFIRE_IOC_TESTING_DUPLICATE_OVERRIDE',
            severity: 'error',
            details: {
                tokenId: CLOCK.id
            }
        })
        assertErrorDiagnostic(missingPortError, {
            messageIncludes: AUTH_READER.id
        })
        expect(() => assertDiagnosticReportOk(report)).toThrow(DiagnosticAssertionError)
        expect(() => assertGraphHasModule(invalidComposer.getGraph(), 'missing-module')).toThrow(
            GraphAssertionError
        )
    })

    test('preserves final helper inference', async () => {
        const authReader: AuthReader = {
            currentUserId(): string {
                return 'typed-user'
            }
        }
        const clockFactory: SyncProviderFactory<Clock> = () => ({
            now(): string {
                return 'typed-clock'
            }
        })
        const valueOverride = override(AUTH_READER).toValue(authReader)
        const factoryOverride = override(CLOCK).toFactory((context) => {
            expectTypeOf(context.get(AUTH_READER)).toEqualTypeOf<AuthReader>()

            return clockFactory(context)
        })
        const classOverride = override(AUTH_READER).toClass(ClassAuthReader)
        const asyncOverride = override(ASYNC_FLAG).toAsyncFactory(async (context) => {
            expectTypeOf(await context.getAsync(AUTH_READER)).toEqualTypeOf<AuthReader>()

            return {
                enabled: true
            }
        })
        const fakeAuthProvider = {
            token: AUTH_READER,
            useValue: authReader
        } satisfies FakeModuleProvider<AuthReader>
        const fakeAuthModule = fakeModule({
            id: 'testing-hardening-typed-auth',
            provides: [fakeAuthProvider]
        })
        const harness = createModuleHarness({
            module: contactRequestsModule,
            fakeModules: [fakeAuthModule],
            overrides: [override(CLOCK).toFactory(clockFactory)]
        })
        const runtimeOptions: CreateTestRuntimeOptions = {
            overrides: [valueOverride]
        }
        const composerOptions: CreateTestComposerOptions = {
            modules: [contactRequestsModule, fakeAuthModule],
            overrides: [factoryOverride]
        }

        expectTypeOf(valueOverride).toEqualTypeOf<TestValueOverride<AuthReader>>()
        expectTypeOf(factoryOverride).toEqualTypeOf<TestFactoryOverride<Clock>>()
        expectTypeOf(classOverride).toMatchTypeOf<TestClassOverride<AuthReader>>()
        expectTypeOf(asyncOverride).toEqualTypeOf<TestAsyncFactoryOverride<AsyncFlag>>()
        expectTypeOf(valueOverride).toMatchTypeOf<TestOverride<AuthReader>>()
        expectTypeOf(fakeAuthProvider.token).toEqualTypeOf<typeof AUTH_READER>()
        expectTypeOf(fakeAuthModule).toMatchTypeOf<FakeModuleDefinition>()
        expectTypeOf(fakeAuthModule).toMatchTypeOf<ModuleDefinition>()
        expectTypeOf(harness).toMatchTypeOf<ModuleHarness<typeof contactRequestsModule>>()
        expectTypeOf(harness.inspect()).toEqualTypeOf<ComposerInspection>()
        expectTypeOf(harness.getGraph()).toEqualTypeOf<ModuleGraph>()
        expectTypeOf(harness.compose()).toEqualTypeOf<Promise<ComposedRuntime>>()
        expectTypeOf(createTestRuntime(runtimeOptions)).toEqualTypeOf<Promise<ContainerRuntime>>()
        expectTypeOf(createTestComposer(composerOptions).inspect()).toEqualTypeOf<
            ComposerInspection
        >()
        expectTypeOf<RuntimeInspection>().toMatchTypeOf<GraphAssertionInput>()
        expectTypeOf<Parameters<typeof assertGraphHasCapability>[1]>().toEqualTypeOf<
            GraphCapabilityExpectation
        >()
        expectTypeOf<Parameters<typeof assertGraphHasRequiredPort>[1]>().toEqualTypeOf<
            GraphRequiredPortExpectation
        >()
        expectTypeOf<Parameters<typeof assertGraphHasBinding>[1]>().toEqualTypeOf<
            GraphBindingExpectation
        >()
        expectTypeOf<Parameters<typeof assertGraphHasEdge>[1]>().toEqualTypeOf<
            GraphEdgeExpectation
        >()
        expectTypeOf<Parameters<typeof assertDiagnosticReportHasDiagnostic>[0]>().toEqualTypeOf<
            DiagnosticReport
        >()
        expectTypeOf<Parameters<typeof assertDiagnosticReportHasDiagnostic>[1]>().toEqualTypeOf<
            DiagnosticExpectation
        >()

        const runtime = await createTestRuntime(runtimeOptions)

        expect(runtime.get(AUTH_READER)).toBe(authReader)

        await runtime.dispose()
    })
})
