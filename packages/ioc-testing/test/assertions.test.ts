import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    DuplicateModuleIdError,
    MissingRequiredPortError,
    defineModule,
    diagnosticFromError,
    token,
    type ComposerInspection,
    type DiagnosticReport,
    type ModuleGraph,
    type RuntimeInspection
} from '@sagifire/ioc'
import {
    DiagnosticAssertionError,
    GraphAssertionError,
    assertDiagnosticReportHasDiagnostic,
    assertDiagnosticReportOk,
    assertErrorDiagnostic,
    assertGraphHasBinding,
    assertGraphHasCapability,
    assertGraphHasEdge,
    assertGraphHasModule,
    assertGraphHasRequiredPort,
    createTestComposer,
    fakeModule,
    override,
    type DiagnosticExpectation,
    type GraphAssertionInput,
    type GraphBindingExpectation,
    type GraphCapabilityExpectation,
    type GraphEdgeExpectation,
    type GraphRequiredPortExpectation
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

const AUTH_READER = token<AuthReader>('testing.assertions.auth-reader')
const CLOCK = token<Clock>('testing.assertions.clock')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsApi>('testing.assertions.public-api')
const MISSING = token<AuthReader>('testing.assertions.missing')

const contactRequestsModule = defineModule({
    id: 'testing-assertions-contact-requests',
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

const fakeAuthModule = fakeModule('testing-assertions-auth', {
    provides: [
        {
            token: AUTH_READER,
            useValue: {
                currentUserId(): string {
                    return 'test-user'
                }
            }
        }
    ]
})

describe('graph and diagnostic assertions', () => {
    test('asserts modules, capabilities, required ports, bindings and edges', async () => {
        const composer = createAssertionComposer()
        const graph = composer.getGraph()
        const inspection = composer.inspect()
        const runtime = await composer.compose()
        const runtimeInspection = runtime.inspect()

        expectTypeOf(graph).toEqualTypeOf<ModuleGraph>()
        expectTypeOf(inspection).toEqualTypeOf<ComposerInspection>()
        expectTypeOf(runtimeInspection).toEqualTypeOf<RuntimeInspection>()
        expectTypeOf(graph).toMatchTypeOf<GraphAssertionInput>()
        expectTypeOf(inspection).toMatchTypeOf<GraphAssertionInput>()
        expectTypeOf(runtimeInspection).toMatchTypeOf<GraphAssertionInput>()
        expectTypeOf<
            Parameters<typeof assertGraphHasCapability>[1]
        >().toEqualTypeOf<GraphCapabilityExpectation>()
        expectTypeOf<
            Parameters<typeof assertGraphHasRequiredPort>[1]
        >().toEqualTypeOf<GraphRequiredPortExpectation>()
        expectTypeOf<
            Parameters<typeof assertGraphHasBinding>[1]
        >().toEqualTypeOf<GraphBindingExpectation>()
        expectTypeOf<
            Parameters<typeof assertGraphHasEdge>[1]
        >().toEqualTypeOf<GraphEdgeExpectation>()

        assertGraphHasModule(graph, 'testing-assertions-contact-requests')
        assertGraphHasModule(inspection, 'testing-assertions-auth')
        assertGraphHasModule(runtimeInspection, 'testing-assertions-contact-requests')
        assertGraphHasCapability(graph, {
            moduleId: 'testing-assertions-contact-requests',
            tokenId: CONTACT_REQUESTS_PUBLIC_API.id,
            kind: 'public-api'
        })
        assertGraphHasRequiredPort(inspection, {
            moduleId: 'testing-assertions-contact-requests',
            tokenId: AUTH_READER.id,
            required: true,
            kind: 'external',
            satisfiedBy: 'capability'
        })
        assertGraphHasBinding(runtimeInspection, {
            tokenId: CLOCK.id,
            kind: 'value',
            providerKind: 'value'
        })
        assertGraphHasEdge(graph, {
            edgeKind: 'capability',
            consumerModuleId: 'testing-assertions-contact-requests',
            requiredTokenId: AUTH_READER.id,
            providerModuleId: 'testing-assertions-auth',
            capabilityTokenId: AUTH_READER.id,
            capabilityKind: 'public-api'
        })
        assertGraphHasEdge(runtimeInspection, {
            edgeKind: 'binding',
            consumerModuleId: 'testing-assertions-contact-requests',
            requiredTokenId: CLOCK.id,
            bindingTokenId: CLOCK.id,
            bindingKind: 'value'
        })

        await runtime.dispose()
    })

    test('produces deterministic graph assertion failure messages', () => {
        const graph = createAssertionComposer().getGraph()

        expect(captureMessage(() => assertGraphHasModule(graph, 'missing-module'))).toBe(
            [
                'Expected module graph to contain module "missing-module".',
                'Available modules:',
                '- "testing-assertions-contact-requests"',
                '- "testing-assertions-auth"'
            ].join('\n')
        )
        expect(
            captureMessage(() =>
                assertGraphHasCapability(graph, {
                    tokenId: MISSING.id,
                    kind: 'shared-service'
                })
            )
        ).toBe(
            [
                'Expected module graph to contain capability token "testing.assertions.missing", kind: "shared-service".',
                'Available capabilities:',
                '- module "testing-assertions-contact-requests" provides "testing.assertions.public-api" (public-api)',
                '- module "testing-assertions-auth" provides "testing.assertions.auth-reader" (public-api)'
            ].join('\n')
        )
        expect(
            captureMessage(() =>
                assertGraphHasRequiredPort(graph, {
                    moduleId: 'testing-assertions-contact-requests',
                    tokenId: AUTH_READER.id,
                    satisfiedBy: 'binding'
                })
            )
        ).toBe(
            [
                'Expected module graph to contain required port module "testing-assertions-contact-requests", token "testing.assertions.auth-reader", satisfiedBy: "binding".',
                'Available required ports:',
                '- module "testing-assertions-contact-requests" requires "testing.assertions.auth-reader" (external, required: true, satisfiedBy: capability)',
                '- module "testing-assertions-contact-requests" requires "testing.assertions.clock" (external, required: true, satisfiedBy: binding)'
            ].join('\n')
        )
        expect(
            captureMessage(() =>
                assertGraphHasBinding(graph, {
                    tokenId: MISSING.id,
                    kind: 'factory'
                })
            )
        ).toBe(
            [
                'Expected module graph to contain binding token "testing.assertions.missing", kind: "factory".',
                'Available bindings:',
                '- token "testing.assertions.clock" (kind: value, providerKind: value, lifetime: singleton)'
            ].join('\n')
        )
        expect(
            captureMessage(() =>
                assertGraphHasEdge(graph, {
                    edgeKind: 'binding',
                    requiredTokenId: AUTH_READER.id,
                    bindingKind: 'factory'
                })
            )
        ).toBe(
            [
                'Expected module graph to contain binding dependency edge, requiredTokenId: "testing.assertions.auth-reader", bindingKind: "factory".',
                'Available dependency edges:',
                '- capability: "testing-assertions-contact-requests" requires "testing.assertions.auth-reader" from "testing-assertions-auth" capability "testing.assertions.auth-reader" (external, public-api)',
                '- binding: "testing-assertions-contact-requests" requires "testing.assertions.clock" through binding "testing.assertions.clock" (external, value)'
            ].join('\n')
        )
        expect(() => assertGraphHasModule(graph, 'missing-module')).toThrow(GraphAssertionError)
    })

    test('asserts diagnostic reports and error-derived diagnostics', () => {
        const okReport: DiagnosticReport = {
            ok: true,
            diagnostics: []
        }
        const missingPortError = new MissingRequiredPortError(
            'testing-assertions-contact-requests',
            MISSING.id,
            'external'
        )
        const report: DiagnosticReport = {
            ok: false,
            diagnostics: [diagnosticFromError(missingPortError)]
        }

        expectTypeOf<
            Parameters<typeof assertDiagnosticReportOk>[0]
        >().toEqualTypeOf<DiagnosticReport>()
        expectTypeOf<
            Parameters<typeof assertDiagnosticReportHasDiagnostic>[1]
        >().toEqualTypeOf<DiagnosticExpectation>()
        expectTypeOf<Parameters<typeof assertErrorDiagnostic>[0]>().toEqualTypeOf<unknown>()
        expectTypeOf<
            Parameters<typeof assertErrorDiagnostic>[1]
        >().toEqualTypeOf<DiagnosticExpectation>()

        assertDiagnosticReportOk(okReport)
        assertDiagnosticReportHasDiagnostic(report, {
            code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
            severity: 'error',
            messageIncludes: 'Missing required port',
            details: {
                moduleId: 'testing-assertions-contact-requests',
                tokenId: MISSING.id,
                dependencyKind: 'external'
            }
        })
        assertErrorDiagnostic(new DuplicateModuleIdError('testing-assertions-duplicate'), {
            code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_ID',
            severity: 'error',
            message: 'Duplicate module id "testing-assertions-duplicate"',
            details: {
                moduleId: 'testing-assertions-duplicate'
            }
        })
    })

    test('produces deterministic diagnostic assertion failure messages', () => {
        const report: DiagnosticReport = {
            ok: false,
            diagnostics: [
                diagnosticFromError(
                    new MissingRequiredPortError(
                        'testing-assertions-contact-requests',
                        MISSING.id,
                        'external'
                    )
                )
            ]
        }

        expect(captureMessage(() => assertDiagnosticReportOk(report))).toBe(
            [
                'Expected diagnostic report to be ok with no diagnostics.',
                'Actual report:',
                'Diagnostic report: failed',
                'Diagnostics: 1',
                '1. [error] SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
                '   Message: Missing required port "testing.assertions.missing" for module "testing-assertions-contact-requests"',
                '   Details:',
                '     moduleId: testing-assertions-contact-requests',
                '     tokenId: testing.assertions.missing',
                '     dependencyKind: external'
            ].join('\n')
        )
        expect(
            captureMessage(() =>
                assertDiagnosticReportHasDiagnostic(report, {
                    code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_ID'
                })
            )
        ).toBe(
            [
                'Expected diagnostic report to contain diagnostic { code: "SAGIFIRE_IOC_DUPLICATE_MODULE_ID" }.',
                'Actual report:',
                'Diagnostic report: failed',
                'Diagnostics: 1',
                '1. [error] SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
                '   Message: Missing required port "testing.assertions.missing" for module "testing-assertions-contact-requests"',
                '   Details:',
                '     moduleId: testing-assertions-contact-requests',
                '     tokenId: testing.assertions.missing',
                '     dependencyKind: external'
            ].join('\n')
        )
        expect(
            captureMessage(() =>
                assertErrorDiagnostic(new DuplicateModuleIdError('actual-module'), {
                    code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_ID',
                    details: {
                        moduleId: 'expected-module'
                    }
                })
            )
        ).toBe(
            [
                'Expected error-derived diagnostic to match { code: "SAGIFIRE_IOC_DUPLICATE_MODULE_ID", details: { "moduleId": "expected-module" } }.',
                'Actual diagnostic:',
                'Diagnostic report: failed',
                'Diagnostics: 1',
                '1. [error] SAGIFIRE_IOC_DUPLICATE_MODULE_ID',
                '   Message: Duplicate module id "actual-module"',
                '   Details:',
                '     moduleId: actual-module'
            ].join('\n')
        )
        expect(() => assertDiagnosticReportOk(report)).toThrow(DiagnosticAssertionError)
    })

    test('does not mutate graph or diagnostic inputs', () => {
        const graph = createAssertionComposer().getGraph()
        const graphBefore = JSON.stringify(graph)
        const report: DiagnosticReport = {
            ok: false,
            diagnostics: [
                diagnosticFromError(
                    new MissingRequiredPortError(
                        'testing-assertions-contact-requests',
                        MISSING.id,
                        'external'
                    )
                )
            ]
        }
        const reportBefore = JSON.stringify(report)

        assertGraphHasModule(graph, 'testing-assertions-contact-requests')
        assertDiagnosticReportHasDiagnostic(report, {
            code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT'
        })

        try {
            assertGraphHasModule(graph, 'missing-module')
        } catch {
            // Expected failure path; mutation check follows.
        }

        try {
            assertDiagnosticReportOk(report)
        } catch {
            // Expected failure path; mutation check follows.
        }

        expect(JSON.stringify(graph)).toBe(graphBefore)
        expect(JSON.stringify(report)).toBe(reportBefore)
    })
})

function createAssertionComposer() {
    return createTestComposer({
        modules: [contactRequestsModule, fakeAuthModule],
        overrides: [
            override(CLOCK).toValue({
                now(): string {
                    return '2026-07-01'
                }
            })
        ]
    })
}

function captureMessage(callback: () => void): string {
    try {
        callback()
    } catch (error) {
        if (error instanceof Error) {
            return error.message
        }

        return String(error)
    }

    throw new Error('Expected callback to throw')
}
