import {
    createContainer,
    type AsyncFactoryBinding,
    type AsyncResourceBinding,
    type BindingBuilder,
    type ClassConstructor,
    type ContainerBuilder,
    type ContainerRuntime,
    type CreateScopeOptions,
    type AsyncProviderInitializationMode,
    type LifetimeBinding,
    type MultiBindingBuilder,
    type ProviderLifetime,
    type ProviderRegistrationKind,
    type ResolutionContext,
    type Scope,
    type ScopeCallback,
    type ScopeLocalValue
} from './container'
import { SagifireIocError, diagnosticFromError } from './diagnostics'
import type { Diagnostic, DiagnosticReport } from './diagnostics'
import type { Token } from './tokens'

export type ModuleDependencyKind = 'external' | 'shared'

export type ModuleCapabilityKind =
    | 'public-api'
    | 'admin-contribution'
    | 'event-publisher'
    | 'event-subscriber'
    | 'shared-service'
    | 'custom'

export interface ModuleDependencyDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly required: boolean
    readonly kind: ModuleDependencyKind
    readonly description?: string
}

export interface ModuleDependencyDefinitionInput<TValue = unknown> {
    readonly token: Token<TValue>
    readonly required?: boolean
    readonly kind?: ModuleDependencyKind
    readonly description?: string
}

export interface ModuleCapabilityDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly kind: ModuleCapabilityKind
    readonly description?: string
}

export interface ModuleSetupContext extends ResolutionContext {
    readonly moduleId: string

    bind<TValue>(token: Token<TValue>): BindingBuilder<TValue>
    add<TValue>(token: Token<TValue>): MultiBindingBuilder<TValue>
}

export interface ModuleSetupResult<TMetadata = unknown> {
    readonly capabilities?: readonly unknown[]
    readonly metadata?: TMetadata
}

export type ModuleSetupFunction<TMetadata = unknown> = (
    context: ModuleSetupContext
) => void | ModuleSetupResult<TMetadata> | Promise<void | ModuleSetupResult<TMetadata>>

export interface ModuleDefinition<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinition[] = readonly ModuleDependencyDefinition[],
    TProvides extends readonly ModuleCapabilityDefinition[] = readonly ModuleCapabilityDefinition[]
> {
    readonly id: string
    readonly version?: string
    readonly metadata?: TMetadata
    readonly requires: TRequires
    readonly provides: TProvides
    readonly setup: ModuleSetupFunction<TMetadata>
}

export interface ModuleDefinitionInput<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinition[] = readonly ModuleCapabilityDefinition[]
> {
    readonly id: string
    readonly version?: string
    readonly metadata?: TMetadata
    readonly requires?: TRequires
    readonly provides?: TProvides
    readonly setup: ModuleSetupFunction<TMetadata>
}

type Awaitable<TValue> = TValue | Promise<TValue>

export type ComposerBindingKind = 'value' | 'factory' | 'class' | 'async-factory'

export type InspectionProviderKind =
    | 'value'
    | 'factory'
    | 'class'
    | 'async-factory'
    | 'async-resource'

export type RequiredPortSatisfaction = 'binding' | 'capability' | 'optional' | 'missing'

export type ModuleDependencyEdgeKind = 'capability' | 'binding'

export interface ComposerBindingContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
}

export type ComposerBindingFactory<TValue> = (context: ComposerBindingContext) => TValue

export type ComposerAsyncBindingFactory<TValue> = (
    context: ComposerBindingContext
) => Awaitable<TValue>

export interface ComposerBindingBuilder<TValue> {
    toValue(value: TValue): void
    toFactory(factory: ComposerBindingFactory<TValue>): void
    toClass(classConstructor: ClassConstructor<TValue>): void
    toAsyncFactory(factory: ComposerAsyncBindingFactory<TValue>): void
}

export interface Composer {
    use(moduleDefinition: ModuleDefinition): Composer
    bind<TValue>(token: Token<TValue>): ComposerBindingBuilder<TValue>
    validate(): DiagnosticReport
    inspect(): ComposerInspection
    getGraph(): ModuleGraph
    prepare(): Promise<PreparedComposition>
    compose(): Promise<ComposedRuntime>
}

export interface ComposedRuntime {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    createScope(options?: CreateScopeOptions): Scope
    withScope<TValue>(callback: ScopeCallback<TValue>): Promise<TValue>
    withScope<TValue>(options: CreateScopeOptions, callback: ScopeCallback<TValue>): Promise<TValue>
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
    inspect(): RuntimeInspection
    dispose(): Promise<void>
}

export interface InspectionMetadata {
    readonly valueType: string
    readonly value?: string | number | boolean | null
}

export interface ModuleNodeMetadata {
    readonly id: string
    readonly version?: string
    readonly metadata?: InspectionMetadata
    readonly requiredPortIds: readonly string[]
    readonly capabilityIds: readonly string[]
}

export interface RequiredPortMetadata {
    readonly moduleId: string
    readonly tokenId: string
    readonly required: boolean
    readonly kind: ModuleDependencyKind
    readonly description?: string
    readonly satisfiedBy: RequiredPortSatisfaction
}

export interface CapabilityMetadata {
    readonly moduleId: string
    readonly tokenId: string
    readonly kind: ModuleCapabilityKind
    readonly description?: string
}

export interface CompositionBindingMetadata {
    readonly tokenId: string
    readonly kind: ComposerBindingKind
    readonly providerKind: InspectionProviderKind
    readonly lifetime?: ProviderLifetime
    readonly initialization?: AsyncProviderInitializationMode
}

export interface ModuleDependencyEdgeBase {
    readonly edgeKind: ModuleDependencyEdgeKind
    readonly consumerModuleId: string
    readonly requiredTokenId: string
    readonly dependencyKind: ModuleDependencyKind
}

export interface CapabilityDependencyEdge extends ModuleDependencyEdgeBase {
    readonly edgeKind: 'capability'
    readonly providerModuleId: string
    readonly capabilityTokenId: string
    readonly capabilityKind: ModuleCapabilityKind
}

export interface BindingDependencyEdge extends ModuleDependencyEdgeBase {
    readonly edgeKind: 'binding'
    readonly bindingTokenId: string
    readonly bindingKind: ComposerBindingKind
}

export type ModuleDependencyEdge = CapabilityDependencyEdge | BindingDependencyEdge

export interface ProviderRegistrationProviderSummary {
    readonly providerKind: InspectionProviderKind
    readonly lifetime?: ProviderLifetime
    readonly initialization?: AsyncProviderInitializationMode
}

export interface ProviderRegistrationSummary {
    readonly moduleId: string
    readonly tokenId: string
    readonly capabilityKind: ModuleCapabilityKind
    readonly visibility: 'exported'
    readonly registrationKind: ProviderRegistrationKind
    readonly providers: readonly ProviderRegistrationProviderSummary[]
}

export interface ModuleGraph {
    readonly modules: readonly ModuleNodeMetadata[]
    readonly requiredPorts: readonly RequiredPortMetadata[]
    readonly capabilities: readonly CapabilityMetadata[]
    readonly bindings: readonly CompositionBindingMetadata[]
    readonly edges: readonly ModuleDependencyEdge[]
}

export interface ComposerInspection extends ModuleGraph {
    readonly graph: ModuleGraph
    readonly validation: DiagnosticReport
}

export interface RuntimeInspection extends ModuleGraph {
    readonly graph: ModuleGraph
    readonly validation: DiagnosticReport
    readonly providerRegistrations: readonly ProviderRegistrationSummary[]
}

export interface PreparedCompositionModule {
    readonly id: string
    readonly version?: string
}

export interface PreparedCompositionCapability {
    readonly moduleId: string
    readonly tokenId: string
    readonly kind: ModuleCapabilityKind
    readonly registrationKind: 'single' | 'multi'
}

export interface PreparedComposition {
    readonly modules: readonly PreparedCompositionModule[]
    readonly capabilities: readonly PreparedCompositionCapability[]
}

export interface InvalidModuleDefinitionErrorDetails {
    readonly moduleId?: string
    readonly reason: string
    readonly value?: string | number | boolean | null
    readonly valueType?: string
}

export interface DuplicateModuleTokenErrorDetails {
    readonly moduleId: string
    readonly tokenId: string
    readonly section: 'requires' | 'provides'
}

export interface DuplicateModuleCapabilityErrorDetails extends DuplicateModuleTokenErrorDetails {
    readonly moduleIds?: readonly string[]
}

export interface DuplicateModuleIdErrorDetails {
    readonly moduleId: string
}

export interface MissingRequiredPortErrorDetails {
    readonly moduleId: string
    readonly tokenId: string
    readonly dependencyKind: ModuleDependencyKind
}

export interface InvalidComposerBindingErrorDetails {
    readonly tokenId: string
    readonly bindingKind: ComposerBindingKind
    readonly reason: 'missing-required-port'
}

export interface ModuleCycleErrorDetails {
    readonly moduleIdPath: readonly string[]
    readonly tokenIdPath: readonly string[]
    readonly edgeKinds: readonly ModuleDependencyEdgeKind[]
}

export interface ComposerValidationErrorDetails {
    readonly diagnosticCount: number
}

export type PrivateProviderAccessReason = 'composition-not-ready' | 'token-not-visible'

export interface PrivateProviderAccessErrorDetails {
    readonly moduleId: string | undefined
    readonly tokenId: string
    readonly requester: 'module' | 'composer-binding' | 'runtime'
    readonly reason: PrivateProviderAccessReason
}

export interface MissingModuleProviderErrorDetails {
    readonly moduleId: string
    readonly tokenId: string
}

export class InvalidModuleDefinitionError extends SagifireIocError<InvalidModuleDefinitionErrorDetails> {
    override readonly name = 'InvalidModuleDefinitionError'
    override readonly code = 'SAGIFIRE_IOC_INVALID_MODULE_DEFINITION'
    readonly moduleId: string | undefined
    readonly reason: string

    constructor(reason: string, options: InvalidModuleDefinitionErrorOptions = {}) {
        const details = createInvalidModuleDefinitionDetails(reason, options)

        super({
            code: 'SAGIFIRE_IOC_INVALID_MODULE_DEFINITION',
            message: formatInvalidModuleDefinitionMessage(reason, details.moduleId),
            details
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = details.moduleId
        this.reason = reason
    }
}

export class DuplicateModuleDependencyError extends SagifireIocError<DuplicateModuleTokenErrorDetails> {
    override readonly name = 'DuplicateModuleDependencyError'
    override readonly code = 'SAGIFIRE_IOC_DUPLICATE_MODULE_DEPENDENCY'
    readonly moduleId: string
    readonly tokenId: string

    constructor(moduleId: string, tokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_DEPENDENCY',
            message: `Duplicate required port "${tokenId}" in module "${moduleId}"`,
            details: {
                moduleId,
                tokenId,
                section: 'requires'
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = moduleId
        this.tokenId = tokenId
    }
}

export class DuplicateModuleCapabilityError extends SagifireIocError<DuplicateModuleCapabilityErrorDetails> {
    override readonly name = 'DuplicateModuleCapabilityError'
    override readonly code = 'SAGIFIRE_IOC_DUPLICATE_MODULE_CAPABILITY'
    readonly moduleId: string
    readonly moduleIds: readonly string[]
    readonly tokenId: string

    constructor(moduleId: string, tokenId: string)
    constructor(moduleIds: readonly [string, string, ...string[]], tokenId: string)
    constructor(moduleIdOrIds: string | readonly [string, string, ...string[]], tokenId: string) {
        const moduleId =
            typeof moduleIdOrIds === 'string' ? moduleIdOrIds : moduleIdOrIds[0]
        const moduleIds =
            typeof moduleIdOrIds === 'string' ? [moduleIdOrIds] : [...moduleIdOrIds]
        const details =
            typeof moduleIdOrIds === 'string'
                ? {
                      moduleId,
                      tokenId,
                      section: 'provides' as const
                  }
                : {
                      moduleId,
                      moduleIds,
                      tokenId,
                      section: 'provides' as const
                  }
        const message =
            typeof moduleIdOrIds === 'string'
                ? `Duplicate provided capability "${tokenId}" in module "${moduleId}"`
                : `Duplicate provided capability "${tokenId}" in modules: ${moduleIds.join(', ')}`

        super({
            code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_CAPABILITY',
            message,
            details
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = moduleId
        this.moduleIds = moduleIds
        this.tokenId = tokenId
    }
}

export class DuplicateModuleIdError extends SagifireIocError<DuplicateModuleIdErrorDetails> {
    override readonly name = 'DuplicateModuleIdError'
    override readonly code = 'SAGIFIRE_IOC_DUPLICATE_MODULE_ID'
    readonly moduleId: string

    constructor(moduleId: string) {
        super({
            code: 'SAGIFIRE_IOC_DUPLICATE_MODULE_ID',
            message: `Duplicate module id "${moduleId}"`,
            details: {
                moduleId
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = moduleId
    }
}

export class MissingRequiredPortError extends SagifireIocError<MissingRequiredPortErrorDetails> {
    override readonly name = 'MissingRequiredPortError'
    override readonly code = 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT'
    readonly moduleId: string
    readonly tokenId: string
    readonly dependencyKind: ModuleDependencyKind

    constructor(moduleId: string, tokenId: string, dependencyKind: ModuleDependencyKind) {
        super({
            code: 'SAGIFIRE_IOC_MISSING_REQUIRED_PORT',
            message: `Missing required port "${tokenId}" for module "${moduleId}"`,
            details: {
                moduleId,
                tokenId,
                dependencyKind
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = moduleId
        this.tokenId = tokenId
        this.dependencyKind = dependencyKind
    }
}

export class InvalidComposerBindingError extends SagifireIocError<InvalidComposerBindingErrorDetails> {
    override readonly name = 'InvalidComposerBindingError'
    override readonly code = 'SAGIFIRE_IOC_INVALID_COMPOSER_BINDING'
    readonly tokenId: string
    readonly bindingKind: ComposerBindingKind
    readonly reason: 'missing-required-port'

    constructor(
        tokenId: string,
        bindingKind: ComposerBindingKind,
        reason: 'missing-required-port' = 'missing-required-port'
    ) {
        super({
            code: 'SAGIFIRE_IOC_INVALID_COMPOSER_BINDING',
            message:
                `Invalid composer binding for token "${tokenId}": ` +
                'binding target is not declared by any module required port',
            details: {
                tokenId,
                bindingKind,
                reason
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
        this.bindingKind = bindingKind
        this.reason = reason
    }
}

export class ModuleCycleError extends SagifireIocError<ModuleCycleErrorDetails> {
    override readonly name = 'ModuleCycleError'
    override readonly code = 'SAGIFIRE_IOC_MODULE_CYCLE'
    readonly moduleIdPath: readonly string[]
    readonly tokenIdPath: readonly string[]
    readonly edgeKinds: readonly ModuleDependencyEdgeKind[]

    constructor(cycle: ModuleCycleErrorDetails) {
        const moduleIdPath = Object.freeze([...cycle.moduleIdPath])
        const tokenIdPath = Object.freeze([...cycle.tokenIdPath])
        const edgeKinds = Object.freeze([...cycle.edgeKinds])

        super({
            code: 'SAGIFIRE_IOC_MODULE_CYCLE',
            message: `Module dependency cycle detected: ${moduleIdPath.join(' -> ')}`,
            details: {
                moduleIdPath,
                tokenIdPath,
                edgeKinds
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleIdPath = moduleIdPath
        this.tokenIdPath = tokenIdPath
        this.edgeKinds = edgeKinds
    }
}

export class ComposerValidationError extends SagifireIocError<ComposerValidationErrorDetails> {
    override readonly name = 'ComposerValidationError'
    override readonly code = 'SAGIFIRE_IOC_COMPOSER_VALIDATION_FAILED'
    readonly report: DiagnosticReport

    constructor(report: DiagnosticReport) {
        super({
            code: 'SAGIFIRE_IOC_COMPOSER_VALIDATION_FAILED',
            message: `Composer validation failed with ${report.diagnostics.length} diagnostic(s)`,
            details: {
                diagnosticCount: report.diagnostics.length
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.report = report
    }
}

export class PrivateProviderAccessError extends SagifireIocError<PrivateProviderAccessErrorDetails> {
    override readonly name = 'PrivateProviderAccessError'
    override readonly code = 'SAGIFIRE_IOC_PRIVATE_PROVIDER_ACCESS'
    readonly moduleId: string | undefined
    readonly tokenId: string
    readonly requester: 'module' | 'composer-binding' | 'runtime'
    readonly reason: PrivateProviderAccessReason

    constructor(
        tokenId: string,
        requester: 'module' | 'composer-binding' | 'runtime',
        reason: PrivateProviderAccessReason,
        moduleId?: string
    ) {
        super({
            code: 'SAGIFIRE_IOC_PRIVATE_PROVIDER_ACCESS',
            message: formatPrivateProviderAccessMessage(tokenId, requester, reason, moduleId),
            details: {
                moduleId,
                tokenId,
                requester,
                reason
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = moduleId
        this.tokenId = tokenId
        this.requester = requester
        this.reason = reason
    }
}

export class MissingModuleProviderError extends SagifireIocError<MissingModuleProviderErrorDetails> {
    override readonly name = 'MissingModuleProviderError'
    override readonly code = 'SAGIFIRE_IOC_MISSING_MODULE_PROVIDER'
    readonly moduleId: string
    readonly tokenId: string

    constructor(moduleId: string, tokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_MISSING_MODULE_PROVIDER',
            message:
                `Module "${moduleId}" declares provided capability "${tokenId}" ` +
                'but did not register a provider for it during setup',
            details: {
                moduleId,
                tokenId
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = moduleId
        this.tokenId = tokenId
    }
}

type NormalizedModuleDependencies<
    TRequires extends readonly ModuleDependencyDefinitionInput[]
> = {
    readonly [TIndex in keyof TRequires]: TRequires[TIndex] extends ModuleDependencyDefinitionInput<
        infer TValue
    >
        ? ModuleDependencyDefinition<TValue>
        : never
}

type NormalizedModuleCapabilities<
    TProvides extends readonly ModuleCapabilityDefinition[]
> = {
    readonly [TIndex in keyof TProvides]: TProvides[TIndex] extends ModuleCapabilityDefinition<
        infer TValue
    >
        ? ModuleCapabilityDefinition<TValue>
        : never
}

type ComposerBindingRecord =
    | {
          readonly kind: 'value'
          readonly token: Token<unknown>
          readonly value: unknown
      }
    | {
          readonly kind: 'factory'
          readonly token: Token<unknown>
          readonly factory: ComposerBindingFactory<unknown>
      }
    | {
          readonly kind: 'class'
          readonly token: Token<unknown>
          readonly classConstructor: ClassConstructor<unknown>
      }
    | {
          readonly kind: 'async-factory'
          readonly token: Token<unknown>
          readonly factory: ComposerAsyncBindingFactory<unknown>
      }

interface CapabilityDependencyRecord {
    readonly moduleId: string
    readonly tokenId: string
    readonly kind: ModuleCapabilityKind
}

interface ModuleCyclePath {
    readonly moduleIdPath: readonly string[]
    readonly tokenIdPath: readonly string[]
    readonly edgeKinds: readonly ModuleDependencyEdgeKind[]
}

interface ProviderRegistrationRecord {
    readonly providerKind: InspectionProviderKind
    lifetime: ProviderLifetime | undefined
    initialization: AsyncProviderInitializationMode | undefined
}

interface RegisteredCapabilityProvider {
    readonly moduleId: string
    readonly tokenId: string
    readonly kind: ModuleCapabilityKind
    readonly registrationKind: ProviderRegistrationKind
    readonly providers: ProviderRegistrationRecord[]
}

interface CompositionAccessModel {
    readonly publicTokenIds: ReadonlySet<string>
    readonly bindingTokenIds: ReadonlySet<string>
    readonly requiredTokenIdsByModuleId: ReadonlyMap<string, ReadonlySet<string>>
    readonly providedTokenIdsByModuleId: ReadonlyMap<string, ReadonlySet<string>>
    readonly privateTokensByModuleId: Map<string, Map<string, Token<unknown>>>
    readonly registeredCapabilities: Map<string, RegisteredCapabilityProvider>
}

interface LiveModuleSetupContext {
    readonly context: ModuleSetupContext
    activate(runtimeContext: ResolutionContext): void
}

interface BuiltComposition {
    readonly modules: readonly ModuleDefinition[]
    readonly bindings: readonly ComposerBindingRecord[]
    readonly access: CompositionAccessModel
    readonly runtime: ContainerRuntime
}

interface InvalidModuleDefinitionErrorOptions {
    readonly moduleId?: string
    readonly value?: unknown
}

const moduleIdPattern = /^[A-Za-z0-9._:/-]+$/
const moduleDependencyKinds: readonly ModuleDependencyKind[] = ['external', 'shared']
const moduleCapabilityKinds: readonly ModuleCapabilityKind[] = [
    'public-api',
    'admin-contribution',
    'event-publisher',
    'event-subscriber',
    'shared-service',
    'custom'
]

export function defineModule<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly ModuleCapabilityDefinition[] = readonly ModuleCapabilityDefinition[]
>(
    definition: ModuleDefinitionInput<TMetadata, TRequires, TProvides>
): ModuleDefinition<
    TMetadata,
    NormalizedModuleDependencies<TRequires>,
    NormalizedModuleCapabilities<TProvides>
> {
    const rawDefinition = definition as unknown

    if (!isRecord(rawDefinition)) {
        throw new InvalidModuleDefinitionError('definition must be an object', {
            value: rawDefinition
        })
    }

    const moduleId = validateModuleId(rawDefinition.id)
    const version = validateOptionalString(rawDefinition.version, moduleId, 'version')
    const setup = validateSetup<TMetadata>(rawDefinition.setup, moduleId)
    const requiresInput = validateDefinitionArray(rawDefinition.requires, moduleId, 'requires')
    const providesInput = validateDefinitionArray(rawDefinition.provides, moduleId, 'provides')
    const requires = Object.freeze(
        requiresInput.map((dependency, index) => {
            return normalizeDependency(moduleId, dependency, index)
        })
    ) as unknown as NormalizedModuleDependencies<TRequires>
    const provides = Object.freeze(
        providesInput.map((capability, index) => {
            return normalizeCapability(moduleId, capability, index)
        })
    ) as unknown as NormalizedModuleCapabilities<TProvides>

    assertNoDuplicateDependencies(moduleId, requires as readonly ModuleDependencyDefinition[])
    assertNoDuplicateCapabilities(moduleId, provides as readonly ModuleCapabilityDefinition[])

    return createModuleDefinition(definition, moduleId, version, setup, requires, provides)
}

export function createComposer(): Composer {
    const modules: ModuleDefinition[] = []
    const bindings: ComposerBindingRecord[] = []

    const composer: Composer = {
        use(moduleDefinition: ModuleDefinition): Composer {
            modules.push(moduleDefinition)

            return composer
        },

        bind<TValue>(bindingToken: Token<TValue>): ComposerBindingBuilder<TValue> {
            return createComposerBindingBuilder(bindingToken, bindings)
        },

        validate(): DiagnosticReport {
            return validateComposer(modules, bindings)
        },

        inspect(): ComposerInspection {
            return createComposerInspection(modules, bindings)
        },

        getGraph(): ModuleGraph {
            return createModuleGraph(modules, bindings)
        },

        prepare(): Promise<PreparedComposition> {
            return prepareComposition(modules, bindings)
        },

        compose(): Promise<ComposedRuntime> {
            return composeRuntime(modules, bindings)
        }
    }

    return Object.freeze(composer)
}

function createComposerBindingBuilder<TValue>(
    bindingToken: Token<TValue>,
    bindings: ComposerBindingRecord[]
): ComposerBindingBuilder<TValue> {
    return {
        toValue(value: TValue): void {
            bindings.push({
                kind: 'value',
                token: bindingToken,
                value
            })
        },

        toFactory(factory: ComposerBindingFactory<TValue>): void {
            bindings.push({
                kind: 'factory',
                token: bindingToken,
                factory
            })
        },

        toClass(classConstructor: ClassConstructor<TValue>): void {
            bindings.push({
                kind: 'class',
                token: bindingToken,
                classConstructor
            })
        },

        toAsyncFactory(factory: ComposerAsyncBindingFactory<TValue>): void {
            bindings.push({
                kind: 'async-factory',
                token: bindingToken,
                factory
            })
        }
    }
}

function createComposerInspection(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[]
): ComposerInspection {
    const moduleSnapshot = [...modules]
    const bindingSnapshot = [...bindings]
    const graph = createModuleGraph(moduleSnapshot, bindingSnapshot)

    return Object.freeze({
        modules: graph.modules,
        requiredPorts: graph.requiredPorts,
        capabilities: graph.capabilities,
        bindings: graph.bindings,
        edges: graph.edges,
        graph,
        validation: validateComposer(moduleSnapshot, bindingSnapshot)
    })
}

function createRuntimeInspection(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[],
    access: CompositionAccessModel
): RuntimeInspection {
    const graph = createModuleGraph(modules, bindings)

    return Object.freeze({
        modules: graph.modules,
        requiredPorts: graph.requiredPorts,
        capabilities: graph.capabilities,
        bindings: graph.bindings,
        edges: graph.edges,
        graph,
        validation: validateComposer(modules, bindings),
        providerRegistrations: createProviderRegistrationSummaries(modules, access)
    })
}

function createModuleGraph(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[]
): ModuleGraph {
    const moduleSnapshot = [...modules]
    const bindingSnapshot = [...bindings]
    const providedTokenIds = collectProvidedTokenIds(moduleSnapshot)
    const bindingTokenIds = collectBindingTokenIds(bindingSnapshot)
    const capabilitiesByTokenId = collectFirstCapabilityByTokenId(moduleSnapshot)
    const bindingsByTokenId = collectFirstBindingByTokenId(bindingSnapshot)
    const moduleMetadata = Object.freeze(
        moduleSnapshot.map((moduleDefinition) => {
            return createModuleNodeMetadata(moduleDefinition)
        })
    )
    const requiredPorts = Object.freeze(
        moduleSnapshot.flatMap((moduleDefinition) => {
            return moduleDefinition.requires.map((dependency) => {
                return createRequiredPortMetadata(
                    moduleDefinition,
                    dependency,
                    providedTokenIds,
                    bindingTokenIds
                )
            })
        })
    )
    const capabilities = Object.freeze(
        moduleSnapshot.flatMap((moduleDefinition) => {
            return moduleDefinition.provides.map((capability) => {
                return createCapabilityMetadata(moduleDefinition, capability)
            })
        })
    )
    const bindingMetadata = Object.freeze(
        bindingSnapshot.map((binding) => {
            return createCompositionBindingMetadata(binding)
        })
    )
    const edges = createModuleDependencyEdges(
        moduleSnapshot,
        capabilitiesByTokenId,
        bindingsByTokenId
    )

    return Object.freeze({
        modules: moduleMetadata,
        requiredPorts,
        capabilities,
        bindings: bindingMetadata,
        edges
    })
}

async function prepareComposition(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[]
): Promise<PreparedComposition> {
    const composition = await buildCompositionRuntime(modules, bindings)

    return createPreparedComposition(composition.modules, composition.access)
}

async function composeRuntime(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[]
): Promise<ComposedRuntime> {
    const composition = await buildCompositionRuntime(modules, bindings)

    return createComposedRuntime(
        composition.runtime,
        composition.modules,
        composition.bindings,
        composition.access
    )
}

async function buildCompositionRuntime(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[]
): Promise<BuiltComposition> {
    const moduleSnapshot = [...modules]
    const bindingSnapshot = [...bindings]
    const staticValidation = validateComposer(moduleSnapshot, bindingSnapshot)

    if (!staticValidation.ok) {
        throw new ComposerValidationError(staticValidation)
    }

    const container = createContainer()
    const access = createCompositionAccessModel(moduleSnapshot, bindingSnapshot)
    const setupContexts: {
        readonly moduleDefinition: ModuleDefinition
        readonly setupContext: LiveModuleSetupContext
    }[] = []

    applyComposerBindings(container, bindingSnapshot, access)

    for (const moduleDefinition of moduleSnapshot) {
        const setupContext = createLiveModuleSetupContext(moduleDefinition, container, access)

        setupContexts.push({
            moduleDefinition,
            setupContext
        })

        await moduleDefinition.setup(setupContext.context)
    }

    const providerValidation = validateDeclaredProviderRegistrations(moduleSnapshot, access)

    if (!providerValidation.ok) {
        throw new ComposerValidationError(providerValidation)
    }

    const runtime = await container.freeze()

    for (const setupContext of setupContexts) {
        setupContext.setupContext.activate(
            createModuleResolutionContext(setupContext.moduleDefinition, runtime, access)
        )
    }

    return {
        modules: moduleSnapshot,
        bindings: bindingSnapshot,
        access,
        runtime
    }
}

function createCompositionAccessModel(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[]
): CompositionAccessModel {
    return {
        publicTokenIds: collectProvidedTokenIds(modules),
        bindingTokenIds: collectBindingTokenIds(bindings),
        requiredTokenIdsByModuleId: collectRequiredTokenIdsByModuleId(modules),
        providedTokenIdsByModuleId: collectProvidedTokenIdsByModuleId(modules),
        privateTokensByModuleId: new Map<string, Map<string, Token<unknown>>>(),
        registeredCapabilities: new Map<string, RegisteredCapabilityProvider>()
    }
}

function createModuleNodeMetadata(moduleDefinition: ModuleDefinition): ModuleNodeMetadata {
    const requiredPortIds = Object.freeze(
        moduleDefinition.requires.map((dependency) => {
            return dependency.token.id
        })
    )
    const capabilityIds = Object.freeze(
        moduleDefinition.provides.map((capability) => {
            return capability.token.id
        })
    )
    const metadata = createInspectionMetadata(moduleDefinition.metadata)
    const version = moduleDefinition.version
    const base = {
        id: moduleDefinition.id,
        requiredPortIds,
        capabilityIds
    }

    if (version === undefined) {
        if (metadata === undefined) {
            return Object.freeze(base)
        }

        return Object.freeze({
            ...base,
            metadata
        })
    }

    if (metadata === undefined) {
        return Object.freeze({
            ...base,
            version
        })
    }

    return Object.freeze({
        ...base,
        version,
        metadata
    })
}

function createRequiredPortMetadata(
    moduleDefinition: ModuleDefinition,
    dependency: ModuleDependencyDefinition,
    providedTokenIds: ReadonlySet<string>,
    bindingTokenIds: ReadonlySet<string>
): RequiredPortMetadata {
    const base = {
        moduleId: moduleDefinition.id,
        tokenId: dependency.token.id,
        required: dependency.required,
        kind: dependency.kind,
        satisfiedBy: getRequiredPortSatisfaction(dependency, providedTokenIds, bindingTokenIds)
    }

    if (dependency.description === undefined) {
        return Object.freeze(base)
    }

    return Object.freeze({
        ...base,
        description: dependency.description
    })
}

function createCapabilityMetadata(
    moduleDefinition: ModuleDefinition,
    capability: ModuleCapabilityDefinition
): CapabilityMetadata {
    const base = {
        moduleId: moduleDefinition.id,
        tokenId: capability.token.id,
        kind: capability.kind
    }

    if (capability.description === undefined) {
        return Object.freeze(base)
    }

    return Object.freeze({
        ...base,
        description: capability.description
    })
}

function createCompositionBindingMetadata(
    binding: ComposerBindingRecord
): CompositionBindingMetadata {
    if (binding.kind === 'value') {
        return Object.freeze({
            tokenId: binding.token.id,
            kind: binding.kind,
            providerKind: 'value',
            lifetime: 'singleton'
        })
    }

    if (binding.kind === 'factory') {
        return Object.freeze({
            tokenId: binding.token.id,
            kind: binding.kind,
            providerKind: 'factory',
            lifetime: 'transient'
        })
    }

    if (binding.kind === 'class') {
        return Object.freeze({
            tokenId: binding.token.id,
            kind: binding.kind,
            providerKind: 'class',
            lifetime: 'transient'
        })
    }

    return Object.freeze({
        tokenId: binding.token.id,
        kind: binding.kind,
        providerKind: 'async-factory',
        lifetime: 'transient',
        initialization: 'lazy'
    })
}

function createModuleDependencyEdges(
    modules: readonly ModuleDefinition[],
    capabilitiesByTokenId: ReadonlyMap<string, CapabilityDependencyRecord>,
    bindingsByTokenId: ReadonlyMap<string, ComposerBindingRecord>
): readonly ModuleDependencyEdge[] {
    const edges: ModuleDependencyEdge[] = []

    for (const moduleDefinition of modules) {
        for (const dependency of moduleDefinition.requires) {
            if (!dependency.required) {
                continue
            }

            const binding = bindingsByTokenId.get(dependency.token.id)

            if (binding !== undefined) {
                edges.push(createBindingDependencyEdge(moduleDefinition, dependency, binding))

                continue
            }

            const capability = capabilitiesByTokenId.get(dependency.token.id)

            if (capability !== undefined) {
                edges.push(createCapabilityDependencyEdge(moduleDefinition, dependency, capability))
            }
        }
    }

    return Object.freeze(edges)
}

function createCapabilityDependencyEdge(
    moduleDefinition: ModuleDefinition,
    dependency: ModuleDependencyDefinition,
    capability: CapabilityDependencyRecord
): CapabilityDependencyEdge {
    return Object.freeze({
        edgeKind: 'capability',
        consumerModuleId: moduleDefinition.id,
        requiredTokenId: dependency.token.id,
        dependencyKind: dependency.kind,
        providerModuleId: capability.moduleId,
        capabilityTokenId: capability.tokenId,
        capabilityKind: capability.kind
    })
}

function createBindingDependencyEdge(
    moduleDefinition: ModuleDefinition,
    dependency: ModuleDependencyDefinition,
    binding: ComposerBindingRecord
): BindingDependencyEdge {
    return Object.freeze({
        edgeKind: 'binding',
        consumerModuleId: moduleDefinition.id,
        requiredTokenId: dependency.token.id,
        dependencyKind: dependency.kind,
        bindingTokenId: binding.token.id,
        bindingKind: binding.kind
    })
}

function createProviderRegistrationSummaries(
    modules: readonly ModuleDefinition[],
    access: CompositionAccessModel
): readonly ProviderRegistrationSummary[] {
    const summaries: ProviderRegistrationSummary[] = []

    for (const moduleDefinition of modules) {
        for (const capability of moduleDefinition.provides) {
            const registration = access.registeredCapabilities.get(capability.token.id)

            if (registration === undefined) {
                continue
            }

            summaries.push(createProviderRegistrationSummary(registration))
        }
    }

    return Object.freeze(summaries)
}

function createProviderRegistrationSummary(
    registration: RegisteredCapabilityProvider
): ProviderRegistrationSummary {
    return Object.freeze({
        moduleId: registration.moduleId,
        tokenId: registration.tokenId,
        capabilityKind: registration.kind,
        visibility: 'exported',
        registrationKind: registration.registrationKind,
        providers: Object.freeze(
            registration.providers.map((provider) => {
                return createProviderRegistrationProviderSummary(provider)
            })
        )
    })
}

function createProviderRegistrationProviderSummary(
    provider: ProviderRegistrationRecord
): ProviderRegistrationProviderSummary {
    const lifetime = provider.lifetime
    const initialization = provider.initialization
    const base = {
        providerKind: provider.providerKind
    }

    if (lifetime === undefined) {
        if (initialization === undefined) {
            return Object.freeze(base)
        }

        return Object.freeze({
            ...base,
            initialization
        })
    }

    if (initialization === undefined) {
        return Object.freeze({
            ...base,
            lifetime
        })
    }

    return Object.freeze({
        ...base,
        lifetime,
        initialization
    })
}

function getRequiredPortSatisfaction(
    dependency: ModuleDependencyDefinition,
    providedTokenIds: ReadonlySet<string>,
    bindingTokenIds: ReadonlySet<string>
): RequiredPortSatisfaction {
    if (!dependency.required) {
        return 'optional'
    }

    if (bindingTokenIds.has(dependency.token.id)) {
        return 'binding'
    }

    if (providedTokenIds.has(dependency.token.id)) {
        return 'capability'
    }

    return 'missing'
}

function createInspectionMetadata(value: unknown): InspectionMetadata | undefined {
    if (value === undefined) {
        return undefined
    }

    const valueType = getValueType(value)

    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
    ) {
        return Object.freeze({
            valueType,
            value
        })
    }

    return Object.freeze({
        valueType
    })
}

function applyComposerBindings(
    container: ContainerBuilder,
    bindings: readonly ComposerBindingRecord[],
    access: CompositionAccessModel
): void {
    for (const binding of bindings) {
        const builder = container.bind(binding.token)

        if (binding.kind === 'value') {
            builder.toValue(binding.value)
        } else if (binding.kind === 'factory') {
            builder.toFactory((context) => {
                return binding.factory(createComposerBindingResolutionContext(context, access))
            })
        } else if (binding.kind === 'class') {
            builder.toClass(binding.classConstructor)
        } else {
            builder.toAsyncFactory((context) => {
                return binding.factory(createComposerBindingResolutionContext(context, access))
            })
        }
    }
}

function createLiveModuleSetupContext(
    moduleDefinition: ModuleDefinition,
    container: ContainerBuilder,
    access: CompositionAccessModel
): LiveModuleSetupContext {
    let activeContext: ResolutionContext | undefined

    const getActiveContext = (token: Token<unknown>): ResolutionContext => {
        if (activeContext === undefined) {
            throw new PrivateProviderAccessError(
                token.id,
                'module',
                'composition-not-ready',
                moduleDefinition.id
            )
        }

        return activeContext
    }

    const context: ModuleSetupContext = {
        moduleId: moduleDefinition.id,

        bind<TValue>(bindingToken: Token<TValue>): BindingBuilder<TValue> {
            return createModuleBindingBuilder(moduleDefinition, bindingToken, container, access)
        },

        add<TValue>(bindingToken: Token<TValue>): MultiBindingBuilder<TValue> {
            return createModuleMultiBindingBuilder(moduleDefinition, bindingToken, container, access)
        },

        get<TValue>(resolutionToken: Token<TValue>): TValue {
            return getActiveContext(resolutionToken).get(resolutionToken)
        },

        tryGet<TValue>(resolutionToken: Token<TValue>): TValue | undefined {
            return getActiveContext(resolutionToken).tryGet(resolutionToken)
        },

        getAll<TValue>(resolutionToken: Token<TValue>): TValue[] {
            return getActiveContext(resolutionToken).getAll(resolutionToken)
        },

        getAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue> {
            return getActiveContext(resolutionToken).getAsync(resolutionToken)
        },

        tryGetAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue | undefined> {
            return getActiveContext(resolutionToken).tryGetAsync(resolutionToken)
        }
    }

    return {
        context: Object.freeze(context),
        activate(runtimeContext: ResolutionContext): void {
            activeContext = runtimeContext
        }
    }
}

function createModuleBindingBuilder<TValue>(
    moduleDefinition: ModuleDefinition,
    originalToken: Token<TValue>,
    container: ContainerBuilder,
    access: CompositionAccessModel
): BindingBuilder<TValue> {
    const registration = resolveModuleRegistrationToken(moduleDefinition, originalToken, access)
    const builder = container.bind(registration.token)

    return {
        toValue(value: TValue): void {
            builder.toValue(value)
            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'single',
                createProviderRegistrationRecord('value', 'singleton'),
                access
            )
        },

        toFactory(factory): LifetimeBinding {
            const providerRegistration = createProviderRegistrationRecord('factory', 'transient')
            const lifetime = builder.toFactory((context) => {
                return factory(createModuleResolutionContext(moduleDefinition, context, access))
            })

            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'single',
                providerRegistration,
                access
            )

            return createInspectableLifetimeBinding(lifetime, providerRegistration)
        },

        toClass(classConstructor: ClassConstructor<TValue>): LifetimeBinding {
            const providerRegistration = createProviderRegistrationRecord('class', 'transient')
            const lifetime = builder.toClass(classConstructor)

            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'single',
                providerRegistration,
                access
            )

            return createInspectableLifetimeBinding(lifetime, providerRegistration)
        },

        toAsyncFactory(factory): AsyncFactoryBinding {
            const providerRegistration = createProviderRegistrationRecord(
                'async-factory',
                'transient',
                'lazy'
            )
            const binding = builder.toAsyncFactory((context) => {
                return factory(createModuleResolutionContext(moduleDefinition, context, access))
            })

            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'single',
                providerRegistration,
                access
            )

            return createInspectableAsyncFactoryBinding(binding, providerRegistration)
        },

        toAsyncResource(factory): AsyncResourceBinding {
            const providerRegistration = createProviderRegistrationRecord(
                'async-resource',
                undefined,
                'lazy'
            )
            const binding = builder.toAsyncResource((context) => {
                return factory(createModuleResolutionContext(moduleDefinition, context, access))
            })

            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'single',
                providerRegistration,
                access
            )

            return createInspectableAsyncResourceBinding(binding, providerRegistration)
        }
    }
}

function createModuleMultiBindingBuilder<TValue>(
    moduleDefinition: ModuleDefinition,
    originalToken: Token<TValue>,
    container: ContainerBuilder,
    access: CompositionAccessModel
): MultiBindingBuilder<TValue> {
    const registration = resolveModuleRegistrationToken(moduleDefinition, originalToken, access)
    const builder = container.add(registration.token)

    return {
        toValue(value: TValue): void {
            builder.toValue(value)
            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'multi',
                createProviderRegistrationRecord('value', 'singleton'),
                access
            )
        },

        toFactory(factory): LifetimeBinding {
            const providerRegistration = createProviderRegistrationRecord('factory', 'transient')
            const lifetime = builder.toFactory((context) => {
                return factory(createModuleResolutionContext(moduleDefinition, context, access))
            })

            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'multi',
                providerRegistration,
                access
            )

            return createInspectableLifetimeBinding(lifetime, providerRegistration)
        }
    }
}

function createProviderRegistrationRecord(
    providerKind: InspectionProviderKind,
    lifetime: ProviderLifetime | undefined,
    initialization?: AsyncProviderInitializationMode
): ProviderRegistrationRecord {
    return {
        providerKind,
        lifetime,
        initialization
    }
}

function createInspectableLifetimeBinding(
    binding: LifetimeBinding,
    providerRegistration: ProviderRegistrationRecord
): LifetimeBinding {
    return {
        singleton(): void {
            binding.singleton()
            providerRegistration.lifetime = 'singleton'
        },

        transient(): void {
            binding.transient()
            providerRegistration.lifetime = 'transient'
        },

        scoped(): void {
            binding.scoped()
            providerRegistration.lifetime = 'scoped'
        }
    }
}

function createInspectableAsyncFactoryBinding(
    binding: AsyncFactoryBinding,
    providerRegistration: ProviderRegistrationRecord
): AsyncFactoryBinding {
    const inspectableBinding: AsyncFactoryBinding = {
        singleton(): AsyncFactoryBinding {
            binding.singleton()
            providerRegistration.lifetime = 'singleton'

            return inspectableBinding
        },

        transient(): AsyncFactoryBinding {
            binding.transient()
            providerRegistration.lifetime = 'transient'

            return inspectableBinding
        },

        scoped(): AsyncFactoryBinding {
            binding.scoped()
            providerRegistration.lifetime = 'scoped'

            return inspectableBinding
        },

        eager(): AsyncFactoryBinding {
            binding.eager()
            providerRegistration.initialization = 'eager'

            return inspectableBinding
        },

        lazy(): AsyncFactoryBinding {
            binding.lazy()
            providerRegistration.initialization = 'lazy'

            return inspectableBinding
        }
    }

    return inspectableBinding
}

function createInspectableAsyncResourceBinding(
    binding: AsyncResourceBinding,
    providerRegistration: ProviderRegistrationRecord
): AsyncResourceBinding {
    const inspectableBinding: AsyncResourceBinding = {
        singleton(): AsyncResourceBinding {
            binding.singleton()
            providerRegistration.lifetime = 'singleton'

            return inspectableBinding
        },

        scoped(): AsyncResourceBinding {
            binding.scoped()
            providerRegistration.lifetime = 'scoped'

            return inspectableBinding
        },

        eager(): AsyncResourceBinding {
            binding.eager()
            providerRegistration.initialization = 'eager'

            return inspectableBinding
        },

        lazy(): AsyncResourceBinding {
            binding.lazy()
            providerRegistration.initialization = 'lazy'

            return inspectableBinding
        }
    }

    return inspectableBinding
}

function createModuleResolutionContext(
    moduleDefinition: ModuleDefinition,
    context: ResolutionContext,
    access: CompositionAccessModel
): ResolutionContext {
    return {
        get<TValue>(resolutionToken: Token<TValue>): TValue {
            return context.get(resolveModuleAccessToken(moduleDefinition, resolutionToken, access))
        },

        tryGet<TValue>(resolutionToken: Token<TValue>): TValue | undefined {
            return context.tryGet(resolveModuleAccessToken(moduleDefinition, resolutionToken, access))
        },

        getAll<TValue>(resolutionToken: Token<TValue>): TValue[] {
            return context.getAll(resolveModuleAccessToken(moduleDefinition, resolutionToken, access))
        },

        getAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue> {
            return context.getAsync(resolveModuleAccessToken(moduleDefinition, resolutionToken, access))
        },

        tryGetAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue | undefined> {
            return context.tryGetAsync(
                resolveModuleAccessToken(moduleDefinition, resolutionToken, access)
            )
        }
    }
}

function createComposerBindingResolutionContext(
    context: ResolutionContext,
    access: CompositionAccessModel
): ComposerBindingContext {
    const resolveToken = <TValue>(resolutionToken: Token<TValue>): Token<TValue> => {
        if (
            access.publicTokenIds.has(resolutionToken.id) ||
            access.bindingTokenIds.has(resolutionToken.id)
        ) {
            return resolutionToken
        }

        throw new PrivateProviderAccessError(
            resolutionToken.id,
            'composer-binding',
            'token-not-visible'
        )
    }

    return {
        get<TValue>(resolutionToken: Token<TValue>): TValue {
            return context.get(resolveToken(resolutionToken))
        },

        tryGet<TValue>(resolutionToken: Token<TValue>): TValue | undefined {
            return context.tryGet(resolveToken(resolutionToken))
        },

        getAll<TValue>(resolutionToken: Token<TValue>): TValue[] {
            return context.getAll(resolveToken(resolutionToken))
        },

        getAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue> {
            return context.getAsync(resolveToken(resolutionToken))
        },

        tryGetAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue | undefined> {
            return context.tryGetAsync(resolveToken(resolutionToken))
        }
    }
}

function createComposedRuntime(
    containerRuntime: ContainerRuntime,
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[],
    access: CompositionAccessModel
): ComposedRuntime {
    const inspection = createRuntimeInspection(modules, bindings, access)

    function withScope<TValue>(callback: ScopeCallback<TValue>): Promise<TValue>
    function withScope<TValue>(
        options: CreateScopeOptions,
        callback: ScopeCallback<TValue>
    ): Promise<TValue>
    function withScope<TValue>(
        optionsOrCallback: CreateScopeOptions | ScopeCallback<TValue>,
        callback?: ScopeCallback<TValue>
    ): Promise<TValue> {
        if (typeof optionsOrCallback === 'function') {
            return containerRuntime.withScope((scope) => {
                return optionsOrCallback(createComposedScope(scope, access))
            })
        }

        if (callback === undefined) {
            return containerRuntime.withScope(
                optionsOrCallback,
                callback as unknown as ScopeCallback<TValue>
            )
        }

        assertScopeOptionsUsePublicCapabilities(optionsOrCallback, access)

        return containerRuntime.withScope(optionsOrCallback, (scope) => {
            return callback(createComposedScope(scope, access))
        })
    }

    const runtime: ComposedRuntime = {
        get<TValue>(resolutionToken: Token<TValue>): TValue {
            return containerRuntime.get(resolvePublicCapabilityToken(resolutionToken, access))
        },

        tryGet<TValue>(resolutionToken: Token<TValue>): TValue | undefined {
            return containerRuntime.tryGet(resolvePublicCapabilityToken(resolutionToken, access))
        },

        getAll<TValue>(resolutionToken: Token<TValue>): TValue[] {
            return containerRuntime.getAll(resolvePublicCapabilityToken(resolutionToken, access))
        },

        createScope(options?: CreateScopeOptions): Scope {
            assertScopeOptionsUsePublicCapabilities(options, access)

            return createComposedScope(containerRuntime.createScope(options), access)
        },

        withScope,

        getAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue> {
            return containerRuntime.getAsync(resolvePublicCapabilityToken(resolutionToken, access))
        },

        tryGetAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue | undefined> {
            return containerRuntime.tryGetAsync(
                resolvePublicCapabilityToken(resolutionToken, access)
            )
        },

        inspect(): RuntimeInspection {
            return inspection
        },

        dispose(): Promise<void> {
            return containerRuntime.dispose()
        }
    }

    return Object.freeze(runtime)
}

function createComposedScope(containerScope: Scope, access: CompositionAccessModel): Scope {
    const scope: Scope = {
        get<TValue>(resolutionToken: Token<TValue>): TValue {
            return containerScope.get(resolvePublicCapabilityToken(resolutionToken, access))
        },

        tryGet<TValue>(resolutionToken: Token<TValue>): TValue | undefined {
            return containerScope.tryGet(resolvePublicCapabilityToken(resolutionToken, access))
        },

        getAll<TValue>(resolutionToken: Token<TValue>): TValue[] {
            return containerScope.getAll(resolvePublicCapabilityToken(resolutionToken, access))
        },

        getAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue> {
            return containerScope.getAsync(resolvePublicCapabilityToken(resolutionToken, access))
        },

        dispose(): Promise<void> {
            return containerScope.dispose()
        }
    }

    return Object.freeze(scope)
}

function resolvePublicCapabilityToken<TValue>(
    resolutionToken: Token<TValue>,
    access: CompositionAccessModel
): Token<TValue> {
    if (access.registeredCapabilities.has(resolutionToken.id)) {
        return resolutionToken
    }

    throw new PrivateProviderAccessError(resolutionToken.id, 'runtime', 'token-not-visible')
}

function assertScopeOptionsUsePublicCapabilities(
    options: CreateScopeOptions | undefined,
    access: CompositionAccessModel
): void {
    if (options === undefined) {
        return
    }

    for (const localValue of options.values ?? []) {
        resolvePublicCapabilityToken(getScopeLocalValueToken(localValue), access)
    }

    for (const localValue of options.multiValues ?? []) {
        resolvePublicCapabilityToken(getScopeLocalValueToken(localValue), access)
    }
}

function getScopeLocalValueToken(localValue: ScopeLocalValue): Token<unknown> {
    if (isScopeLocalTuple(localValue)) {
        return localValue[0]
    }

    return localValue.token
}

function isScopeLocalTuple(
    localValue: ScopeLocalValue
): localValue is readonly [token: Token<unknown>, value: unknown] {
    return Array.isArray(localValue)
}

function validateComposer(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[]
): DiagnosticReport {
    const diagnostics: Diagnostic[] = []

    appendDuplicateModuleIdDiagnostics(diagnostics, modules)
    appendDuplicateCapabilityDiagnostics(diagnostics, modules)

    const providedTokenIds = collectProvidedTokenIds(modules)
    const bindingTokenIds = collectBindingTokenIds(bindings)
    const requiredPortTokenIds = collectRequiredPortTokenIds(modules)

    appendMissingRequiredPortDiagnostics(diagnostics, modules, providedTokenIds, bindingTokenIds)
    appendInvalidBindingDiagnostics(diagnostics, bindings, requiredPortTokenIds)
    appendModuleCycleDiagnostics(diagnostics, modules, bindings)

    return createDiagnosticReport(diagnostics)
}

function appendDuplicateModuleIdDiagnostics(
    diagnostics: Diagnostic[],
    modules: readonly ModuleDefinition[]
): void {
    const seenModuleIds = new Set<string>()
    const reportedModuleIds = new Set<string>()

    for (const moduleDefinition of modules) {
        if (seenModuleIds.has(moduleDefinition.id)) {
            if (!reportedModuleIds.has(moduleDefinition.id)) {
                diagnostics.push(diagnosticFromError(new DuplicateModuleIdError(moduleDefinition.id)))
                reportedModuleIds.add(moduleDefinition.id)
            }

            continue
        }

        seenModuleIds.add(moduleDefinition.id)
    }
}

function appendDuplicateCapabilityDiagnostics(
    diagnostics: Diagnostic[],
    modules: readonly ModuleDefinition[]
): void {
    const moduleIdsByTokenId = new Map<string, string[]>()

    for (const moduleDefinition of modules) {
        for (const capability of moduleDefinition.provides) {
            const moduleIds = moduleIdsByTokenId.get(capability.token.id)

            if (moduleIds === undefined) {
                moduleIdsByTokenId.set(capability.token.id, [moduleDefinition.id])
            } else {
                moduleIds.push(moduleDefinition.id)
            }
        }
    }

    for (const [tokenId, moduleIds] of moduleIdsByTokenId) {
        const [firstModuleId, secondModuleId, ...remainingModuleIds] = moduleIds

        if (firstModuleId !== undefined && secondModuleId !== undefined) {
            diagnostics.push(
                diagnosticFromError(
                    new DuplicateModuleCapabilityError(
                        [firstModuleId, secondModuleId, ...remainingModuleIds],
                        tokenId
                    )
                )
            )
        }
    }
}

function appendMissingRequiredPortDiagnostics(
    diagnostics: Diagnostic[],
    modules: readonly ModuleDefinition[],
    providedTokenIds: ReadonlySet<string>,
    bindingTokenIds: ReadonlySet<string>
): void {
    for (const moduleDefinition of modules) {
        for (const dependency of moduleDefinition.requires) {
            if (!dependency.required) {
                continue
            }

            const tokenId = dependency.token.id

            if (!providedTokenIds.has(tokenId) && !bindingTokenIds.has(tokenId)) {
                diagnostics.push(
                    diagnosticFromError(
                        new MissingRequiredPortError(moduleDefinition.id, tokenId, dependency.kind)
                    )
                )
            }
        }
    }
}

function appendInvalidBindingDiagnostics(
    diagnostics: Diagnostic[],
    bindings: readonly ComposerBindingRecord[],
    requiredPortTokenIds: ReadonlySet<string>
): void {
    for (const binding of bindings) {
        if (!requiredPortTokenIds.has(binding.token.id)) {
            diagnostics.push(
                diagnosticFromError(new InvalidComposerBindingError(binding.token.id, binding.kind))
            )
        }
    }
}

function appendModuleCycleDiagnostics(
    diagnostics: Diagnostic[],
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[]
): void {
    const capabilitiesByTokenId = collectFirstCapabilityByTokenId(modules)
    const bindingsByTokenId = collectFirstBindingByTokenId(bindings)
    const edges = createModuleDependencyEdges(modules, capabilitiesByTokenId, bindingsByTokenId)
    const cycles = detectModuleCycles(modules, edges)

    for (const cycle of cycles) {
        diagnostics.push(diagnosticFromError(new ModuleCycleError(cycle)))
    }
}

function detectModuleCycles(
    modules: readonly ModuleDefinition[],
    edges: readonly ModuleDependencyEdge[]
): readonly ModuleCyclePath[] {
    const capabilityEdgesByConsumerModuleId = collectCapabilityEdgesByConsumerModuleId(edges)
    const visitStateByModuleId = new Map<string, 'visiting' | 'visited'>()
    const moduleIdStack: string[] = []
    const edgeStack: CapabilityDependencyEdge[] = []
    const cycles: ModuleCyclePath[] = []

    for (const moduleDefinition of modules) {
        if (visitStateByModuleId.has(moduleDefinition.id)) {
            continue
        }

        visitModuleForCycles(
            moduleDefinition.id,
            capabilityEdgesByConsumerModuleId,
            visitStateByModuleId,
            moduleIdStack,
            edgeStack,
            cycles
        )
    }

    return Object.freeze(cycles)
}

function visitModuleForCycles(
    moduleId: string,
    capabilityEdgesByConsumerModuleId: ReadonlyMap<string, readonly CapabilityDependencyEdge[]>,
    visitStateByModuleId: Map<string, 'visiting' | 'visited'>,
    moduleIdStack: string[],
    edgeStack: CapabilityDependencyEdge[],
    cycles: ModuleCyclePath[]
): void {
    visitStateByModuleId.set(moduleId, 'visiting')
    moduleIdStack.push(moduleId)

    for (const edge of capabilityEdgesByConsumerModuleId.get(moduleId) ?? []) {
        const providerState = visitStateByModuleId.get(edge.providerModuleId)

        if (providerState === 'visiting') {
            cycles.push(createModuleCyclePath(edge, moduleIdStack, edgeStack))

            continue
        }

        if (providerState === 'visited') {
            continue
        }

        edgeStack.push(edge)
        visitModuleForCycles(
            edge.providerModuleId,
            capabilityEdgesByConsumerModuleId,
            visitStateByModuleId,
            moduleIdStack,
            edgeStack,
            cycles
        )
        edgeStack.pop()
    }

    moduleIdStack.pop()
    visitStateByModuleId.set(moduleId, 'visited')
}

function createModuleCyclePath(
    closingEdge: CapabilityDependencyEdge,
    moduleIdStack: readonly string[],
    edgeStack: readonly CapabilityDependencyEdge[]
): ModuleCyclePath {
    const startIndex = moduleIdStack.indexOf(closingEdge.providerModuleId)
    const cycleEdges = [...edgeStack.slice(startIndex), closingEdge]
    const moduleIdPath = Object.freeze([
        ...moduleIdStack.slice(startIndex),
        closingEdge.providerModuleId
    ])
    const tokenIdPath = Object.freeze(
        cycleEdges.map((edge) => {
            return edge.requiredTokenId
        })
    )
    const edgeKinds = Object.freeze(
        cycleEdges.map((edge) => {
            return edge.edgeKind
        })
    )

    return Object.freeze({
        moduleIdPath,
        tokenIdPath,
        edgeKinds
    })
}

function collectCapabilityEdgesByConsumerModuleId(
    edges: readonly ModuleDependencyEdge[]
): ReadonlyMap<string, readonly CapabilityDependencyEdge[]> {
    const edgesByModuleId = new Map<string, CapabilityDependencyEdge[]>()

    for (const edge of edges) {
        if (edge.edgeKind !== 'capability') {
            continue
        }

        const moduleEdges = edgesByModuleId.get(edge.consumerModuleId)

        if (moduleEdges === undefined) {
            edgesByModuleId.set(edge.consumerModuleId, [edge])
        } else {
            moduleEdges.push(edge)
        }
    }

    return edgesByModuleId
}

function collectProvidedTokenIds(modules: readonly ModuleDefinition[]): ReadonlySet<string> {
    const tokenIds = new Set<string>()

    for (const moduleDefinition of modules) {
        for (const capability of moduleDefinition.provides) {
            tokenIds.add(capability.token.id)
        }
    }

    return tokenIds
}

function collectBindingTokenIds(bindings: readonly ComposerBindingRecord[]): ReadonlySet<string> {
    const tokenIds = new Set<string>()

    for (const binding of bindings) {
        tokenIds.add(binding.token.id)
    }

    return tokenIds
}

function collectFirstCapabilityByTokenId(
    modules: readonly ModuleDefinition[]
): ReadonlyMap<string, CapabilityDependencyRecord> {
    const capabilitiesByTokenId = new Map<string, CapabilityDependencyRecord>()

    for (const moduleDefinition of modules) {
        for (const capability of moduleDefinition.provides) {
            if (capabilitiesByTokenId.has(capability.token.id)) {
                continue
            }

            capabilitiesByTokenId.set(capability.token.id, {
                moduleId: moduleDefinition.id,
                tokenId: capability.token.id,
                kind: capability.kind
            })
        }
    }

    return capabilitiesByTokenId
}

function collectFirstBindingByTokenId(
    bindings: readonly ComposerBindingRecord[]
): ReadonlyMap<string, ComposerBindingRecord> {
    const bindingsByTokenId = new Map<string, ComposerBindingRecord>()

    for (const binding of bindings) {
        if (bindingsByTokenId.has(binding.token.id)) {
            continue
        }

        bindingsByTokenId.set(binding.token.id, binding)
    }

    return bindingsByTokenId
}

function collectRequiredPortTokenIds(modules: readonly ModuleDefinition[]): ReadonlySet<string> {
    const tokenIds = new Set<string>()

    for (const moduleDefinition of modules) {
        for (const dependency of moduleDefinition.requires) {
            tokenIds.add(dependency.token.id)
        }
    }

    return tokenIds
}

function collectRequiredTokenIdsByModuleId(
    modules: readonly ModuleDefinition[]
): ReadonlyMap<string, ReadonlySet<string>> {
    const tokenIdsByModuleId = new Map<string, ReadonlySet<string>>()

    for (const moduleDefinition of modules) {
        const tokenIds = new Set<string>()

        for (const dependency of moduleDefinition.requires) {
            tokenIds.add(dependency.token.id)
        }

        tokenIdsByModuleId.set(moduleDefinition.id, tokenIds)
    }

    return tokenIdsByModuleId
}

function collectProvidedTokenIdsByModuleId(
    modules: readonly ModuleDefinition[]
): ReadonlyMap<string, ReadonlySet<string>> {
    const tokenIdsByModuleId = new Map<string, ReadonlySet<string>>()

    for (const moduleDefinition of modules) {
        const tokenIds = new Set<string>()

        for (const capability of moduleDefinition.provides) {
            tokenIds.add(capability.token.id)
        }

        tokenIdsByModuleId.set(moduleDefinition.id, tokenIds)
    }

    return tokenIdsByModuleId
}

function resolveModuleRegistrationToken<TValue>(
    moduleDefinition: ModuleDefinition,
    originalToken: Token<TValue>,
    access: CompositionAccessModel
): {
    readonly token: Token<TValue>
    readonly visibility: 'exported' | 'private'
} {
    if (moduleProvidesToken(moduleDefinition, originalToken.id, access)) {
        return {
            token: originalToken,
            visibility: 'exported'
        }
    }

    return {
        token: getOrCreatePrivateToken(moduleDefinition.id, originalToken, access),
        visibility: 'private'
    }
}

function resolveModuleAccessToken<TValue>(
    moduleDefinition: ModuleDefinition,
    originalToken: Token<TValue>,
    access: CompositionAccessModel
): Token<TValue> {
    const privateToken = access.privateTokensByModuleId
        .get(moduleDefinition.id)
        ?.get(originalToken.id)

    if (privateToken !== undefined) {
        return privateToken as Token<TValue>
    }

    if (
        moduleProvidesToken(moduleDefinition, originalToken.id, access) ||
        moduleRequiresToken(moduleDefinition, originalToken.id, access)
    ) {
        return originalToken
    }

    throw new PrivateProviderAccessError(
        originalToken.id,
        'module',
        'token-not-visible',
        moduleDefinition.id
    )
}

function getOrCreatePrivateToken<TValue>(
    moduleId: string,
    originalToken: Token<TValue>,
    access: CompositionAccessModel
): Token<TValue> {
    let privateTokens = access.privateTokensByModuleId.get(moduleId)

    if (privateTokens === undefined) {
        privateTokens = new Map<string, Token<unknown>>()
        access.privateTokensByModuleId.set(moduleId, privateTokens)
    }

    const existingPrivateToken = privateTokens.get(originalToken.id)

    if (existingPrivateToken !== undefined) {
        return existingPrivateToken as Token<TValue>
    }

    const privateToken = createPrivateToken(moduleId, originalToken)

    privateTokens.set(originalToken.id, privateToken)

    return privateToken
}

function createPrivateToken<TValue>(moduleId: string, originalToken: Token<TValue>): Token<TValue> {
    const description = originalToken.description
    const tokenId =
        `sagifire/ioc/private/${moduleId.length}:${moduleId}/` +
        `${originalToken.id.length}:${originalToken.id}`
    const privateToken =
        description === undefined
            ? {
                  id: tokenId
              }
            : {
                  id: tokenId,
                  description
              }

    return Object.freeze(privateToken)
}

function recordModuleProvider(
    moduleDefinition: ModuleDefinition,
    originalToken: Token<unknown>,
    registrationKind: ProviderRegistrationKind,
    providerRegistration: ProviderRegistrationRecord,
    access: CompositionAccessModel
): void {
    if (!moduleProvidesToken(moduleDefinition, originalToken.id, access)) {
        return
    }

    const capability = moduleDefinition.provides.find((providedCapability) => {
        return providedCapability.token.id === originalToken.id
    })

    if (capability === undefined) {
        return
    }

    const existingRegistration = access.registeredCapabilities.get(originalToken.id)

    if (existingRegistration !== undefined) {
        existingRegistration.providers.push(providerRegistration)

        return
    }

    access.registeredCapabilities.set(originalToken.id, {
        moduleId: moduleDefinition.id,
        tokenId: originalToken.id,
        kind: capability.kind,
        registrationKind,
        providers: [providerRegistration]
    })
}

function validateDeclaredProviderRegistrations(
    modules: readonly ModuleDefinition[],
    access: CompositionAccessModel
): DiagnosticReport {
    const diagnostics: Diagnostic[] = []

    for (const moduleDefinition of modules) {
        for (const capability of moduleDefinition.provides) {
            const registeredCapability = access.registeredCapabilities.get(capability.token.id)

            if (registeredCapability?.moduleId !== moduleDefinition.id) {
                diagnostics.push(
                    diagnosticFromError(
                        new MissingModuleProviderError(moduleDefinition.id, capability.token.id)
                    )
                )
            }
        }
    }

    return createDiagnosticReport(diagnostics)
}

function createPreparedComposition(
    modules: readonly ModuleDefinition[],
    access: CompositionAccessModel
): PreparedComposition {
    const preparedModules = Object.freeze(
        modules.map((moduleDefinition) => {
            return createPreparedCompositionModule(moduleDefinition)
        })
    )
    const capabilities = Object.freeze(
        [...access.registeredCapabilities.values()].map((capability) => {
            return Object.freeze({
                moduleId: capability.moduleId,
                tokenId: capability.tokenId,
                kind: capability.kind,
                registrationKind: capability.registrationKind
            })
        })
    )

    return Object.freeze({
        modules: preparedModules,
        capabilities
    })
}

function createPreparedCompositionModule(
    moduleDefinition: ModuleDefinition
): PreparedCompositionModule {
    if (moduleDefinition.version === undefined) {
        return Object.freeze({
            id: moduleDefinition.id
        })
    }

    return Object.freeze({
        id: moduleDefinition.id,
        version: moduleDefinition.version
    })
}

function moduleProvidesToken(
    moduleDefinition: ModuleDefinition,
    tokenId: string,
    access: CompositionAccessModel
): boolean {
    return access.providedTokenIdsByModuleId.get(moduleDefinition.id)?.has(tokenId) ?? false
}

function moduleRequiresToken(
    moduleDefinition: ModuleDefinition,
    tokenId: string,
    access: CompositionAccessModel
): boolean {
    return access.requiredTokenIdsByModuleId.get(moduleDefinition.id)?.has(tokenId) ?? false
}

function createDiagnosticReport(diagnostics: readonly Diagnostic[]): DiagnosticReport {
    const reportDiagnostics = Object.freeze([...diagnostics])

    return Object.freeze({
        ok: reportDiagnostics.length === 0,
        diagnostics: reportDiagnostics
    })
}

function createModuleDefinition<
    TMetadata,
    TRequires extends readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinition[]
>(
    definition: ModuleDefinitionInput<TMetadata, TRequires, TProvides>,
    moduleId: string,
    version: string | undefined,
    setup: ModuleSetupFunction<TMetadata>,
    requires: NormalizedModuleDependencies<TRequires>,
    provides: NormalizedModuleCapabilities<TProvides>
): ModuleDefinition<
    TMetadata,
    NormalizedModuleDependencies<TRequires>,
    NormalizedModuleCapabilities<TProvides>
> {
    const withVersion =
        version === undefined
            ? {
                  id: moduleId,
                  requires,
                  provides,
                  setup
              }
            : {
                  id: moduleId,
                  version,
                  requires,
                  provides,
                  setup
              }

    const metadata = definition.metadata
    const normalizedDefinition =
        metadata === undefined
            ? withVersion
            : {
                  ...withVersion,
                  metadata
              }

    return Object.freeze(normalizedDefinition) as ModuleDefinition<
        TMetadata,
        NormalizedModuleDependencies<TRequires>,
        NormalizedModuleCapabilities<TProvides>
    >
}

function normalizeDependency(
    moduleId: string,
    dependency: unknown,
    index: number
): ModuleDependencyDefinition {
    if (!isRecord(dependency)) {
        throw new InvalidModuleDefinitionError(`requires[${index}] must be an object`, {
            moduleId,
            value: dependency
        })
    }

    const dependencyToken = validateToken(dependency.token, moduleId, `requires[${index}].token`)
    const required = validateOptionalBoolean(
        dependency.required,
        moduleId,
        `requires[${index}].required`
    )
    const kind = validateDependencyKind(dependency.kind, moduleId, `requires[${index}].kind`)
    const description = validateOptionalString(
        dependency.description,
        moduleId,
        `requires[${index}].description`
    )
    const normalized =
        description === undefined
            ? {
                  token: dependencyToken,
                  required: required ?? true,
                  kind: kind ?? 'external'
              }
            : {
                  token: dependencyToken,
                  required: required ?? true,
                  kind: kind ?? 'external',
                  description
              }

    return Object.freeze(normalized)
}

function normalizeCapability(
    moduleId: string,
    capability: unknown,
    index: number
): ModuleCapabilityDefinition {
    if (!isRecord(capability)) {
        throw new InvalidModuleDefinitionError(`provides[${index}] must be an object`, {
            moduleId,
            value: capability
        })
    }

    const capabilityToken = validateToken(capability.token, moduleId, `provides[${index}].token`)
    const kind = validateCapabilityKind(capability.kind, moduleId, `provides[${index}].kind`)
    const description = validateOptionalString(
        capability.description,
        moduleId,
        `provides[${index}].description`
    )
    const normalized =
        description === undefined
            ? {
                  token: capabilityToken,
                  kind
              }
            : {
                  token: capabilityToken,
                  kind,
                  description
              }

    return Object.freeze(normalized)
}

function validateModuleId(value: unknown): string {
    if (typeof value !== 'string') {
        throw new InvalidModuleDefinitionError('module id must be a string', {
            value
        })
    }

    if (value.length === 0) {
        throw new InvalidModuleDefinitionError('module id must not be empty', {
            value
        })
    }

    if (value.trim() !== value) {
        throw new InvalidModuleDefinitionError(
            'module id must not have leading or trailing whitespace',
            {
                value
            }
        )
    }

    if (!moduleIdPattern.test(value)) {
        throw new InvalidModuleDefinitionError(
            'module id may contain only ASCII letters, ASCII digits, ".", "-", "_", ":", and "/"',
            {
                value
            }
        )
    }

    return value
}

function validateSetup<TMetadata>(
    value: unknown,
    moduleId: string
): ModuleSetupFunction<TMetadata> {
    if (typeof value !== 'function') {
        throw new InvalidModuleDefinitionError('setup must be a function', {
            moduleId,
            value
        })
    }

    return value as ModuleSetupFunction<TMetadata>
}

function validateDefinitionArray(
    value: unknown,
    moduleId: string,
    section: 'requires' | 'provides'
): readonly unknown[] {
    if (value === undefined) {
        return []
    }

    if (!Array.isArray(value)) {
        throw new InvalidModuleDefinitionError(`${section} must be an array when provided`, {
            moduleId,
            value
        })
    }

    return value
}

function validateToken(value: unknown, moduleId: string, field: string): Token<unknown> {
    if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0) {
        throw new InvalidModuleDefinitionError(`${field} must be a token with a stable id`, {
            moduleId,
            value
        })
    }

    return value as unknown as Token<unknown>
}

function validateOptionalString(
    value: unknown,
    moduleId: string,
    field: string
): string | undefined {
    if (value === undefined) {
        return undefined
    }

    if (typeof value !== 'string') {
        throw new InvalidModuleDefinitionError(`${field} must be a string when provided`, {
            moduleId,
            value
        })
    }

    return value
}

function validateOptionalBoolean(
    value: unknown,
    moduleId: string,
    field: string
): boolean | undefined {
    if (value === undefined) {
        return undefined
    }

    if (typeof value !== 'boolean') {
        throw new InvalidModuleDefinitionError(`${field} must be a boolean when provided`, {
            moduleId,
            value
        })
    }

    return value
}

function validateDependencyKind(
    value: unknown,
    moduleId: string,
    field: string
): ModuleDependencyKind | undefined {
    if (value === undefined) {
        return undefined
    }

    if (!isModuleDependencyKind(value)) {
        throw new InvalidModuleDefinitionError(
            `${field} must be "external" or "shared" when provided`,
            {
                moduleId,
                value
            }
        )
    }

    return value
}

function validateCapabilityKind(
    value: unknown,
    moduleId: string,
    field: string
): ModuleCapabilityKind {
    if (!isModuleCapabilityKind(value)) {
        throw new InvalidModuleDefinitionError(`${field} must be a known capability kind`, {
            moduleId,
            value
        })
    }

    return value
}

function assertNoDuplicateDependencies(
    moduleId: string,
    dependencies: readonly ModuleDependencyDefinition[]
): void {
    const seenTokenIds = new Set<string>()

    for (const dependency of dependencies) {
        const tokenId = dependency.token.id

        if (seenTokenIds.has(tokenId)) {
            throw new DuplicateModuleDependencyError(moduleId, tokenId)
        }

        seenTokenIds.add(tokenId)
    }
}

function assertNoDuplicateCapabilities(
    moduleId: string,
    capabilities: readonly ModuleCapabilityDefinition[]
): void {
    const seenTokenIds = new Set<string>()

    for (const capability of capabilities) {
        const tokenId = capability.token.id

        if (seenTokenIds.has(tokenId)) {
            throw new DuplicateModuleCapabilityError(moduleId, tokenId)
        }

        seenTokenIds.add(tokenId)
    }
}

function createInvalidModuleDefinitionDetails(
    reason: string,
    options: InvalidModuleDefinitionErrorOptions
): InvalidModuleDefinitionErrorDetails {
    const valueDetails = createInvalidValueDetails(options.value)
    const details =
        options.moduleId === undefined
            ? {
                  reason,
                  ...valueDetails
              }
            : {
                  moduleId: options.moduleId,
                  reason,
                  ...valueDetails
              }

    return details
}

function createInvalidValueDetails(
    value: unknown
): Pick<InvalidModuleDefinitionErrorDetails, 'value' | 'valueType'> {
    if (value === undefined) {
        return {}
    }

    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
    ) {
        return {
            value
        }
    }

    return {
        valueType: getValueType(value)
    }
}

function formatInvalidModuleDefinitionMessage(
    reason: string,
    moduleId: string | undefined
): string {
    if (moduleId === undefined) {
        return `Invalid module definition: ${reason}`
    }

    return `Invalid module definition "${moduleId}": ${reason}`
}

function formatPrivateProviderAccessMessage(
    tokenId: string,
    requester: 'module' | 'composer-binding' | 'runtime',
    reason: PrivateProviderAccessReason,
    moduleId: string | undefined
): string {
    if (reason === 'composition-not-ready' && moduleId !== undefined) {
        return (
            `Module "${moduleId}" cannot resolve token "${tokenId}" during setup registration; ` +
            'composition is not ready yet'
        )
    }

    if (requester === 'module' && moduleId !== undefined) {
        return `Module "${moduleId}" cannot resolve non-visible provider token "${tokenId}"`
    }

    if (requester === 'runtime') {
        return `Composed runtime cannot resolve non-exported capability token "${tokenId}"`
    }

    return `Composer binding cannot resolve non-visible provider token "${tokenId}"`
}

function isModuleDependencyKind(value: unknown): value is ModuleDependencyKind {
    return moduleDependencyKinds.includes(value as ModuleDependencyKind)
}

function isModuleCapabilityKind(value: unknown): value is ModuleCapabilityKind {
    return moduleCapabilityKinds.includes(value as ModuleCapabilityKind)
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getValueType(value: unknown): string {
    if (value === null) {
        return 'null'
    }

    if (Array.isArray(value)) {
        return 'array'
    }

    return typeof value
}
