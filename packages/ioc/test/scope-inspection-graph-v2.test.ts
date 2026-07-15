import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    GRAPH_EXPORT_SCHEMA_VERSION_V2,
    LifetimeValidationError,
    createComposer,
    createContainer,
    createGraphExportDocument,
    defineModule,
    renderGraphExportDot,
    renderGraphExportMermaid,
    serializeGraphExport,
    token,
    type GraphExportDocument,
    type GraphExportDocumentV1,
    type GraphExportDocumentV2,
    type ProviderInspection
} from '../src/index.js'

describe('scope-effective lifetime validation and inspection', () => {
    test('keeps ready and uninitialized sync singletons bound to base runtime targets', async () => {
        const dependency = token<string>('scope-effective.singleton.dependency')
        const coldConsumer = token<string>('scope-effective.singleton.cold')
        const readyConsumer = token<string>('scope-effective.singleton.ready')
        const container = createContainer({ lifetimeValidation: { mode: 'report' } })
        let coldExecutions = 0
        let readyExecutions = 0

        container.bind(dependency).toValue('base')
        container
            .bind(coldConsumer)
            .toFactory(
                (context) => {
                    coldExecutions += 1
                    return context.get(dependency)
                },
                { dependencies: [{ token: dependency, access: 'instance' }] }
            )
            .singleton()
        container
            .bind(readyConsumer)
            .toFactory(
                (context) => {
                    readyExecutions += 1
                    return context.get(dependency)
                },
                { dependencies: [{ token: dependency, access: 'instance' }] }
            )
            .singleton()

        const runtime = await container.freeze()

        expect(runtime.get(readyConsumer)).toBe('base')

        const scope = runtime.createScope({ values: [[dependency, 'child']] })

        expect(coldExecutions).toBe(0)
        expect(scope.get(coldConsumer)).toBe('base')
        expect(scope.get(readyConsumer)).toBe('base')
        expect(coldExecutions).toBe(1)
        expect(readyExecutions).toBe(1)
        expect(scope.get(dependency)).toBe('child')

        const coldEdge = scope
            .inspect()
            .providerGraph.dependencyEdges.find((edge) => edge.consumer.registrationIndex === 0)

        expect(coldEdge?.dependency).toMatchObject({
            visibility: 'public',
            tokenId: dependency.id,
            registrationIndex: 0
        })

        await scope.dispose()
        await runtime.dispose()
    })

    test('keeps an uninitialized async singleton and resource in the base domain', async () => {
        const dependency = token<string>('scope-effective.async.dependency')
        const asyncFactory = token<string>('scope-effective.async.factory')
        const asyncResource = token<string>('scope-effective.async.resource')
        const container = createContainer({ lifetimeValidation: { mode: 'report' } })
        let factoryExecutions = 0
        let resourceExecutions = 0

        container.bind(dependency).toValue('base')
        container
            .bind(asyncFactory)
            .toAsyncFactory(
                async (context) => {
                    factoryExecutions += 1
                    return context.get(dependency)
                },
                { dependencies: [{ token: dependency, access: 'instance' }] }
            )
            .singleton()
            .lazy()
        container
            .bind(asyncResource)
            .toAsyncResource(
                async (context) => {
                    resourceExecutions += 1
                    return { value: context.get(dependency), dispose(): void {} }
                },
                { dependencies: [{ token: dependency, access: 'instance' }] }
            )
            .singleton()
            .lazy()

        const runtime = await container.freeze()
        const scope = runtime.createScope({ values: [[dependency, 'child']] })

        expect(factoryExecutions).toBe(0)
        expect(resourceExecutions).toBe(0)
        await expect(scope.getAsync(asyncFactory)).resolves.toBe('base')
        await expect(scope.getAsync(asyncResource)).resolves.toBe('base')
        expect(factoryExecutions).toBe(1)
        expect(resourceExecutions).toBe(1)

        await scope.dispose()
        await runtime.dispose()
    })

    test('keeps singleton direct empty-multi selectors base-only while deferred targets use caller scope', async () => {
        const localOnlyMulti = token<string>('scope-effective.local-only-multi')
        const handle = token<() => readonly string[]>('scope-effective.local-only-handle')
        const directConsumer = token<readonly string[]>('scope-effective.local-only-direct')
        const deferredConsumer = token<string>('scope-effective.local-only-deferred')
        const container = createContainer({ lifetimeValidation: { mode: 'report' } })

        container.bind(handle).toValue(() => [])
        container
            .bind(directConsumer)
            .toFactory((context) => context.getAll(localOnlyMulti), {
                dependencies: [{ token: localOnlyMulti, access: 'instance', cardinality: 'multi' }]
            })
            .singleton()
        container
            .bind(deferredConsumer)
            .toFactory(() => 'deferred', {
                dependencies: [
                    {
                        token: localOnlyMulti,
                        access: 'deferred',
                        cardinality: 'multi',
                        via: handle,
                        scope: 'caller'
                    }
                ]
            })
            .singleton()

        const runtime = await container.freeze()
        const scope = runtime.createScope({ multiValues: [[localOnlyMulti, 'local']] })
        const inspection = scope.inspect()
        const directSelector = inspection.providerGraph.selectors.find((selector) => {
            return (
                selector.consumer.visibility === 'public' &&
                selector.consumer.tokenId === directConsumer.id
            )
        })
        const deferredSelector = inspection.providerGraph.selectors.find((selector) => {
            return (
                selector.consumer.visibility === 'public' &&
                selector.consumer.tokenId === deferredConsumer.id
            )
        })

        expect(scope.get(directConsumer)).toEqual([])
        expect(directSelector?.targetRegistrationKind).toBe('missing')
        expect(deferredSelector?.targetRegistrationKind).toBe('multi')
        expect(
            inspection.providerGraph.dependencyEdges.filter((edge) => {
                return (
                    edge.consumer.visibility === 'public' &&
                    edge.consumer.tokenId === directConsumer.id
                )
            })
        ).toEqual([])
        expect(
            inspection.providerGraph.dependencyEdges.filter((edge) => {
                return (
                    edge.consumer.visibility === 'public' &&
                    edge.consumer.tokenId === deferredConsumer.id
                )
            })
        ).toMatchObject([
            {
                dependency: {
                    visibility: 'public',
                    tokenId: localOnlyMulti.id,
                    registrationIndex: 0
                },
                access: 'deferred'
            }
        ])

        await scope.dispose()
        await runtime.dispose()
    })

    test('does not reinterpret a direct singleton empty-multi selector as a child local single', async () => {
        const localOnly = token<string>('scope-effective.local-single-vs-empty-multi')
        const singletonConsumer = token<readonly string[]>(
            'scope-effective.local-single-vs-empty-multi.consumer'
        )
        const container = createContainer()
        let executions = 0

        container
            .bind(singletonConsumer)
            .toFactory(
                (context) => {
                    executions += 1
                    return context.getAll(localOnly)
                },
                {
                    dependencies: [{ token: localOnly, access: 'instance', cardinality: 'multi' }]
                }
            )
            .singleton()

        const runtime = await container.freeze()
        const scope = runtime.createScope({ values: [[localOnly, 'local-single']] })
        const selector = scope.inspect().providerGraph.selectors[0]

        expect(executions).toBe(0)
        expect(selector?.targetRegistrationKind).toBe('missing')
        expect(scope.get(singletonConsumer)).toEqual([])
        expect(scope.get(localOnly)).toBe('local-single')
        expect(executions).toBe(1)

        await scope.dispose()
        await runtime.dispose()
    })

    test('rejects an invalid effective child before publication or factory execution', async () => {
        const localOnlyMulti = token<string>('scope-effective.failure.local-only-multi')
        const scopedConsumer = token<readonly string[]>('scope-effective.failure.consumer')
        const container = createContainer()
        let factoryExecutions = 0
        let callbackExecutions = 0

        container
            .bind(scopedConsumer)
            .toFactory(
                (context) => {
                    factoryExecutions += 1
                    return context.getAll(localOnlyMulti)
                },
                {
                    dependencies: [
                        { token: localOnlyMulti, access: 'instance', cardinality: 'multi' }
                    ]
                }
            )
            .scoped()

        const runtime = await container.freeze()
        const parent = runtime.createScope()

        expect(() => {
            parent.createChildScope({ values: [[localOnlyMulti, 'invalid-single']] })
        }).toThrow(LifetimeValidationError)
        await expect(
            parent.withChildScope({ values: [[localOnlyMulti, 'invalid-single']] }, () => {
                callbackExecutions += 1
                return undefined
            })
        ).rejects.toBeInstanceOf(LifetimeValidationError)
        expect(factoryExecutions).toBe(0)
        expect(callbackExecutions).toBe(0)

        const validChild = parent.createChildScope({
            multiValues: [[localOnlyMulti, 'valid-multi']]
        })

        expect(validChild.get(scopedConsumer)).toEqual(['valid-multi'])
        expect(factoryExecutions).toBe(1)

        await validChild.dispose()
        await parent.dispose()
        await runtime.dispose()
    })

    test('substitutes scoped, transient and deferred targets in nested effective order', async () => {
        const single = token<string>('scope-effective.single')
        const multi = token<string>('scope-effective.multi')
        const handle = token<() => string>('scope-effective.handle')
        const scopedConsumer = token<{
            readonly single: string
            readonly multi: readonly string[]
        }>('scope-effective.scoped-consumer')
        const transientConsumer = token<string>('scope-effective.transient-consumer')
        const deferredConsumer = token<string>('scope-effective.deferred-consumer')
        const singletonConsumer = token<readonly string[]>('scope-effective.singleton-consumer')
        const container = createContainer({ lifetimeValidation: { mode: 'report' } })
        let executions = 0

        container.bind(single).toValue('base-single')
        container.add(multi).toValue('base-first')
        container.add(multi).toValue('base-second')
        container.bind(handle).toValue(() => 'handle')
        container
            .bind(scopedConsumer)
            .toFactory(
                (context) => {
                    executions += 1
                    return { single: context.get(single), multi: context.getAll(multi) }
                },
                {
                    dependencies: [
                        { token: single, access: 'instance' },
                        { token: multi, access: 'instance', cardinality: 'multi' }
                    ]
                }
            )
            .scoped()
        container.bind(transientConsumer).toFactory(() => 'transient', {
            dependencies: [{ token: single, access: 'instance' }]
        })
        container.bind(deferredConsumer).toFactory(() => 'deferred', {
            dependencies: [{ token: single, access: 'deferred', via: handle, scope: 'caller' }]
        })
        container
            .bind(singletonConsumer)
            .toFactory((context) => context.getAll(multi), {
                dependencies: [{ token: multi, access: 'instance', cardinality: 'multi' }]
            })
            .singleton()

        const runtime = await container.freeze()
        const parent = runtime.createScope({
            values: [[single, 'parent-single']],
            multiValues: [[multi, 'parent-multi']]
        })
        const child = parent.createChildScope({
            values: [[single, 'child-single']],
            multiValues: [[multi, 'child-multi']]
        })
        const childInspection = child.inspect()
        const localNodes = childInspection.providerGraph.nodes.filter(
            (node) => node.scopeOwned === true
        )

        expect(executions).toBe(0)
        expect(localNodes).toHaveLength(3)
        expect(localNodes.map((node) => node.key)).toEqual([
            { visibility: 'public', tokenId: single.id, registrationIndex: 1 },
            { visibility: 'public', tokenId: multi.id, registrationIndex: 2 },
            { visibility: 'public', tokenId: multi.id, registrationIndex: 3 }
        ])
        expect(child.getAll(multi)).toEqual([
            'base-first',
            'base-second',
            'parent-multi',
            'child-multi'
        ])
        expect(child.get(singletonConsumer)).toEqual(['base-first', 'base-second'])

        const parentValue = parent.get(scopedConsumer)
        const childValue = child.get(scopedConsumer)

        expect(parentValue).toEqual({
            single: 'parent-single',
            multi: ['base-first', 'base-second', 'parent-multi']
        })
        expect(childValue).toEqual({
            single: 'child-single',
            multi: ['base-first', 'base-second', 'parent-multi', 'child-multi']
        })
        expect(parentValue).not.toBe(childValue)
        expect(executions).toBe(2)

        const childSingleEdges = childInspection.providerGraph.dependencyEdges.filter((edge) => {
            return edge.dependency.visibility === 'public' && edge.dependency.tokenId === single.id
        })

        expect(childSingleEdges.map((edge) => edge.dependency.registrationIndex)).toEqual([1, 1, 1])
        const singletonMultiEdges = childInspection.providerGraph.dependencyEdges.filter((edge) => {
            return (
                edge.consumer.visibility === 'public' &&
                edge.consumer.tokenId === singletonConsumer.id
            )
        })

        expect(singletonMultiEdges.map((edge) => edge.dependency.registrationIndex)).toEqual([0, 1])
        expect(childInspection.lifetimeValidation?.diagnostics).toMatchObject([
            {
                code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_SENSITIVE',
                details: { dependencyOwner: 'scope' }
            }
        ])
        expect(Object.isFrozen(childInspection)).toBe(true)
        expect(Object.isFrozen(childInspection.providerGraph)).toBe(true)
        expect(JSON.stringify(childInspection)).not.toContain('child-single')
        expect(JSON.stringify(childInspection)).not.toContain('child-multi')
        expectTypeOf(childInspection).toEqualTypeOf<ProviderInspection>()

        await child.dispose()
        await parent.dispose()
        await runtime.dispose()
    })
})

describe('graph export v2', () => {
    test('keeps the canonical v2 bytes and semantic order for a frozen input', () => {
        const input = createFrozenV2Inspection()
        const document = createGraphExportDocument(input, { schemaVersion: '2' })
        const serialized = serializeGraphExport(document)
        const dot = renderGraphExportDot(document)
        const mermaid = renderGraphExportMermaid(document)

        expect(Object.isFrozen(input)).toBe(true)
        expect(Object.isFrozen(input.providerGraph)).toBe(true)
        expect(Object.isFrozen(input.providerGraph.nodes)).toBe(true)
        expect(serialized).toBe(V2_CANONICAL_JSON_GOLDEN)
        expect(serializeGraphExport(createGraphExportDocument(input, { schemaVersion: '2' }))).toBe(
            serialized
        )
        expect(document.graph.providers.map((provider) => provider.key.registrationIndex)).toEqual([
            1, 0
        ])
        expect(serialized.endsWith('\n')).toBe(true)
        expect(serialized.endsWith('\n\n')).toBe(false)

        for (const output of [serialized, dot, mermaid]) {
            expect(output).not.toContain('\r')
            expect(output.endsWith('\n')).toBe(true)
            expect(output.endsWith('\n\n')).toBe(false)
            expect(output).not.toContain('SENTINEL.raw.private.token')
            expect(output).not.toContain('C:\\private\\provider-cache')
        }

        expect(renderGraphExportDot(document)).toBe(dot)
        expect(renderGraphExportMermaid(document)).toBe(mermaid)
    })

    test('rejects unknown envelopes from every supported version in every renderer', () => {
        const v1 = createGraphExportDocument({
            modules: [],
            requiredPorts: [],
            capabilities: [],
            bindings: [],
            edges: []
        })
        const v2 = createGraphExportDocument(createFrozenV2Inspection(), { schemaVersion: '2' })

        for (const document of [v1, v2]) {
            const unknownVersion = {
                ...document,
                schemaVersion: 'unknown'
            } as unknown as GraphExportDocument
            const unknownSchema = {
                ...document,
                schema: 'unknown.graph'
            } as unknown as GraphExportDocument

            for (const render of [
                serializeGraphExport,
                renderGraphExportDot,
                renderGraphExportMermaid
            ]) {
                expect(() => render(unknownVersion)).toThrow(TypeError)
                expect(() => render(unknownVersion)).toThrow(
                    'Unsupported graph export schema: sagifire.ioc.graph@unknown'
                )
                expect(() => render(unknownSchema)).toThrow(TypeError)
                expect(() => render(unknownSchema)).toThrow(
                    `Unsupported graph export schema: unknown.graph@${document.schemaVersion}`
                )
            }
        }
    })

    test('projects async kinds, ownership and private-safe identities without changing v1', async () => {
        const privateFactory = token<string>('SENTINEL.raw.private.async-factory')
        const privateResource = token<string>('SENTINEL.raw.private.async-resource')
        const publicApi = token<string>('graph-v2.public-api')
        const module = defineModule({
            id: 'graph-v2-module',
            provides: [{ token: publicApi, kind: 'public-api' }],
            setup(context) {
                context
                    .bind(privateFactory)
                    .toAsyncFactory(async () => 'SENTINEL.factory-value', { dependencies: [] })
                    .singleton()
                    .lazy()
                context
                    .bind(privateResource)
                    .toAsyncResource(
                        async () => ({
                            value: 'SENTINEL.resource-value',
                            dispose(): void {}
                        }),
                        { dependencies: [] }
                    )
                    .scoped()
                    .lazy()
                context.bind(publicApi).toFactory(() => 'public', {
                    dependencies: [{ token: privateFactory, access: 'instance' }]
                })
            }
        })
        const runtime = await createComposer({
            lifetimeValidation: { mode: 'report', coverage: 'summary' }
        })
            .use(module)
            .compose()
        const inspection = runtime.inspect()
        const v1 = createGraphExportDocument(inspection)
        const v1FromGraph = createGraphExportDocument(inspection.graph)
        const v2 = createGraphExportDocument(inspection, { schemaVersion: '2' })
        const serialized = serializeGraphExport(v2)
        const dot = renderGraphExportDot(v2)
        const mermaid = renderGraphExportMermaid(v2)

        expect(serializeGraphExport(v1)).toBe(serializeGraphExport(v1FromGraph))
        expect(serializeGraphExport(v1)).not.toContain('providerDependencyEdges')
        expect(v2.schemaVersion).toBe(GRAPH_EXPORT_SCHEMA_VERSION_V2)
        expect(v2.graph.providers.map((provider) => provider.providerKind)).toContain(
            'async-factory'
        )
        expect(v2.graph.providers.map((provider) => provider.providerKind)).toContain(
            'async-resource'
        )
        expect(v2.graph.providerOwnershipEdges).toContainEqual({
            provider: { visibility: 'private', moduleId: 'graph-v2-module', registrationIndex: 1 },
            owner: 'scope'
        })
        expect(v2.graph.providerDependencyEdges).toEqual(inspection.providerGraph.dependencyEdges)
        expect(v2.graph.providerOwnershipEdges).toEqual(inspection.providerGraph.ownershipEdges)
        expect(v2.graph.providerCoverage).toEqual(inspection.providerGraph.providerCoverage)
        expect(v2.graph.coverage).toBe(inspection.providerGraph.coverage)
        expect(serializeGraphExport(v2)).toBe(serialized)
        expect(renderGraphExportDot(v2)).toBe(dot)
        expect(renderGraphExportMermaid(v2)).toBe(mermaid)
        expect(dot).toContain('private provider #1 in module')
        expect(dot).toContain('ownership')
        expect(mermaid).toContain('provider coverage: complete')

        for (const output of [serialized, dot, mermaid]) {
            expect(output).not.toContain(privateFactory.id)
            expect(output).not.toContain(privateResource.id)
            expect(output).not.toContain('SENTINEL.factory-value')
            expect(output).not.toContain('SENTINEL.resource-value')
        }

        expectTypeOf(v1).toEqualTypeOf<GraphExportDocumentV1>()
        expectTypeOf(v2).toEqualTypeOf<GraphExportDocumentV2>()

        await runtime.dispose()
    })

    test('exports scope-owned local nodes without exporting their values', async () => {
        const dependency = token<string>('graph-v2.scope.dependency')
        const consumer = token<string>('graph-v2.scope.consumer')
        const container = createContainer({ lifetimeValidation: { mode: 'report' } })

        container.bind(dependency).toValue('base')
        container
            .bind(consumer)
            .toFactory(() => 'consumer', {
                dependencies: [{ token: dependency, access: 'instance' }]
            })
            .scoped()

        const runtime = await container.freeze()
        const scope = runtime.createScope({ values: [[dependency, 'SENTINEL.scope-value']] })
        const document = createGraphExportDocument(scope.inspect(), { schemaVersion: '2' })
        const serialized = serializeGraphExport(document)

        expect(document.graph.modules).toEqual([])
        expect(document.graph.providers).toContainEqual({
            key: { visibility: 'public', tokenId: dependency.id, registrationIndex: 1 },
            label: `provider: ${dependency.id} #1`,
            registrationKind: 'single',
            providerKind: 'value',
            lifetime: 'scoped',
            initialization: 'lazy',
            scopeOwned: true
        })
        expect(document.graph.providerOwnershipEdges).toContainEqual({
            provider: { visibility: 'public', tokenId: dependency.id, registrationIndex: 1 },
            owner: 'scope'
        })
        expect(serialized).not.toContain('SENTINEL.scope-value')

        await scope.dispose()
        await runtime.dispose()
    })
})

const V2_CANONICAL_JSON_GOLDEN = `{
    "schema": "sagifire.ioc.graph",
    "schemaVersion": "2",
    "graph": {
        "modules": [],
        "requiredPorts": [],
        "capabilities": [],
        "bindings": [],
        "edges": [],
        "providers": [
            {
                "key": {
                    "visibility": "public",
                    "tokenId": "z.consumer",
                    "registrationIndex": 1
                },
                "label": "provider: z.consumer #1",
                "registrationKind": "single",
                "providerKind": "factory",
                "initialization": "lazy",
                "lifetime": "transient"
            },
            {
                "key": {
                    "visibility": "private",
                    "moduleId": "safe.module",
                    "registrationIndex": 0
                },
                "label": ${JSON.stringify('private provider #0 in module "safe.module"')},
                "registrationKind": "single",
                "providerKind": "async-resource",
                "initialization": "lazy",
                "lifetime": "scoped",
                "scopeOwned": true
            }
        ],
        "providerDependencySelectors": [
            {
                "selectorIndex": 0,
                "consumer": {
                    "visibility": "public",
                    "tokenId": "z.consumer",
                    "registrationIndex": 1
                },
                "target": {
                    "visibility": "private",
                    "moduleId": "safe.module",
                    "selectorIndex": 0
                },
                "access": "instance",
                "cardinality": "single",
                "targetRegistrationKind": "single"
            }
        ],
        "providerDependencyEdges": [
            {
                "selectorIndex": 0,
                "consumer": {
                    "visibility": "public",
                    "tokenId": "z.consumer",
                    "registrationIndex": 1
                },
                "dependency": {
                    "visibility": "private",
                    "moduleId": "safe.module",
                    "registrationIndex": 0
                },
                "access": "instance"
            }
        ],
        "providerOwnershipEdges": [
            {
                "provider": {
                    "visibility": "private",
                    "moduleId": "safe.module",
                    "registrationIndex": 0
                },
                "owner": "scope"
            }
        ],
        "providerCoverage": [
            {
                "provider": {
                    "visibility": "public",
                    "tokenId": "z.consumer",
                    "registrationIndex": 1
                },
                "coverage": "declared"
            },
            {
                "provider": {
                    "visibility": "private",
                    "moduleId": "safe.module",
                    "registrationIndex": 0
                },
                "coverage": "declared"
            }
        ],
        "coverage": "complete"
    }
}
`

function createFrozenV2Inspection(): ProviderInspection & {
    readonly privateTokenId: string
    readonly cachePath: string
} {
    const publicKey = Object.freeze({
        visibility: 'public' as const,
        tokenId: 'z.consumer',
        registrationIndex: 1
    })
    const privateKey = Object.freeze({
        visibility: 'private' as const,
        moduleId: 'safe.module',
        registrationIndex: 0
    })

    return Object.freeze({
        providerGraph: Object.freeze({
            nodes: Object.freeze([
                Object.freeze({
                    key: publicKey,
                    registrationKind: 'single' as const,
                    providerKind: 'factory' as const,
                    lifetime: 'transient' as const,
                    initialization: 'lazy' as const
                }),
                Object.freeze({
                    key: privateKey,
                    registrationKind: 'single' as const,
                    providerKind: 'async-resource' as const,
                    lifetime: 'scoped' as const,
                    initialization: 'lazy' as const,
                    scopeOwned: true as const
                })
            ]),
            selectors: Object.freeze([
                Object.freeze({
                    selectorIndex: 0,
                    consumer: publicKey,
                    target: Object.freeze({
                        visibility: 'private' as const,
                        moduleId: 'safe.module',
                        selectorIndex: 0
                    }),
                    access: 'instance' as const,
                    cardinality: 'single' as const,
                    targetRegistrationKind: 'single' as const
                })
            ]),
            dependencyEdges: Object.freeze([
                Object.freeze({
                    selectorIndex: 0,
                    consumer: publicKey,
                    dependency: privateKey,
                    access: 'instance' as const
                })
            ]),
            ownershipEdges: Object.freeze([
                Object.freeze({ provider: privateKey, owner: 'scope' as const })
            ]),
            providerCoverage: Object.freeze([
                Object.freeze({ provider: publicKey, coverage: 'declared' as const }),
                Object.freeze({ provider: privateKey, coverage: 'declared' as const })
            ]),
            coverage: 'complete' as const
        }),
        privateTokenId: 'SENTINEL.raw.private.token',
        cachePath: 'C:\\private\\provider-cache'
    })
}
