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
    readonly bindingKind: 'value' | 'factory'
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
    if (
        document.schema !== 'sagifire.ioc.graph' ||
        document.schemaVersion !== GRAPH_EXPORT_SCHEMA_VERSION
    ) {
        throw new TypeError(
            `Unsupported graph export schema: ${String(document.schema)}@${String(document.schemaVersion)}`
        )
    }

    const canonicalDocument = createGraphExportDocument(document.graph)

    return `${JSON.stringify(canonicalDocument, undefined, 4)}\n`
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
