import { formatDiagnostics, type ModuleCardinality } from '@sagifire/ioc'

import { GET } from '../app/api/contacts/[id]/route.js'
import { submitContact } from '../app/contact/actions.js'
import { appRuntime, createAppComposer } from './app-runtime.js'
import {
    CONTACT_REQUESTS_PUBLIC_API,
    REQUEST_ID,
    REQUEST_TAGS,
    type ContactSummary,
    type SubmitContactResult
} from './contact-requests.js'
import type { JsonResponse } from './http.js'

async function main(): Promise<void> {
    const composer = createAppComposer()
    const inspection = composer.inspect()

    if (!inspection.validation.ok) {
        throw new Error(formatDiagnostics(inspection.validation))
    }

    assertCapability(inspection.capabilities, REQUEST_ID.id, 'single')
    assertCapability(inspection.capabilities, REQUEST_TAGS.id, 'multi')
    assertCapability(inspection.capabilities, CONTACT_REQUESTS_PUBLIC_API.id, 'single')

    const runtime = await appRuntime.getRuntime()

    try {
        assertSame(await appRuntime.getRuntime(), runtime, 'cached runtime helper')

        const routeResponse = await GET(
            {
                method: 'GET',
                url: 'https://example.test/api/contacts/contact-1'
            },
            {
                params: {
                    id: 'contact-1'
                }
            }
        )

        assertContactResponse(routeResponse)

        const actionResult = await submitContact({
            requestId: 'action-request-1',
            email: 'contact@example.test',
            message: 'hello'
        })

        assertActionResult(actionResult)
    } finally {
        await runtime.dispose()
        appRuntime.reset()
    }
}

function assertCapability(
    capabilities: readonly { readonly tokenId: string; readonly cardinality: ModuleCardinality }[],
    tokenId: string,
    cardinality: ModuleCardinality
): void {
    const capability = capabilities.find((candidate) => {
        return candidate.tokenId === tokenId
    })

    assert(capability !== undefined, `expected graph capability ${tokenId}`)
    assertEqual(capability.cardinality, cardinality, `graph capability ${tokenId} cardinality`)
}

function assertContactResponse(response: JsonResponse<ContactSummary>): void {
    assertEqual(response.status, 200, 'route response status')
    assertEqual(response.body.id, 'contact-1', 'route contact id')
    assertEqual(response.body.requestId, 'contact-1', 'route request id')
    assertIncludes(response.body.contextTags, 'runtime:next-app-router', 'route runtime tag')
    assertIncludes(response.body.contextTags, 'route:GET /api/contacts/[id]', 'route boundary tag')
}

function assertActionResult(result: SubmitContactResult): void {
    assertEqual(result.requestId, 'action-request-1', 'action request id')
    assertEqual(result.accepted, true, 'action accepted flag')
    assertEqual(result.summary, 'contact@example.test:hello', 'action summary')
    assertIncludes(result.contextTags, 'runtime:next-app-router', 'action runtime tag')
    assertIncludes(result.contextTags, 'action:submit-contact', 'action boundary tag')
}

function assertSame(actual: unknown, expected: unknown, label: string): void {
    if (actual !== expected) {
        throw new Error(`${label}: expected identical values`)
    }
}

function assertIncludes(values: readonly string[], expected: string, label: string): void {
    if (!values.includes(expected)) {
        throw new Error(`${label}: expected ${expected}`)
    }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
    if (actual !== expected) {
        throw new Error(`${label}: expected ${String(expected)}, received ${String(actual)}`)
    }
}

function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message)
    }
}

await main()
