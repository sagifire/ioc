import { describe, expect, expectTypeOf, test } from 'vitest'
import { createGraphExportDocument, serializeGraphExport, type ModuleGraph } from '@sagifire/ioc'
import {
    GraphExportSnapshotAssertionError,
    assertGraphExportSnapshot,
    type GraphExportSnapshotInput
} from '../src/index'

describe('graph export snapshot assertions', () => {
    test('compares public graph inputs through canonical v1 JSON', () => {
        const graph = createGraph()
        const snapshot = serializeGraphExport(createGraphExportDocument(graph))

        expect(() => assertGraphExportSnapshot(graph, snapshot)).not.toThrow()
        expect(() =>
            assertGraphExportSnapshot(createGraphExportDocument(graph), snapshot)
        ).not.toThrow()
        expectTypeOf<ModuleGraph>().toMatchTypeOf<GraphExportSnapshotInput>()
    })

    test('reports the first byte-relevant line mismatch deterministically', () => {
        const graph = createGraph()
        const snapshot = serializeGraphExport(createGraphExportDocument(graph)).replace(
            'snapshot-module',
            'changed-module'
        )

        expect(() => assertGraphExportSnapshot(graph, snapshot)).toThrow(
            GraphExportSnapshotAssertionError
        )
        expect(captureMessage(() => assertGraphExportSnapshot(graph, snapshot))).toBe(
            [
                'Expected graph export to match the canonical JSON snapshot.',
                'First mismatch at line 7.',
                'Expected: "                \\"id\\": \\"changed-module\\","',
                'Actual: "                \\"id\\": \\"snapshot-module\\","'
            ].join('\n')
        )
    })

    test('does not expose excluded metadata through failures', () => {
        const secret = 'SENTINEL-testing-private-value'
        const graph = createGraph(secret)

        expect(captureMessage(() => assertGraphExportSnapshot(graph, '{}\n'))).not.toContain(secret)
    })
})

function createGraph(secret = 'safe-default'): ModuleGraph {
    return {
        modules: [
            {
                id: 'snapshot-module',
                metadata: {
                    valueType: 'string',
                    value: secret
                },
                requiredPortIds: [],
                capabilityIds: []
            }
        ],
        requiredPorts: [],
        capabilities: [],
        bindings: [],
        edges: []
    }
}

function captureMessage(callback: () => void): string {
    try {
        callback()
    } catch (error) {
        return error instanceof Error ? error.message : String(error)
    }

    return 'no error'
}
