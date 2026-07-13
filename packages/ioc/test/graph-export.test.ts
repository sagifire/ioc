import { describe, expect, expectTypeOf, test } from 'vitest'
import {
    GRAPH_EXPORT_SCHEMA_VERSION,
    createComposer,
    createGraphExportDocument,
    defineModule,
    renderGraphExportDot,
    renderGraphExportMermaid,
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
            serializeUnknown({ ...document, schemaVersion: '3' })
        }).toThrow('Unsupported graph export schema: sagifire.ioc.graph@3')
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
            providerGraph: {
                nodes: [],
                selectors: [],
                dependencyEdges: [],
                ownershipEdges: [],
                providerCoverage: [],
                coverage: 'complete'
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

describe('graph export text renderers', () => {
    test('renders stable DOT and Mermaid golden output from the same v1 document', () => {
        const document = createGraphExportDocument(createRendererGraph())

        expect(renderGraphExportDot(document)).toBe(`digraph "SagifireIocGraph" {
    rankdir=TB;
    module_0 [label="module: consumer", shape=box];
    module_1 [label="module: provider\\nversion: 1.0.0", shape=box];
    required_port_0 [label="required port: consumer / catalog.items\\nexternal, single", shape=ellipse];
    capability_0 [label="capability: provider / catalog.items\\npublic-api, single", shape=hexagon];
    binding_0 [label="binding: clock\\nvalue, value", shape=diamond];
    capability_0 -> required_port_0 [label="capability: external"];
}
`)
        expect(renderGraphExportMermaid(document)).toBe(`flowchart TB
    module_0["module: consumer"]
    module_1["module: provider<br/>version: 1.0.0"]
    required_port_0["required port: consumer / catalog.items<br/>external, single"]
    capability_0["capability: provider / catalog.items<br/>public-api, single"]
    binding_0["binding: clock<br/>value, value"]
    capability_0 -->|"capability: external"| required_port_0
`)
    })

    test('uses collision-safe positional IDs while safely escaping Unicode and punctuation', () => {
        const document = createGraphExportDocument({
            modules: [
                {
                    id: 'same " id ] --> danger & <script> Україна',
                    requiredPortIds: [],
                    capabilityIds: []
                },
                {
                    id: 'same " id ] --> danger & <script> Україна',
                    requiredPortIds: [],
                    capabilityIds: []
                }
            ],
            requiredPorts: [],
            capabilities: [],
            bindings: [],
            edges: []
        })

        const dot = renderGraphExportDot(document, {
            graphName: 'graph " name\\path',
            direction: 'LR'
        })
        const mermaid = renderGraphExportMermaid(document, { direction: 'RL' })

        expect(dot).toContain('digraph "graph \\" name\\\\path"')
        expect(dot).toContain(
            'module_0 [label="module: same \\" id ] --> danger & <script> Україна"'
        )
        expect(dot).toContain(
            'module_1 [label="module: same \\" id ] --> danger & <script> Україна"'
        )
        expect(mermaid).toContain('flowchart RL')
        expect(mermaid).toContain(
            'module_0["module: same &quot; id ] --&gt; danger &amp; &lt;script&gt; Україна"]'
        )
        expect(mermaid).toContain(
            'module_1["module: same &quot; id ] --&gt; danger &amp; &lt;script&gt; Україна"]'
        )
    })

    test('preserves semantic order and inherits the v1 privacy boundary', () => {
        const secret = 'SENTINEL-private-provider-secret'
        const document = createGraphExportDocument(createGraph(secret, 'C:\\private\\secret'))
        const dot = renderGraphExportDot(document)
        const mermaid = renderGraphExportMermaid(document)

        expect(dot.indexOf('required_port_0')).toBeLessThan(dot.indexOf('capability_0'))
        expect(mermaid.indexOf('required_port_0')).toBeLessThan(mermaid.indexOf('capability_0'))
        expect(dot).not.toContain(secret)
        expect(mermaid).not.toContain(secret)
        expect(dot).not.toContain('C:\\private\\secret')
        expect(mermaid).not.toContain('C:\\private\\secret')
    })

    test('preserves binding and adapter-source provenance across both renderers', () => {
        const document = createGraphExportDocument(createAllEdgeKindsGraph())
        const dot = renderGraphExportDot(document)
        const mermaid = renderGraphExportMermaid(document)

        expect(dot).toContain('binding_0 -> required_port_0 [label="binding: external"];')
        expect(dot).toContain(
            'capability_0 -> binding_0 [label="adapter-source: source.capability"];'
        )
        expect(dot).toContain('binding_1 -> binding_0 [label="adapter-source: source.binding"];')
        expect(dot).toContain(
            'adapter_source_3 -> binding_0 [label="adapter-source: source.multi / plugins"];'
        )
        expect(dot).toContain(
            'adapter_source_3 [label="adapter source: source.multi / plugins\\nmulti-binding, registration 2"'
        )

        expect(mermaid).toContain('binding_0 -->|"binding: external"| required_port_0')
        expect(mermaid).toContain('capability_0 -->|"adapter-source: source.capability"| binding_0')
        expect(mermaid).toContain('binding_1 -->|"adapter-source: source.binding"| binding_0')
        expect(mermaid).toContain(
            'adapter_source_3 -->|"adapter-source: source.multi / plugins"| binding_0'
        )
        expect(mermaid).toContain(
            'adapter_source_3["adapter source: source.multi / plugins<br/>multi-binding, registration 2"]'
        )
    })

    test('rejects edges that cannot be traced to document-owned nodes', () => {
        const document = createGraphExportDocument({
            modules: [],
            requiredPorts: [],
            capabilities: [],
            bindings: [],
            edges: [
                {
                    edgeKind: 'binding',
                    consumerModuleId: 'missing',
                    requiredTokenId: 'missing.port',
                    dependencyKind: 'external',
                    bindingTokenId: 'missing.binding',
                    bindingKind: 'value'
                }
            ]
        })

        expect(() => renderGraphExportDot(document)).toThrow(
            'Graph export edge at index 0 references a missing node'
        )
        expect(() => renderGraphExportMermaid(document)).toThrow(
            'Graph export edge at index 0 references a missing node'
        )
    })

    test('rejects inconsistent adapter-source provider provenance', () => {
        const graph = createAllEdgeKindsGraph()
        const bindingEdge = graph.edges[0]
        const adapterEdge = graph.edges[1]
        if (
            bindingEdge === undefined ||
            adapterEdge?.edgeKind !== 'adapter-source' ||
            adapterEdge.sourceProvider === undefined
        ) {
            throw new Error('Expected adapter-source fixture edge')
        }
        const mismatchedDocument = createGraphExportDocument({
            ...graph,
            edges: [
                bindingEdge,
                {
                    ...adapterEdge,
                    sourceProvider: {
                        ...adapterEdge.sourceProvider,
                        tokenId: 'different.token'
                    }
                }
            ]
        })
        const missingProviderDocument = createGraphExportDocument({
            ...graph,
            capabilities: [],
            edges: [bindingEdge, adapterEdge]
        })

        expect(() => renderGraphExportDot(mismatchedDocument)).toThrow(
            'Graph export edge at index 1 references a missing node'
        )
        expect(() => renderGraphExportMermaid(missingProviderDocument)).toThrow(
            'Graph export edge at index 1 references a missing node'
        )
    })

    test('rejects unsupported schemas consistently and returns text only', () => {
        const document = createGraphExportDocument(createRendererGraph())
        const unknown = { ...document, schemaVersion: '3' } as unknown as GraphExportDocument

        expect(() => renderGraphExportDot(unknown)).toThrow(
            'Unsupported graph export schema: sagifire.ioc.graph@3'
        )
        expect(() => renderGraphExportMermaid(unknown)).toThrow(
            'Unsupported graph export schema: sagifire.ioc.graph@3'
        )
        expectTypeOf(renderGraphExportDot(document)).toEqualTypeOf<string>()
        expectTypeOf(renderGraphExportMermaid(document)).toEqualTypeOf<string>()
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

function createRendererGraph(): ModuleGraph {
    return {
        modules: [
            {
                id: 'consumer',
                requiredPortIds: ['catalog.items'],
                capabilityIds: []
            },
            {
                id: 'provider',
                version: '1.0.0',
                requiredPortIds: [],
                capabilityIds: ['catalog.items']
            }
        ],
        requiredPorts: [
            {
                moduleId: 'consumer',
                tokenId: 'catalog.items',
                required: true,
                kind: 'external',
                cardinality: 'single',
                providerCount: 1,
                satisfiedBy: 'capability'
            }
        ],
        capabilities: [
            {
                moduleId: 'provider',
                tokenId: 'catalog.items',
                kind: 'public-api',
                cardinality: 'single',
                providers: []
            }
        ],
        bindings: [
            {
                tokenId: 'clock',
                kind: 'value',
                providerKind: 'value'
            }
        ],
        edges: [
            {
                edgeKind: 'capability',
                consumerModuleId: 'consumer',
                requiredTokenId: 'catalog.items',
                dependencyKind: 'external',
                providerModuleId: 'provider',
                capabilityTokenId: 'catalog.items',
                capabilityKind: 'public-api'
            }
        ]
    }
}

function createAllEdgeKindsGraph(): ModuleGraph {
    return {
        modules: [],
        requiredPorts: [
            {
                moduleId: 'consumer',
                tokenId: 'target.adapter',
                required: true,
                kind: 'external',
                cardinality: 'single',
                providerCount: 1,
                satisfiedBy: 'binding'
            }
        ],
        capabilities: [
            {
                moduleId: 'source-module',
                tokenId: 'source.capability',
                kind: 'public-api',
                cardinality: 'single',
                providers: []
            }
        ],
        bindings: [
            {
                tokenId: 'target.adapter',
                kind: 'adapter',
                providerKind: 'factory'
            },
            {
                tokenId: 'source.binding',
                kind: 'value',
                providerKind: 'value'
            }
        ],
        edges: [
            {
                edgeKind: 'binding',
                consumerModuleId: 'consumer',
                requiredTokenId: 'target.adapter',
                dependencyKind: 'external',
                bindingTokenId: 'target.adapter',
                bindingKind: 'adapter'
            },
            {
                edgeKind: 'adapter-source',
                consumerModuleId: 'consumer',
                requiredTokenId: 'target.adapter',
                dependencyKind: 'external',
                adapterTargetTokenId: 'target.adapter',
                adapterSourceTokenId: 'source.capability',
                adapterSourceKind: 'token',
                sourceProvider: {
                    source: 'module',
                    providerKind: 'capability',
                    moduleId: 'source-module',
                    tokenId: 'source.capability',
                    capabilityKind: 'public-api',
                    cardinality: 'single',
                    registrationKind: 'bind',
                    registrationIndex: 0
                }
            },
            {
                edgeKind: 'adapter-source',
                consumerModuleId: 'consumer',
                requiredTokenId: 'target.adapter',
                dependencyKind: 'external',
                adapterTargetTokenId: 'target.adapter',
                adapterSourceTokenId: 'source.binding',
                adapterSourceKind: 'token',
                sourceProvider: {
                    source: 'composition-root',
                    providerKind: 'binding',
                    tokenId: 'source.binding',
                    bindingKind: 'value',
                    cardinality: 'single',
                    registrationIndex: 1
                }
            },
            {
                edgeKind: 'adapter-source',
                consumerModuleId: 'consumer',
                requiredTokenId: 'target.adapter',
                dependencyKind: 'external',
                adapterTargetTokenId: 'target.adapter',
                adapterSourceTokenId: 'source.multi',
                adapterSourceKind: 'object',
                adapterSourceProperty: 'plugins',
                sourceProvider: {
                    source: 'composition-root',
                    providerKind: 'multi-binding',
                    tokenId: 'source.multi',
                    bindingKind: 'factory',
                    cardinality: 'multi',
                    registrationIndex: 2
                }
            }
        ]
    }
}
