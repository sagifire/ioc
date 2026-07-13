import type {
    ComposerAdapterSourceMetadata,
    ComposerAdapterSourceProviderMetadata,
    CapabilityProviderRegistrationKind,
    CapabilityProviderSource,
    ComposerBindingKind,
    InspectionProviderKind,
    ModuleCapabilityKind,
    ModuleCardinality,
    ModuleDependencyEdge,
    ModuleDependencyKind,
    RequiredPortSatisfaction,
    ModuleGraph
} from './composer'
import type { AsyncProviderInitializationMode, ProviderLifetime } from './container'
import type { ProviderInspection } from './container'
import type { ProviderRegistrationKey } from './provider-identity'
import type {
    NormalizedProviderDependencySelector,
    ProviderDependencyCoverage,
    ProviderDependencyTarget,
    ProviderNodeKind
} from './provider-metadata'

export const GRAPH_EXPORT_SCHEMA_VERSION = '1' as const
export const GRAPH_EXPORT_SCHEMA_VERSION_V2 = '2' as const

export interface GraphExportDocumentV1 {
    readonly schema: 'sagifire.ioc.graph'
    readonly schemaVersion: typeof GRAPH_EXPORT_SCHEMA_VERSION
    readonly graph: GraphExportGraphV1
}

export interface GraphExportDocumentV2 {
    readonly schema: 'sagifire.ioc.graph'
    readonly schemaVersion: typeof GRAPH_EXPORT_SCHEMA_VERSION_V2
    readonly graph: GraphExportGraphV2
}

export type GraphExportDocument = GraphExportDocumentV1 | GraphExportDocumentV2

export interface GraphExportV1Options {
    readonly schemaVersion?: typeof GRAPH_EXPORT_SCHEMA_VERSION
}

export interface GraphExportV2Options {
    readonly schemaVersion: typeof GRAPH_EXPORT_SCHEMA_VERSION_V2
}

export type GraphExportDirection = 'TB' | 'LR' | 'BT' | 'RL'

export interface GraphExportDotOptions {
    readonly graphName?: string
    readonly direction?: GraphExportDirection
}

export interface GraphExportMermaidOptions {
    readonly direction?: GraphExportDirection
}

export interface GraphExportGraphV1 {
    readonly modules: readonly GraphExportModuleV1[]
    readonly requiredPorts: readonly GraphExportRequiredPortV1[]
    readonly capabilities: readonly GraphExportCapabilityV1[]
    readonly bindings: readonly GraphExportBindingV1[]
    readonly edges: readonly GraphExportEdgeV1[]
}

export interface GraphExportGraphV2 extends GraphExportGraphV1 {
    readonly providers: readonly GraphExportProviderV2[]
    readonly providerDependencySelectors: readonly GraphExportProviderDependencySelectorV2[]
    readonly providerDependencyEdges: readonly GraphExportProviderDependencyEdgeV2[]
    readonly providerOwnershipEdges: readonly GraphExportProviderOwnershipEdgeV2[]
    readonly providerCoverage: readonly GraphExportProviderCoverageV2[]
    readonly coverage: 'complete' | 'partial' | 'none'
}

export interface GraphExportProviderV2 {
    readonly key: ProviderRegistrationKey
    readonly label: string
    readonly registrationKind: 'single' | 'multi'
    readonly providerKind: ProviderNodeKind
    readonly lifetime?: ProviderLifetime
    readonly initialization: AsyncProviderInitializationMode
    readonly scopeOwned?: true
}

export type GraphExportProviderDependencySelectorV2 = NormalizedProviderDependencySelector

export interface GraphExportProviderDependencyEdgeV2 {
    readonly selectorIndex: number
    readonly consumer: ProviderRegistrationKey
    readonly dependency: ProviderRegistrationKey
    readonly access: 'instance' | 'deferred'
}

export interface GraphExportProviderOwnershipEdgeV2 {
    readonly provider: ProviderRegistrationKey
    readonly owner: 'runtime' | 'scope'
}

export interface GraphExportProviderCoverageV2 {
    readonly provider: ProviderRegistrationKey
    readonly coverage: ProviderDependencyCoverage
}

export type GraphExportV2Input = ProviderInspection | (ModuleGraph & ProviderInspection)

export interface GraphExportModuleV1 {
    readonly id: string
    readonly version?: string
    readonly requiredPortIds: readonly string[]
    readonly capabilityIds: readonly string[]
}

export interface GraphExportRequiredPortV1 {
    readonly moduleId: string
    readonly tokenId: string
    readonly required: boolean
    readonly kind: ModuleDependencyKind
    readonly cardinality: ModuleCardinality
    readonly providerCount: number
    readonly satisfiedBy: RequiredPortSatisfaction
}

export interface GraphExportCapabilityProviderV1 {
    readonly source: CapabilityProviderSource
    readonly moduleId?: string
    readonly registrationKind: CapabilityProviderRegistrationKind
    readonly registrationIndex: number
}

export interface GraphExportCapabilityV1 {
    readonly moduleId: string
    readonly tokenId: string
    readonly kind: ModuleCapabilityKind
    readonly cardinality: ModuleCardinality
    readonly providers: readonly GraphExportCapabilityProviderV1[]
}

export interface GraphExportBindingV1 {
    readonly tokenId: string
    readonly kind: ComposerBindingKind
    readonly providerKind: InspectionProviderKind
    readonly lifetime?: ProviderLifetime
    readonly initialization?: AsyncProviderInitializationMode
    readonly adapterSource?: GraphExportAdapterSourceV1
}

export type GraphExportAdapterSourceProviderV1 =
    | GraphExportAdapterCapabilityProviderV1
    | GraphExportAdapterBindingProviderV1
    | GraphExportAdapterMultiBindingProviderV1

export interface GraphExportAdapterCapabilityProviderV1 {
    readonly source: 'module'
    readonly providerKind: 'capability'
    readonly moduleId: string
    readonly tokenId: string
    readonly capabilityKind: ModuleCapabilityKind
    readonly cardinality: ModuleCardinality
    readonly registrationKind: CapabilityProviderRegistrationKind
    readonly registrationIndex: number
}

export interface GraphExportAdapterBindingProviderV1 {
    readonly source: 'composition-root'
    readonly providerKind: 'binding'
    readonly tokenId: string
    readonly bindingKind: ComposerBindingKind
    readonly cardinality: 'single'
    readonly registrationIndex: number
}

export interface GraphExportAdapterMultiBindingProviderV1 {
    readonly source: 'composition-root'
    readonly providerKind: 'multi-binding'
    readonly tokenId: string
    readonly bindingKind: 'value' | 'factory' | 'async-factory' | 'async-resource'
    readonly cardinality: 'multi'
    readonly registrationIndex: number
}

export type GraphExportAdapterSourceV1 =
    GraphExportAdapterTokenSourceV1 | GraphExportAdapterObjectSourceV1

export interface GraphExportAdapterTokenSourceV1 {
    readonly kind: 'token'
    readonly tokenId: string
    readonly providers: readonly GraphExportAdapterSourceProviderV1[]
}

export interface GraphExportAdapterObjectSourceV1 {
    readonly kind: 'object'
    readonly properties: readonly GraphExportAdapterObjectSourcePropertyV1[]
}

export interface GraphExportAdapterObjectSourcePropertyV1 {
    readonly property: string
    readonly tokenId: string
    readonly providers: readonly GraphExportAdapterSourceProviderV1[]
}

export type GraphExportEdgeV1 =
    GraphExportCapabilityEdgeV1 | GraphExportBindingEdgeV1 | GraphExportAdapterSourceEdgeV1

interface GraphExportEdgeBaseV1 {
    readonly consumerModuleId: string
    readonly requiredTokenId: string
    readonly dependencyKind: ModuleDependencyKind
}

export interface GraphExportCapabilityEdgeV1 extends GraphExportEdgeBaseV1 {
    readonly edgeKind: 'capability'
    readonly providerModuleId: string
    readonly capabilityTokenId: string
    readonly capabilityKind: ModuleCapabilityKind
}

export interface GraphExportBindingEdgeV1 extends GraphExportEdgeBaseV1 {
    readonly edgeKind: 'binding'
    readonly bindingTokenId: string
    readonly bindingKind: ComposerBindingKind
}

export interface GraphExportAdapterSourceEdgeV1 extends GraphExportEdgeBaseV1 {
    readonly edgeKind: 'adapter-source'
    readonly adapterTargetTokenId: string
    readonly adapterSourceTokenId: string
    readonly adapterSourceKind: 'token' | 'object'
    readonly adapterSourceProperty?: string
    readonly sourceProvider?: GraphExportAdapterSourceProviderV1
}

export function createGraphExportDocument(
    graph: ModuleGraph,
    options?: GraphExportV1Options
): GraphExportDocumentV1
export function createGraphExportDocument(
    inspection: GraphExportV2Input,
    options: GraphExportV2Options
): GraphExportDocumentV2
export function createGraphExportDocument(
    input: ModuleGraph | GraphExportV2Input,
    options: GraphExportV1Options | GraphExportV2Options = {}
): GraphExportDocument {
    if (options.schemaVersion === GRAPH_EXPORT_SCHEMA_VERSION_V2) {
        return createGraphExportDocumentV2(input as GraphExportV2Input)
    }

    return createGraphExportDocumentV1(input as ModuleGraph)
}

function createGraphExportDocumentV1(graph: ModuleGraph): GraphExportDocumentV1 {
    return Object.freeze({
        schema: 'sagifire.ioc.graph',
        schemaVersion: GRAPH_EXPORT_SCHEMA_VERSION,
        graph: Object.freeze({
            modules: Object.freeze(
                graph.modules.map((moduleNode) => {
                    const base = {
                        id: moduleNode.id,
                        requiredPortIds: freezeStrings(moduleNode.requiredPortIds),
                        capabilityIds: freezeStrings(moduleNode.capabilityIds)
                    }

                    return moduleNode.version === undefined
                        ? Object.freeze(base)
                        : Object.freeze({ ...base, version: moduleNode.version })
                })
            ),
            requiredPorts: Object.freeze(
                graph.requiredPorts.map((port) => {
                    return Object.freeze({
                        moduleId: port.moduleId,
                        tokenId: port.tokenId,
                        required: port.required,
                        kind: port.kind,
                        cardinality: port.cardinality,
                        providerCount: port.providerCount,
                        satisfiedBy: port.satisfiedBy
                    })
                })
            ),
            capabilities: Object.freeze(
                graph.capabilities.map((capability) => {
                    return Object.freeze({
                        moduleId: capability.moduleId,
                        tokenId: capability.tokenId,
                        kind: capability.kind,
                        cardinality: capability.cardinality,
                        providers: Object.freeze(
                            capability.providers.map((provider) => {
                                const base = {
                                    source: provider.source,
                                    registrationKind: provider.registrationKind,
                                    registrationIndex: provider.registrationIndex
                                }

                                return provider.moduleId === undefined
                                    ? Object.freeze(base)
                                    : Object.freeze({ ...base, moduleId: provider.moduleId })
                            })
                        )
                    })
                })
            ),
            bindings: Object.freeze(graph.bindings.map(projectBinding)),
            edges: Object.freeze(graph.edges.map(projectEdge))
        })
    })
}

function createGraphExportDocumentV2(input: GraphExportV2Input): GraphExportDocumentV2 {
    const moduleGraph = isModuleGraph(input) ? input : createEmptyModuleGraph()
    const v1Graph = createGraphExportDocumentV1(moduleGraph).graph
    const providerGraph = input.providerGraph

    return Object.freeze({
        schema: 'sagifire.ioc.graph',
        schemaVersion: GRAPH_EXPORT_SCHEMA_VERSION_V2,
        graph: Object.freeze({
            ...v1Graph,
            providers: Object.freeze(
                providerGraph.nodes.map((node) => {
                    const provider: {
                        key: ProviderRegistrationKey
                        label: string
                        registrationKind: 'single' | 'multi'
                        providerKind: ProviderNodeKind
                        lifetime?: ProviderLifetime
                        initialization: AsyncProviderInitializationMode
                        scopeOwned?: true
                    } = {
                        key: cloneProviderKey(node.key),
                        label: formatProviderLabel(node.key),
                        registrationKind: node.registrationKind,
                        providerKind: node.providerKind,
                        initialization: node.initialization
                    }

                    if (node.lifetime !== undefined) {
                        provider.lifetime = node.lifetime
                    }
                    if (node.scopeOwned === true) {
                        provider.scopeOwned = true
                    }

                    return canonicalizeGraphExportProvider(provider)
                })
            ),
            providerDependencySelectors: Object.freeze(
                providerGraph.selectors.map(projectProviderSelector)
            ),
            providerDependencyEdges: Object.freeze(
                providerGraph.dependencyEdges.map((edge) => {
                    return Object.freeze({
                        selectorIndex: edge.selectorIndex,
                        consumer: cloneProviderKey(edge.consumer),
                        dependency: cloneProviderKey(edge.dependency),
                        access: edge.access
                    })
                })
            ),
            providerOwnershipEdges: Object.freeze(
                providerGraph.ownershipEdges.map((edge) => {
                    return Object.freeze({
                        provider: cloneProviderKey(edge.provider),
                        owner: edge.owner
                    })
                })
            ),
            providerCoverage: Object.freeze(
                providerGraph.providerCoverage.map((coverage) => {
                    return Object.freeze({
                        provider: cloneProviderKey(coverage.provider),
                        coverage: coverage.coverage
                    })
                })
            ),
            coverage: providerGraph.coverage
        })
    })
}

export function serializeGraphExport(document: GraphExportDocument): string {
    assertGraphExportDocument(document)

    const canonicalDocument =
        document.schemaVersion === GRAPH_EXPORT_SCHEMA_VERSION
            ? createGraphExportDocumentV1(document.graph)
            : canonicalizeGraphExportDocumentV2(document)

    return `${JSON.stringify(canonicalDocument, undefined, 4)}\n`
}

export function renderGraphExportDot(
    document: GraphExportDocument,
    options: GraphExportDotOptions = {}
): string {
    assertGraphExportDocument(document)
    const direction = options.direction ?? 'TB'
    const graphName = options.graphName ?? 'SagifireIocGraph'
    const lines = [`digraph "${escapeDot(graphName)}" {`, `    rankdir=${direction};`]

    forEachRenderNode(document, (id, label, kind) => {
        lines.push(`    ${id} [label="${escapeDot(label)}", shape=${dotShape(kind)}];`)
    })
    forEachRenderEdge(document, (sourceId, targetId, label) => {
        lines.push(`    ${sourceId} -> ${targetId} [label="${escapeDot(label)}"];`)
    })

    lines.push('}')
    return `${lines.join('\n')}\n`
}

export function renderGraphExportMermaid(
    document: GraphExportDocument,
    options: GraphExportMermaidOptions = {}
): string {
    assertGraphExportDocument(document)
    const lines = [`flowchart ${options.direction ?? 'TB'}`]

    forEachRenderNode(document, (id, label) => {
        lines.push(`    ${id}["${escapeMermaid(label)}"]`)
    })
    forEachRenderEdge(document, (sourceId, targetId, label) => {
        lines.push(`    ${sourceId} -->|"${escapeMermaid(label)}"| ${targetId}`)
    })

    return `${lines.join('\n')}\n`
}

type RenderNodeKind =
    | 'module'
    | 'required-port'
    | 'capability'
    | 'binding'
    | 'adapter-source'
    | 'provider'
    | 'owner'
    | 'coverage'

function forEachRenderNode(
    document: GraphExportDocument,
    visit: (id: string, label: string, kind: RenderNodeKind) => void
): void {
    document.graph.modules.forEach((moduleNode, index) => {
        const version = moduleNode.version === undefined ? '' : `\nversion: ${moduleNode.version}`
        visit(`module_${index}`, `module: ${moduleNode.id}${version}`, 'module')
    })
    document.graph.requiredPorts.forEach((port, index) => {
        visit(
            `required_port_${index}`,
            `required port: ${port.moduleId} / ${port.tokenId}\n${port.kind}, ${port.cardinality}`,
            'required-port'
        )
    })
    document.graph.capabilities.forEach((capability, index) => {
        visit(
            `capability_${index}`,
            `capability: ${capability.moduleId} / ${capability.tokenId}\n${capability.kind}, ${capability.cardinality}`,
            'capability'
        )
    })
    document.graph.bindings.forEach((binding, index) => {
        const lifetime = binding.lifetime === undefined ? '' : `, ${binding.lifetime}`
        visit(
            `binding_${index}`,
            `binding: ${binding.tokenId}\n${binding.kind}, ${binding.providerKind}${lifetime}`,
            'binding'
        )
    })
    document.graph.edges.forEach((edge, index) => {
        if (
            edge.edgeKind !== 'adapter-source' ||
            resolveAdapterSourceId(document, edge, index) !== `adapter_source_${index}`
        ) {
            return
        }
        const property =
            edge.adapterSourceProperty === undefined ? '' : ` / ${edge.adapterSourceProperty}`
        const provider =
            edge.sourceProvider === undefined
                ? 'unresolved provider'
                : `${edge.sourceProvider.providerKind}, registration ${edge.sourceProvider.registrationIndex}`
        visit(
            `adapter_source_${index}`,
            `adapter source: ${edge.adapterSourceTokenId}${property}\n${provider}`,
            'adapter-source'
        )
    })

    if (document.schemaVersion === GRAPH_EXPORT_SCHEMA_VERSION_V2) {
        document.graph.providers.forEach((provider, index) => {
            const lifetime = provider.lifetime === undefined ? '' : `, ${provider.lifetime}`
            const ownership = provider.scopeOwned === true ? '\nscope-owned value' : ''

            visit(
                `provider_${index}`,
                `${provider.label}\n${provider.providerKind}${lifetime}${ownership}`,
                'provider'
            )
        })

        if (document.graph.providerOwnershipEdges.some((edge) => edge.owner === 'runtime')) {
            visit('provider_owner_runtime', 'owner: runtime', 'owner')
        }
        if (document.graph.providerOwnershipEdges.some((edge) => edge.owner === 'scope')) {
            visit('provider_owner_scope', 'owner: scope', 'owner')
        }

        visit('provider_coverage', `provider coverage: ${document.graph.coverage}`, 'coverage')
    }
}

function forEachRenderEdge(
    document: GraphExportDocument,
    visit: (sourceId: string, targetId: string, label: string) => void
): void {
    document.graph.edges.forEach((edge, index) => {
        const targetId = findRequiredPortId(document, edge.consumerModuleId, edge.requiredTokenId)
        if (targetId === undefined) {
            throwUnrenderableEdge(index)
        }

        if (edge.edgeKind === 'capability') {
            const sourceId = findCapabilityId(
                document,
                edge.providerModuleId,
                edge.capabilityTokenId
            )
            if (sourceId === undefined) {
                throwUnrenderableEdge(index)
            }
            visit(sourceId, targetId, `${edge.edgeKind}: ${edge.dependencyKind}`)
            return
        }

        const adapterTargetId = findBindingId(
            document,
            edge.edgeKind === 'binding' ? edge.bindingTokenId : edge.adapterTargetTokenId
        )
        if (adapterTargetId === undefined) {
            throwUnrenderableEdge(index)
        }

        if (edge.edgeKind === 'binding') {
            visit(adapterTargetId, targetId, `${edge.edgeKind}: ${edge.dependencyKind}`)
            return
        }

        const sourceId = resolveAdapterSourceId(document, edge, index)
        const property =
            edge.adapterSourceProperty === undefined ? '' : ` / ${edge.adapterSourceProperty}`
        visit(sourceId, adapterTargetId, `adapter-source: ${edge.adapterSourceTokenId}${property}`)
    })

    if (document.schemaVersion === GRAPH_EXPORT_SCHEMA_VERSION_V2) {
        document.graph.providerDependencyEdges.forEach((edge, index) => {
            const consumerId = findProviderId(document, edge.consumer)
            const dependencyId = findProviderId(document, edge.dependency)

            if (consumerId === undefined || dependencyId === undefined) {
                throw new TypeError(
                    `Graph export provider dependency edge at index ${index} references a missing provider`
                )
            }

            visit(consumerId, dependencyId, `${edge.access} dependency`)
        })

        document.graph.providerOwnershipEdges.forEach((edge, index) => {
            const providerId = findProviderId(document, edge.provider)

            if (providerId === undefined) {
                throw new TypeError(
                    `Graph export provider ownership edge at index ${index} references a missing provider`
                )
            }

            visit(providerId, `provider_owner_${edge.owner}`, 'ownership')
        })
    }
}

function throwUnrenderableEdge(index: number): never {
    throw new TypeError(`Graph export edge at index ${index} references a missing node`)
}

function findRequiredPortId(
    document: GraphExportDocument,
    moduleId: string,
    tokenId: string
): string | undefined {
    const index = document.graph.requiredPorts.findIndex((port) => {
        return port.moduleId === moduleId && port.tokenId === tokenId
    })
    return index < 0 ? undefined : `required_port_${index}`
}

function findCapabilityId(
    document: GraphExportDocument,
    moduleId: string,
    tokenId: string
): string | undefined {
    const index = document.graph.capabilities.findIndex((capability) => {
        return capability.moduleId === moduleId && capability.tokenId === tokenId
    })
    return index < 0 ? undefined : `capability_${index}`
}

function findBindingId(document: GraphExportDocument, tokenId: string): string | undefined {
    const index = document.graph.bindings.findIndex((binding) => binding.tokenId === tokenId)
    return index < 0 ? undefined : `binding_${index}`
}

function findProviderId(
    document: GraphExportDocumentV2,
    key: ProviderRegistrationKey
): string | undefined {
    const index = document.graph.providers.findIndex((provider) => {
        return providerKeysEqual(provider.key, key)
    })

    return index < 0 ? undefined : `provider_${index}`
}

function resolveAdapterSourceId(
    document: GraphExportDocument,
    edge: GraphExportAdapterSourceEdgeV1,
    edgeIndex: number
): string {
    const provider = edge.sourceProvider
    if (provider !== undefined && provider.tokenId !== edge.adapterSourceTokenId) {
        throwUnrenderableEdge(edgeIndex)
    }
    if (provider?.source === 'module' && provider.providerKind === 'capability') {
        const id = findCapabilityId(document, provider.moduleId, provider.tokenId)
        if (id === undefined) {
            throwUnrenderableEdge(edgeIndex)
        }
        return id
    }
    if (provider?.source === 'composition-root' && provider.providerKind === 'binding') {
        const id = findBindingId(document, provider.tokenId)
        if (id === undefined) {
            throwUnrenderableEdge(edgeIndex)
        }
        return id
    }
    return `adapter_source_${edgeIndex}`
}

function dotShape(kind: RenderNodeKind): 'box' | 'ellipse' | 'hexagon' | 'diamond' | 'octagon' {
    if (kind === 'module') {
        return 'box'
    }
    if (kind === 'required-port') {
        return 'ellipse'
    }
    if (kind === 'capability') {
        return 'hexagon'
    }
    if (kind === 'adapter-source') {
        return 'ellipse'
    }
    if (kind === 'provider') {
        return 'octagon'
    }
    if (kind === 'owner' || kind === 'coverage') {
        return 'box'
    }
    return 'diamond'
}

function escapeDot(value: string): string {
    return stripControlCharacters(value)
        .replace(/\\/gu, '\\\\')
        .replace(/"/gu, '\\"')
        .replace(/\r\n|\r|\n/gu, '\\n')
}

function escapeMermaid(value: string): string {
    return stripControlCharacters(value)
        .replace(/&/gu, '&amp;')
        .replace(/"/gu, '&quot;')
        .replace(/</gu, '&lt;')
        .replace(/>/gu, '&gt;')
        .replace(/\r\n|\r|\n/gu, '<br/>')
}

function stripControlCharacters(value: string): string {
    return [...value]
        .filter((character) => {
            const codePoint = character.codePointAt(0)
            return (
                codePoint === undefined ||
                codePoint === 10 ||
                codePoint === 13 ||
                (codePoint >= 32 && codePoint !== 127)
            )
        })
        .join('')
}

function assertGraphExportDocument(document: GraphExportDocument): void {
    if (
        document.schema !== 'sagifire.ioc.graph' ||
        (document.schemaVersion !== GRAPH_EXPORT_SCHEMA_VERSION &&
            document.schemaVersion !== GRAPH_EXPORT_SCHEMA_VERSION_V2)
    ) {
        throw new TypeError(
            `Unsupported graph export schema: ${String(document.schema)}@${String(document.schemaVersion)}`
        )
    }
}

function canonicalizeGraphExportDocumentV2(document: GraphExportDocumentV2): GraphExportDocumentV2 {
    const v1Graph = createGraphExportDocumentV1(document.graph).graph

    return Object.freeze({
        schema: 'sagifire.ioc.graph',
        schemaVersion: GRAPH_EXPORT_SCHEMA_VERSION_V2,
        graph: Object.freeze({
            ...v1Graph,
            providers: Object.freeze(document.graph.providers.map(canonicalizeGraphExportProvider)),
            providerDependencySelectors: Object.freeze(
                document.graph.providerDependencySelectors.map(projectProviderSelector)
            ),
            providerDependencyEdges: Object.freeze(
                document.graph.providerDependencyEdges.map((edge) => {
                    return Object.freeze({
                        selectorIndex: edge.selectorIndex,
                        consumer: cloneProviderKey(edge.consumer),
                        dependency: cloneProviderKey(edge.dependency),
                        access: edge.access
                    })
                })
            ),
            providerOwnershipEdges: Object.freeze(
                document.graph.providerOwnershipEdges.map((edge) => {
                    return Object.freeze({
                        provider: cloneProviderKey(edge.provider),
                        owner: edge.owner
                    })
                })
            ),
            providerCoverage: Object.freeze(
                document.graph.providerCoverage.map((coverage) => {
                    return Object.freeze({
                        provider: cloneProviderKey(coverage.provider),
                        coverage: coverage.coverage
                    })
                })
            ),
            coverage: document.graph.coverage
        })
    })
}

function projectBinding(binding: ModuleGraph['bindings'][number]): GraphExportBindingV1 {
    const result: {
        tokenId: string
        kind: GraphExportBindingV1['kind']
        providerKind: GraphExportBindingV1['providerKind']
        lifetime?: ProviderLifetime
        initialization?: AsyncProviderInitializationMode
        adapterSource?: GraphExportAdapterSourceV1
    } = {
        tokenId: binding.tokenId,
        kind: binding.kind,
        providerKind: binding.providerKind
    }

    if (binding.lifetime !== undefined) {
        result.lifetime = binding.lifetime
    }
    if (binding.initialization !== undefined) {
        result.initialization = binding.initialization
    }
    if (binding.adapterSource !== undefined) {
        result.adapterSource = projectAdapterSource(binding.adapterSource)
    }

    return Object.freeze(result)
}

function projectAdapterSource(source: ComposerAdapterSourceMetadata): GraphExportAdapterSourceV1 {
    if (source.kind === 'token') {
        return Object.freeze({
            kind: 'token',
            tokenId: source.tokenId,
            providers: Object.freeze(source.providers.map(projectAdapterSourceProvider))
        })
    }

    return Object.freeze({
        kind: 'object',
        properties: Object.freeze(
            source.properties.map((property) => {
                return Object.freeze({
                    property: property.property,
                    tokenId: property.tokenId,
                    providers: Object.freeze(property.providers.map(projectAdapterSourceProvider))
                })
            })
        )
    })
}

function projectAdapterSourceProvider(
    provider: ComposerAdapterSourceProviderMetadata
): GraphExportAdapterSourceProviderV1 {
    return Object.freeze({ ...provider })
}

function projectEdge(edge: ModuleDependencyEdge): GraphExportEdgeV1 {
    const result = { ...edge }

    if (edge.edgeKind === 'adapter-source' && edge.sourceProvider !== undefined) {
        return Object.freeze({
            ...result,
            sourceProvider: projectAdapterSourceProvider(edge.sourceProvider)
        })
    }

    return Object.freeze(result)
}

function projectProviderSelector(
    selector: NormalizedProviderDependencySelector
): GraphExportProviderDependencySelectorV2 {
    if (selector.access === 'instance') {
        return Object.freeze({
            selectorIndex: selector.selectorIndex,
            consumer: cloneProviderKey(selector.consumer),
            target: cloneProviderTarget(selector.target),
            access: selector.access,
            cardinality: selector.cardinality,
            targetRegistrationKind: selector.targetRegistrationKind
        })
    }

    return Object.freeze({
        selectorIndex: selector.selectorIndex,
        consumer: cloneProviderKey(selector.consumer),
        target: cloneProviderTarget(selector.target),
        access: selector.access,
        cardinality: selector.cardinality,
        targetRegistrationKind: selector.targetRegistrationKind,
        via: cloneProviderTarget(selector.via),
        viaRegistrationKind: selector.viaRegistrationKind,
        scope: selector.scope
    })
}

function canonicalizeGraphExportProvider(provider: GraphExportProviderV2): GraphExportProviderV2 {
    const result: {
        key: ProviderRegistrationKey
        label: string
        registrationKind: 'single' | 'multi'
        providerKind: ProviderNodeKind
        initialization: AsyncProviderInitializationMode
        lifetime?: ProviderLifetime
        scopeOwned?: true
    } = {
        key: cloneProviderKey(provider.key),
        label: provider.label,
        registrationKind: provider.registrationKind,
        providerKind: provider.providerKind,
        initialization: provider.initialization
    }

    if (provider.lifetime !== undefined) {
        result.lifetime = provider.lifetime
    }
    if (provider.scopeOwned === true) {
        result.scopeOwned = true
    }

    return Object.freeze(result)
}

function cloneProviderKey(key: ProviderRegistrationKey): ProviderRegistrationKey {
    if (key.visibility === 'public') {
        return Object.freeze({
            visibility: key.visibility,
            tokenId: key.tokenId,
            registrationIndex: key.registrationIndex
        })
    }

    return Object.freeze({
        visibility: key.visibility,
        moduleId: key.moduleId,
        registrationIndex: key.registrationIndex
    })
}

function cloneProviderTarget(target: ProviderDependencyTarget): ProviderDependencyTarget {
    if (target.visibility === 'public') {
        return Object.freeze({ visibility: target.visibility, tokenId: target.tokenId })
    }

    return Object.freeze({
        visibility: target.visibility,
        moduleId: target.moduleId,
        selectorIndex: target.selectorIndex
    })
}

function formatProviderLabel(key: ProviderRegistrationKey): string {
    if (key.visibility === 'public') {
        return `provider: ${key.tokenId} #${key.registrationIndex}`
    }

    return `private provider #${key.registrationIndex} in module "${key.moduleId}"`
}

function providerKeysEqual(left: ProviderRegistrationKey, right: ProviderRegistrationKey): boolean {
    if (left.visibility === 'public' && right.visibility === 'public') {
        return left.tokenId === right.tokenId && left.registrationIndex === right.registrationIndex
    }

    if (left.visibility === 'private' && right.visibility === 'private') {
        return (
            left.moduleId === right.moduleId && left.registrationIndex === right.registrationIndex
        )
    }

    return false
}

function isModuleGraph(
    value: ModuleGraph | GraphExportV2Input
): value is ModuleGraph & ProviderInspection {
    const candidate = value as Partial<ModuleGraph>

    return (
        Array.isArray(candidate.modules) &&
        Array.isArray(candidate.requiredPorts) &&
        Array.isArray(candidate.capabilities) &&
        Array.isArray(candidate.bindings) &&
        Array.isArray(candidate.edges)
    )
}

function createEmptyModuleGraph(): ModuleGraph {
    return Object.freeze({
        modules: Object.freeze([]),
        requiredPorts: Object.freeze([]),
        capabilities: Object.freeze([]),
        bindings: Object.freeze([]),
        edges: Object.freeze([])
    })
}

function freezeStrings(values: readonly string[]): readonly string[] {
    return Object.freeze([...values])
}
