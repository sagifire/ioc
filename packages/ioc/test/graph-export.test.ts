import { describe, expect, expectTypeOf, test } from 'vitest'
import {
    GRAPH_EXPORT_SCHEMA_VERSION,
    createComposer,
    createGraphExportDocument,
    defineModule,
    serializeGraphExport,
    token,
    type GraphExportDocument,
    type GraphExportDocumentV1,
    type ModuleGraph,
    type RuntimeInspection
} from '../src/index'

describe('graph export v1', () => {
    test('projects the safe public graph with an independent schema identity', () => {
        const document = createGraphExportDocument(createGraph())

        expect(GRAPH_EXPORT_SCHEMA_VERSION).toBe('1')
        expect(document).toEqual({
            schema: 'sagifire.ioc.graph',
            schemaVersion: '1',
            graph: {
                modules: [
                    {
                        id: 'consumer',
                        version: '2.0.0',
                        requiredPortIds: ['catalog.items'],
                        capabilityIds: []
                    }
                ],
                requiredPorts: [
                    {
                        moduleId: 'consumer',
                        tokenId: 'catalog.items',
                        required: true,
                        kind: 'external',
                        cardinality: 'multi',
                        providerCount: 2,
                        satisfiedBy: 'capability'
                    }
                ],
                capabilities: [
                    {
                        moduleId: 'catalog',
                        tokenId: 'catalog.items',
                        kind: 'public-api',
                        cardinality: 'multi',
                        providers: [
                            {
                                source: 'module',
                                moduleId: 'catalog',
                                registrationKind: 'add',
                                registrationIndex: 1
                            },
                            {
                                source: 'module',
                                moduleId: 'catalog',
                                registrationKind: 'add',
                                registrationIndex: 0
                            }
                        ]
                    }
                ],
                bindings: [],
                edges: []
            }
        })
    })

    test('preserves semantic registration order instead of globally sorting arrays', () => {
        const graph = createGraph()
        const document = createGraphExportDocument(graph)

        expect(document.graph.modules.map((moduleNode) => moduleNode.id)).toEqual(['consumer'])
        expect(
            document.graph.capabilities[0]?.providers.map((provider) => provider.registrationIndex)
        ).toEqual([1, 0])
        expect(
            graph.capabilities[0]?.providers.map((provider) => provider.registrationIndex)
        ).toEqual([1, 0])
    })

    test('serializes byte-for-byte canonically with omission and newline policy', () => {
        const document = createGraphExportDocument(createGraph())
        const first = serializeGraphExport(document)
        const second = serializeGraphExport(createGraphExportDocument(createGraph()))
        const reorderedDocument: GraphExportDocumentV1 = {
            graph: document.graph,
            schemaVersion: '1',
            schema: 'sagifire.ioc.graph'
        }

        expect(first).toBe(second)
        expect(serializeGraphExport(reorderedDocument)).toBe(first)
        expect(first.endsWith('\n')).toBe(true)
        expect(first.endsWith('\n\n')).toBe(false)
        expect(first).not.toContain('\r')
        expect(first).not.toContain('"metadata"')
        expect(first).not.toContain('"description"')
        expect(first).not.toContain(': null')
        expect(JSON.parse(first)).toEqual(createGraphExportDocument(createGraph()))
    })

    test('rejects unknown schema envelopes instead of relabeling them as v1', () => {
        const document = createGraphExportDocument(createGraph())
        const serializeUnknown = (value: unknown): string => {
            return serializeGraphExport(value as GraphExportDocument)
        }

        expect(() => {
            serializeUnknown({ ...document, schemaVersion: '2' })
        }).toThrow('Unsupported graph export schema: sagifire.ioc.graph@2')
        expect(() => {
            serializeUnknown({ ...document, schema: 'other.graph' })
        }).toThrow('Unsupported graph export schema: other.graph@1')
    })

    test('does not project arbitrary metadata, descriptions, inspection extras or private values', () => {
        const secret = 'SENTINEL-super-secret-value'
        const absolutePath = 'C:\\private\\workspace\\secret.txt'
        const graph = createGraph(secret, absolutePath)
        const runtimeInspection: RuntimeInspection = {
            ...graph,
            graph,
            validation: {
                ok: false,
                diagnostics: [
                    {
                        code: 'SENTINEL_DIAGNOSTIC',
                        severity: 'error',
                        message: secret
                    }
                ]
            },
            providerRegistrations: []
        }
        const serialized = serializeGraphExport(createGraphExportDocument(runtimeInspection))

        expect(serialized).not.toContain(secret)
        expect(serialized).not.toContain(absolutePath)
        expect(serialized).not.toContain('providerRegistrations')
        expect(serialized).not.toContain('validation')
    })

    test('does not execute module setup or provider factories', () => {
        let setupCalls = 0
        let factoryCalls = 0
        const publicApi = token<{ readonly value: string }>('export.public-api')
        const module = defineModule({
            id: 'export-module',
            metadata: {
                secret: 'SENTINEL-module-metadata'
            },
            provides: [
                {
                    token: publicApi,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                setupCalls += 1
                context.bind(publicApi).toFactory(() => {
                    factoryCalls += 1
                    return { value: 'created' }
                })
            }
        })
        const graph = createComposer().use(module).getGraph()

        createGraphExportDocument(graph)

        expect(setupCalls).toBe(0)
        expect(factoryCalls).toBe(0)
    })

    test('returns detached frozen data and exposes stable public types', () => {
        const graph = createGraph()
        const document = createGraphExportDocument(graph)

        expect(document).not.toBe(graph)
        expect(document.graph.modules).not.toBe(graph.modules)
        expect(Object.isFrozen(document)).toBe(true)
        expect(Object.isFrozen(document.graph)).toBe(true)
        expect(Object.isFrozen(document.graph.capabilities[0]?.providers)).toBe(true)
        expectTypeOf(document).toEqualTypeOf<GraphExportDocumentV1>()
        expectTypeOf(document).toMatchTypeOf<GraphExportDocument>()
        expectTypeOf(serializeGraphExport(document)).toEqualTypeOf<string>()
    })
})

function createGraph(secret = 'SENTINEL-metadata', absolutePath = '/private/secret'): ModuleGraph {
    return {
        modules: [
            {
                id: 'consumer',
                version: '2.0.0',
                metadata: {
                    valueType: 'string',
                    value: secret
                },
                requiredPortIds: ['catalog.items'],
                capabilityIds: []
            }
        ],
        requiredPorts: [
            {
                moduleId: 'consumer',
                tokenId: 'catalog.items',
                required: true,
                kind: 'external',
                cardinality: 'multi',
                providerCount: 2,
                description: absolutePath,
                satisfiedBy: 'capability'
            }
        ],
        capabilities: [
            {
                moduleId: 'catalog',
                tokenId: 'catalog.items',
                kind: 'public-api',
                cardinality: 'multi',
                description: secret,
                providers: [
                    {
                        source: 'module',
                        moduleId: 'catalog',
                        registrationKind: 'add',
                        registrationIndex: 1
                    },
                    {
                        source: 'module',
                        moduleId: 'catalog',
                        registrationKind: 'add',
                        registrationIndex: 0
                    }
                ]
            }
        ],
        bindings: [],
        edges: []
    }
}
