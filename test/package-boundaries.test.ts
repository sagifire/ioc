import { describe, expect, test } from 'vitest'

import * as core from '@sagifire/ioc'
import * as nextAdapter from '@sagifire/ioc-next'
import * as testing from '@sagifire/ioc-testing'

describe('package boundaries', () => {
    test('core public surface does not expose testing helpers', () => {
        const testingExportNames = [
            'createTestRuntime',
            'createTestComposer',
            'override',
            'fakeModule',
            'createModuleHarness',
            'assertGraphHasModule',
            'assertGraphHasCapability',
            'assertGraphHasRequiredPort',
            'assertGraphHasBinding',
            'assertGraphHasEdge',
            'assertDiagnosticReportOk',
            'assertDiagnosticReportHasDiagnostic',
            'assertErrorDiagnostic',
            'DuplicateTestOverrideError',
            'GraphAssertionError',
            'DiagnosticAssertionError'
        ]
        const publicExportViolations = testingExportNames.filter((exportName) => {
            return exportName in core
        })

        expect(publicExportViolations).toEqual([])
    })

    test('testing public surface does not expose Next.js adapter helpers', () => {
        const forbiddenExportNames = Object.keys(testing).filter((exportName) => {
            const normalizedExportName = exportName.toLowerCase()

            return (
                normalizedExportName.includes('next') ||
                normalizedExportName.includes('routehandler') ||
                normalizedExportName.includes('serveraction') ||
                normalizedExportName.includes('requestcontext')
            )
        })

        expect(forbiddenExportNames).toEqual([])
    })

    test('Next.js adapter package remains separate from testing helpers', () => {
        const nextExportNames = Object.keys(nextAdapter)
        const testingHelperNames = [
            'createTestRuntime',
            'createTestComposer',
            'override',
            'fakeModule',
            'createModuleHarness'
        ]
        const leakedTestingHelpers = testingHelperNames.filter((exportName) => {
            return exportName in nextAdapter
        })

        expect(nextExportNames).toEqual([])
        expect(leakedTestingHelpers).toEqual([])
    })
})
