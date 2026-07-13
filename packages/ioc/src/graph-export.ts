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

export const GRAPH_EXPORT_SCHEMA_VERSION = '1' as const

export interface GraphExportDocumentV1 {
    readonly schema: 'sagifire.ioc.graph'
    readonly schemaVersion: typeof GRAPH_EXPORT_SCHEMA_VERSION
    readonly graph: GraphExportGraphV1
}

export type GraphExportDocument = GraphExportDocumentV1

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

export function createGraphExportDocument(graph: ModuleGraph): GraphExportDocumentV1 {
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

export function serializeGraphExport(document: GraphExportDocument): string {
    assertGraphExportDocument(document)

    const canonicalDocument = createGraphExportDocument(document.graph)

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

type RenderNodeKind = 'module' | 'required-port' | 'capability' | 'binding' | 'adapter-source'

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

function dotShape(kind: RenderNodeKind): 'box' | 'ellipse' | 'hexagon' | 'diamond' {
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
        document.schemaVersion !== GRAPH_EXPORT_SCHEMA_VERSION
    ) {
        throw new TypeError(
            `Unsupported graph export schema: ${String(document.schema)}@${String(document.schemaVersion)}`
        )
    }
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

function freezeStrings(values: readonly string[]): readonly string[] {
    return Object.freeze([...values])
}
