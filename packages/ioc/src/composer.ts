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
import { getLifetimeValidationReport } from './lifetime-validation'
import type { LifetimeValidationOptions, LifetimeValidationReport } from './lifetime-validation'
import {
    createPrivateProviderRegistrationIdentity,
    setProviderRegistrationIdentity
} from './provider-identity'
import type { ProviderRegistrationIdentity } from './provider-identity'
import {
    getProviderGraphSnapshot,
    mapProviderDependencyOptions,
    providerGraphSnapshotBridge
} from './provider-metadata'
import type {
    ProviderDependencyOptions,
    ProviderDependencyTarget,
    ProviderGraphSnapshotAwareRuntime
} from './provider-metadata'
import type { Token } from './tokens'

export type ModuleDependencyKind = 'external' | 'shared'

export type ModuleCardinality = 'single' | 'multi'

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
    readonly cardinality?: ModuleCardinality
    readonly description?: string
}

export interface ModuleDependencyDefinitionInput<TValue = unknown> {
    readonly token: Token<TValue>
    readonly required?: boolean
    readonly kind?: ModuleDependencyKind
    readonly cardinality?: ModuleCardinality
    readonly description?: string
}

export interface ModuleCapabilityDefinitionInput<TValue = unknown> {
    readonly token: Token<TValue>
    readonly kind: ModuleCapabilityKind
    readonly cardinality?: ModuleCardinality
    readonly description?: string
}

export interface ModuleCapabilityDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly kind: ModuleCapabilityKind
    readonly cardinality?: ModuleCardinality
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
    TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinitionInput[] =
        readonly ModuleCapabilityDefinitionInput[]
> {
    readonly id: string
    readonly version?: string
    readonly metadata?: TMetadata
    readonly requires?: TRequires
    readonly provides?: TProvides
    readonly setup: ModuleSetupFunction<TMetadata>
}

type Awaitable<TValue> = TValue | Promise<TValue>

export type ComposerBindingKind = 'value' | 'factory' | 'class' | 'async-factory' | 'adapter'

export type InspectionProviderKind =
    'value' | 'factory' | 'class' | 'async-factory' | 'async-resource'

export type RequiredPortSatisfaction = 'binding' | 'capability' | 'optional' | 'missing'

export type ModuleDependencyEdgeKind = 'capability' | 'binding' | 'adapter-source'

export type CapabilityProviderRegistrationKind = 'bind' | 'add'

export type CapabilityProviderSource = 'module' | 'composition-root'

export type ProviderRegistrationSource = 'module' | 'composition-root'

export type ComposerMultiBindingKind = 'value' | 'factory'

export interface ComposerBindingContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAllAsync<TValue>(token: Token<TValue>): Promise<TValue[]>
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
}

export type ComposerBindingFactory<TValue> = (context: ComposerBindingContext) => TValue

export type ComposerAsyncBindingFactory<TValue> = (
    context: ComposerBindingContext
) => Awaitable<TValue>

export type ComposerAdapterSource =
    | Token<unknown>
    | {
          readonly [property: string]: Token<unknown>
      }

export type ComposerAdapterResolvedSource<TSource extends ComposerAdapterSource> =
    TSource extends Token<infer TValue>
        ? TValue
        : {
              readonly [TProperty in keyof TSource]: TSource[TProperty] extends Token<infer TValue>
                  ? TValue
                  : never
          }

export type ComposerAdapterFactory<TSource extends ComposerAdapterSource, TValue> = (
    source: ComposerAdapterResolvedSource<TSource>
) => TValue

export interface ComposerBindingBuilder<TValue> {
    toValue(value: TValue): void
    toFactory(factory: ComposerBindingFactory<TValue>, options?: ProviderDependencyOptions): void
    toClass(classConstructor: ClassConstructor<TValue>): void
    toAsyncFactory(
        factory: ComposerAsyncBindingFactory<TValue>,
        options?: ProviderDependencyOptions
    ): void
}

export interface ComposerMultiBindingBuilder<TValue> {
    toValue(value: TValue): void
    toFactory(
        factory: ComposerBindingFactory<TValue>,
        options?: ProviderDependencyOptions
    ): LifetimeBinding
}

export interface ComposerAdapterBuilder<TValue> {
    from<const TSource extends ComposerAdapterSource>(
        source: TSource
    ): ComposerAdapterUsingBuilder<TValue, TSource>
}

export interface ComposerAdapterUsingBuilder<TValue, TSource extends ComposerAdapterSource> {
    using(factory: ComposerAdapterFactory<TSource, TValue>): void
}

export interface Composer {
    use(moduleDefinition: ModuleDefinition): Composer
    bind<TValue>(token: Token<TValue>): ComposerBindingBuilder<TValue>
    add<TValue>(token: Token<TValue>): ComposerMultiBindingBuilder<TValue>
    adapt<TValue>(token: Token<TValue>): ComposerAdapterBuilder<TValue>
    validate(): DiagnosticReport
    inspect(): ComposerInspection
    getGraph(): ModuleGraph
    prepare(): Promise<PreparedComposition>
    compose(): Promise<ComposedRuntime>
}

export interface ComposerOptions {
    readonly lifetimeValidation?: LifetimeValidationOptions
}

export interface ComposedRuntime {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAllAsync<TValue>(token: Token<TValue>): Promise<TValue[]>
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
    readonly cardinality: ModuleCardinality
    readonly providerCount: number
    readonly description?: string
    readonly satisfiedBy: RequiredPortSatisfaction
}

export interface CapabilityProviderMetadata {
    readonly source: CapabilityProviderSource
    readonly moduleId?: string
    readonly registrationKind: CapabilityProviderRegistrationKind
    readonly registrationIndex: number
}

export interface CapabilityMetadata {
    readonly moduleId: string
    readonly tokenId: string
    readonly kind: ModuleCapabilityKind
    readonly cardinality: ModuleCardinality
    readonly providers: readonly CapabilityProviderMetadata[]
    readonly description?: string
}

export interface CompositionBindingMetadata {
    readonly tokenId: string
    readonly kind: ComposerBindingKind
    readonly providerKind: InspectionProviderKind
    readonly lifetime?: ProviderLifetime
    readonly initialization?: AsyncProviderInitializationMode
    readonly adapterSource?: ComposerAdapterSourceMetadata
}

export type ComposerAdapterSourceMetadata =
    ComposerAdapterTokenSourceMetadata | ComposerAdapterObjectSourceMetadata

export interface ComposerAdapterTokenSourceMetadata {
    readonly kind: 'token'
    readonly tokenId: string
    readonly providers: readonly ComposerAdapterSourceProviderMetadata[]
}

export interface ComposerAdapterObjectSourceMetadata {
    readonly kind: 'object'
    readonly properties: readonly ComposerAdapterObjectSourcePropertyMetadata[]
}

export interface ComposerAdapterObjectSourcePropertyMetadata {
    readonly property: string
    readonly tokenId: string
    readonly providers: readonly ComposerAdapterSourceProviderMetadata[]
}

export type ComposerAdapterSourceProviderMetadata =
    | ComposerAdapterSourceCapabilityProviderMetadata
    | ComposerAdapterSourceBindingProviderMetadata
    | ComposerAdapterSourceMultiBindingProviderMetadata

export interface ComposerAdapterSourceCapabilityProviderMetadata {
    readonly source: 'module'
    readonly providerKind: 'capability'
    readonly moduleId: string
    readonly tokenId: string
    readonly capabilityKind: ModuleCapabilityKind
    readonly cardinality: ModuleCardinality
    readonly registrationKind: CapabilityProviderRegistrationKind
    readonly registrationIndex: number
}

export interface ComposerAdapterSourceBindingProviderMetadata {
    readonly source: 'composition-root'
    readonly providerKind: 'binding'
    readonly tokenId: string
    readonly bindingKind: ComposerBindingKind
    readonly cardinality: 'single'
    readonly registrationIndex: number
}

export interface ComposerAdapterSourceMultiBindingProviderMetadata {
    readonly source: 'composition-root'
    readonly providerKind: 'multi-binding'
    readonly tokenId: string
    readonly bindingKind: ComposerMultiBindingKind
    readonly cardinality: 'multi'
    readonly registrationIndex: number
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

export interface AdapterSourceDependencyEdge extends ModuleDependencyEdgeBase {
    readonly edgeKind: 'adapter-source'
    readonly adapterTargetTokenId: string
    readonly adapterSourceTokenId: string
    readonly adapterSourceKind: 'token' | 'object'
    readonly adapterSourceProperty?: string
    readonly sourceProvider?: ComposerAdapterSourceProviderMetadata
}

export type ModuleDependencyEdge =
    CapabilityDependencyEdge | BindingDependencyEdge | AdapterSourceDependencyEdge

export interface ProviderRegistrationProviderSummary {
    readonly providerKind: InspectionProviderKind
    readonly registrationIndex: number
    readonly lifetime?: ProviderLifetime
    readonly initialization?: AsyncProviderInitializationMode
}

export interface ProviderRegistrationSummary {
    readonly source: ProviderRegistrationSource
    readonly moduleId?: string
    readonly tokenId: string
    readonly capabilityKind: ModuleCapabilityKind
    readonly cardinality: ModuleCardinality
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
    readonly lifetimeValidation?: LifetimeValidationReport
    readonly providerRegistrations: readonly ProviderRegistrationSummary[]
}

export interface PreparedCompositionModule {
    readonly id: string
    readonly version?: string
}

export interface PreparedCompositionCapability {
    readonly source: ProviderRegistrationSource
    readonly moduleId?: string
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

export interface CapabilityCardinalityConflictErrorDetails {
    readonly tokenId: string
    readonly singleSources: readonly string[]
    readonly multiSources: readonly string[]
}

export interface RequiredMultiCapabilityMissingErrorDetails {
    readonly moduleId: string
    readonly tokenId: string
    readonly dependencyKind: ModuleDependencyKind
}

export interface RequiredPortCardinalityMismatchErrorDetails {
    readonly moduleId: string
    readonly tokenId: string
    readonly dependencyKind: ModuleDependencyKind
    readonly requiredCardinality: ModuleCardinality
    readonly providerCardinality: ModuleCardinality
    readonly providerSource: 'binding' | 'capability'
}

export interface CapabilityRegistrationCardinalityMismatchErrorDetails {
    readonly moduleId: string
    readonly tokenId: string
    readonly declaredCardinality: ModuleCardinality
    readonly registrationKind: ProviderRegistrationKind
}

export interface GetUsedForMultiTokenErrorDetails {
    readonly tokenId: string
    readonly accessMethod: 'get' | 'tryGet' | 'getAsync' | 'tryGetAsync'
    readonly cardinality: 'multi'
}

export interface GetAllUsedForSingleTokenErrorDetails {
    readonly tokenId: string
    readonly accessMethod: 'getAll'
    readonly cardinality: 'single'
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

export type InvalidComposerMultiBindingReason =
    'missing-public-multi-capability' | 'required-port-only' | 'single-capability'

export interface InvalidComposerMultiBindingErrorDetails {
    readonly tokenId: string
    readonly bindingKind: ComposerMultiBindingKind
    readonly reason: InvalidComposerMultiBindingReason
}

export interface AdapterSourceErrorDetails {
    readonly targetTokenId: string
    readonly sourceTokenId: string
    readonly sourceProperty?: string
}

export interface AdapterSourceCardinalityMismatchErrorDetails extends AdapterSourceErrorDetails {
    readonly expectedCardinality: 'single'
    readonly actualCardinality: 'multi'
    readonly providerSource: 'capability' | 'multi-binding'
}

export interface AdapterTargetInvalidErrorDetails {
    readonly targetTokenId: string
    readonly bindingKind: 'adapter'
    readonly reason: 'missing-external-required-port'
}

export interface ComposerBindingCardinalityConflictErrorDetails {
    readonly tokenId: string
    readonly bindingKinds: readonly ComposerBindingKind[]
    readonly multiBindingKinds: readonly ComposerMultiBindingKind[]
}

export interface DuplicateComposerBindingErrorDetails {
    readonly tokenId: string
    readonly bindingKinds: readonly ComposerBindingKind[]
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
        const moduleId = typeof moduleIdOrIds === 'string' ? moduleIdOrIds : moduleIdOrIds[0]
        const moduleIds = typeof moduleIdOrIds === 'string' ? [moduleIdOrIds] : [...moduleIdOrIds]
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

export class DuplicateSingleCapabilityError extends SagifireIocError<DuplicateModuleCapabilityErrorDetails> {
    override readonly name = 'DuplicateSingleCapabilityError'
    override readonly code = 'SAGIFIRE_IOC_DUPLICATE_SINGLE_CAPABILITY'
    readonly moduleId: string
    readonly moduleIds: readonly string[]
    readonly tokenId: string

    constructor(tokenId: string, moduleIds: readonly [string, string, ...string[]]) {
        const frozenModuleIds = Object.freeze([...moduleIds])
        const moduleId = moduleIds[0]

        super({
            code: 'SAGIFIRE_IOC_DUPLICATE_SINGLE_CAPABILITY',
            message:
                `Duplicate single capability "${tokenId}" in modules: ` +
                frozenModuleIds.join(', '),
            details: {
                moduleId,
                moduleIds: frozenModuleIds,
                tokenId,
                section: 'provides'
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = moduleId
        this.moduleIds = frozenModuleIds
        this.tokenId = tokenId
    }
}

export class CapabilityCardinalityConflictError extends SagifireIocError<CapabilityCardinalityConflictErrorDetails> {
    override readonly name = 'CapabilityCardinalityConflictError'
    override readonly code = 'SAGIFIRE_IOC_CAPABILITY_CARDINALITY_CONFLICT'
    readonly tokenId: string
    readonly singleSources: readonly string[]
    readonly multiSources: readonly string[]

    constructor(
        tokenId: string,
        singleSources: readonly [string, ...string[]],
        multiSources: readonly [string, ...string[]]
    ) {
        const frozenSingleSources = Object.freeze([...singleSources])
        const frozenMultiSources = Object.freeze([...multiSources])

        super({
            code: 'SAGIFIRE_IOC_CAPABILITY_CARDINALITY_CONFLICT',
            message:
                `Capability cardinality conflict for token "${tokenId}": ` +
                `single sources: ${frozenSingleSources.join(', ')}; ` +
                `multi sources: ${frozenMultiSources.join(', ')}`,
            details: {
                tokenId,
                singleSources: frozenSingleSources,
                multiSources: frozenMultiSources
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
        this.singleSources = frozenSingleSources
        this.multiSources = frozenMultiSources
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

export class RequiredMultiCapabilityMissingError extends SagifireIocError<RequiredMultiCapabilityMissingErrorDetails> {
    override readonly name = 'RequiredMultiCapabilityMissingError'
    override readonly code = 'SAGIFIRE_IOC_REQUIRED_MULTI_CAPABILITY_MISSING'
    readonly moduleId: string
    readonly tokenId: string
    readonly dependencyKind: ModuleDependencyKind

    constructor(moduleId: string, tokenId: string, dependencyKind: ModuleDependencyKind) {
        super({
            code: 'SAGIFIRE_IOC_REQUIRED_MULTI_CAPABILITY_MISSING',
            message:
                `Missing required multi capability "${tokenId}" for module "${moduleId}": ` +
                'at least one contributor is required',
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

export class RequiredPortCardinalityMismatchError extends SagifireIocError<RequiredPortCardinalityMismatchErrorDetails> {
    override readonly name = 'RequiredPortCardinalityMismatchError'
    override readonly code = 'SAGIFIRE_IOC_REQUIRED_PORT_CARDINALITY_MISMATCH'
    readonly moduleId: string
    readonly tokenId: string
    readonly dependencyKind: ModuleDependencyKind
    readonly requiredCardinality: ModuleCardinality
    readonly providerCardinality: ModuleCardinality
    readonly providerSource: 'binding' | 'capability'

    constructor(
        moduleId: string,
        tokenId: string,
        dependencyKind: ModuleDependencyKind,
        requiredCardinality: ModuleCardinality,
        providerCardinality: ModuleCardinality,
        providerSource: 'binding' | 'capability'
    ) {
        super({
            code: 'SAGIFIRE_IOC_REQUIRED_PORT_CARDINALITY_MISMATCH',
            message:
                `Required port "${tokenId}" for module "${moduleId}" expects ` +
                `${requiredCardinality} cardinality but ${providerSource} provides ` +
                `${providerCardinality} cardinality`,
            details: {
                moduleId,
                tokenId,
                dependencyKind,
                requiredCardinality,
                providerCardinality,
                providerSource
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = moduleId
        this.tokenId = tokenId
        this.dependencyKind = dependencyKind
        this.requiredCardinality = requiredCardinality
        this.providerCardinality = providerCardinality
        this.providerSource = providerSource
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

export class InvalidComposerMultiBindingError extends SagifireIocError<InvalidComposerMultiBindingErrorDetails> {
    override readonly name = 'InvalidComposerMultiBindingError'
    override readonly code = 'SAGIFIRE_IOC_INVALID_COMPOSER_MULTI_BINDING'
    readonly tokenId: string
    readonly bindingKind: ComposerMultiBindingKind
    readonly reason: InvalidComposerMultiBindingReason

    constructor(
        tokenId: string,
        bindingKind: ComposerMultiBindingKind,
        reason: InvalidComposerMultiBindingReason
    ) {
        super({
            code: 'SAGIFIRE_IOC_INVALID_COMPOSER_MULTI_BINDING',
            message:
                `Invalid composer multi binding for token "${tokenId}": ` +
                formatInvalidComposerMultiBindingReason(reason),
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

export class AdapterSourceMissingError extends SagifireIocError<AdapterSourceErrorDetails> {
    override readonly name = 'AdapterSourceMissingError'
    override readonly code = 'SAGIFIRE_IOC_ADAPTER_SOURCE_MISSING'
    readonly targetTokenId: string
    readonly sourceTokenId: string
    readonly sourceProperty: string | undefined

    constructor(targetTokenId: string, sourceTokenId: string, sourceProperty?: string) {
        const details = createAdapterSourceErrorDetails(
            targetTokenId,
            sourceTokenId,
            sourceProperty
        )

        super({
            code: 'SAGIFIRE_IOC_ADAPTER_SOURCE_MISSING',
            message: formatAdapterSourceMessage(
                targetTokenId,
                sourceTokenId,
                sourceProperty,
                'is not provided by a public capability or composition binding'
            ),
            details
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.targetTokenId = targetTokenId
        this.sourceTokenId = sourceTokenId
        this.sourceProperty = sourceProperty
    }
}

export class AdapterSourcePrivateError extends SagifireIocError<AdapterSourceErrorDetails> {
    override readonly name = 'AdapterSourcePrivateError'
    override readonly code = 'SAGIFIRE_IOC_ADAPTER_SOURCE_PRIVATE'
    readonly targetTokenId: string
    readonly sourceTokenId: string
    readonly sourceProperty: string | undefined

    constructor(targetTokenId: string, sourceTokenId: string, sourceProperty?: string) {
        const details = createAdapterSourceErrorDetails(
            targetTokenId,
            sourceTokenId,
            sourceProperty
        )

        super({
            code: 'SAGIFIRE_IOC_ADAPTER_SOURCE_PRIVATE',
            message: formatAdapterSourceMessage(
                targetTokenId,
                sourceTokenId,
                sourceProperty,
                'matches a module-private provider'
            ),
            details
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.targetTokenId = targetTokenId
        this.sourceTokenId = sourceTokenId
        this.sourceProperty = sourceProperty
    }
}

export class AdapterSourceCardinalityMismatchError extends SagifireIocError<AdapterSourceCardinalityMismatchErrorDetails> {
    override readonly name = 'AdapterSourceCardinalityMismatchError'
    override readonly code = 'SAGIFIRE_IOC_ADAPTER_SOURCE_CARDINALITY_MISMATCH'
    readonly targetTokenId: string
    readonly sourceTokenId: string
    readonly sourceProperty: string | undefined
    readonly expectedCardinality = 'single' as const
    readonly actualCardinality = 'multi' as const
    readonly providerSource: 'capability' | 'multi-binding'

    constructor(
        targetTokenId: string,
        sourceTokenId: string,
        providerSource: 'capability' | 'multi-binding',
        sourceProperty?: string
    ) {
        const baseDetails = createAdapterSourceErrorDetails(
            targetTokenId,
            sourceTokenId,
            sourceProperty
        )
        const details = Object.freeze({
            ...baseDetails,
            expectedCardinality: 'single' as const,
            actualCardinality: 'multi' as const,
            providerSource
        })

        super({
            code: 'SAGIFIRE_IOC_ADAPTER_SOURCE_CARDINALITY_MISMATCH',
            message: formatAdapterSourceMessage(
                targetTokenId,
                sourceTokenId,
                sourceProperty,
                `expects a single source but ${providerSource} is multi`
            ),
            details
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.targetTokenId = targetTokenId
        this.sourceTokenId = sourceTokenId
        this.sourceProperty = sourceProperty
        this.providerSource = providerSource
    }
}

export class AdapterTargetInvalidError extends SagifireIocError<AdapterTargetInvalidErrorDetails> {
    override readonly name = 'AdapterTargetInvalidError'
    override readonly code = 'SAGIFIRE_IOC_ADAPTER_TARGET_INVALID'
    readonly targetTokenId: string
    readonly bindingKind = 'adapter' as const
    readonly reason = 'missing-external-required-port' as const

    constructor(targetTokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_ADAPTER_TARGET_INVALID',
            message:
                `Invalid adapter target "${targetTokenId}": ` +
                'target is not declared as an external required port',
            details: {
                targetTokenId,
                bindingKind: 'adapter',
                reason: 'missing-external-required-port'
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.targetTokenId = targetTokenId
    }
}

export class ComposerBindingCardinalityConflictError extends SagifireIocError<ComposerBindingCardinalityConflictErrorDetails> {
    override readonly name = 'ComposerBindingCardinalityConflictError'
    override readonly code = 'SAGIFIRE_IOC_COMPOSER_BINDING_CARDINALITY_CONFLICT'
    readonly tokenId: string
    readonly bindingKinds: readonly ComposerBindingKind[]
    readonly multiBindingKinds: readonly ComposerMultiBindingKind[]

    constructor(
        tokenId: string,
        bindingKinds: readonly [ComposerBindingKind, ...ComposerBindingKind[]],
        multiBindingKinds: readonly [ComposerMultiBindingKind, ...ComposerMultiBindingKind[]]
    ) {
        const frozenBindingKinds = Object.freeze([...bindingKinds])
        const frozenMultiBindingKinds = Object.freeze([...multiBindingKinds])

        super({
            code: 'SAGIFIRE_IOC_COMPOSER_BINDING_CARDINALITY_CONFLICT',
            message:
                `Composer binding cardinality conflict for token "${tokenId}": ` +
                'bind() and add() cannot target the same token',
            details: {
                tokenId,
                bindingKinds: frozenBindingKinds,
                multiBindingKinds: frozenMultiBindingKinds
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
        this.bindingKinds = frozenBindingKinds
        this.multiBindingKinds = frozenMultiBindingKinds
    }
}

export class DuplicateComposerBindingError extends SagifireIocError<DuplicateComposerBindingErrorDetails> {
    override readonly name = 'DuplicateComposerBindingError'
    override readonly code = 'SAGIFIRE_IOC_DUPLICATE_COMPOSER_BINDING'
    readonly tokenId: string
    readonly bindingKinds: readonly ComposerBindingKind[]

    constructor(
        tokenId: string,
        bindingKinds: readonly [ComposerBindingKind, ComposerBindingKind, ...ComposerBindingKind[]]
    ) {
        const frozenBindingKinds = Object.freeze([...bindingKinds])

        super({
            code: 'SAGIFIRE_IOC_DUPLICATE_COMPOSER_BINDING',
            message: `Duplicate composer binding for token "${tokenId}"`,
            details: {
                tokenId,
                bindingKinds: frozenBindingKinds
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
        this.bindingKinds = frozenBindingKinds
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

export class CapabilityRegistrationCardinalityMismatchError extends SagifireIocError<CapabilityRegistrationCardinalityMismatchErrorDetails> {
    override readonly name = 'CapabilityRegistrationCardinalityMismatchError'
    override readonly code = 'SAGIFIRE_IOC_CAPABILITY_REGISTRATION_CARDINALITY_MISMATCH'
    readonly moduleId: string
    readonly tokenId: string
    readonly declaredCardinality: ModuleCardinality
    readonly registrationKind: ProviderRegistrationKind

    constructor(
        moduleId: string,
        tokenId: string,
        declaredCardinality: ModuleCardinality,
        registrationKind: ProviderRegistrationKind
    ) {
        super({
            code: 'SAGIFIRE_IOC_CAPABILITY_REGISTRATION_CARDINALITY_MISMATCH',
            message:
                `Module "${moduleId}" declares capability "${tokenId}" as ` +
                `${declaredCardinality} but registered it with ${registrationKind} provider API`,
            details: {
                moduleId,
                tokenId,
                declaredCardinality,
                registrationKind
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.moduleId = moduleId
        this.tokenId = tokenId
        this.declaredCardinality = declaredCardinality
        this.registrationKind = registrationKind
    }
}

export class GetUsedForMultiTokenError extends SagifireIocError<GetUsedForMultiTokenErrorDetails> {
    override readonly name = 'GetUsedForMultiTokenError'
    override readonly code = 'SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN'
    readonly tokenId: string
    readonly accessMethod: 'get' | 'tryGet' | 'getAsync' | 'tryGetAsync'
    readonly cardinality = 'multi' as const

    constructor(
        tokenId: string,
        accessMethod: 'get' | 'tryGet' | 'getAsync' | 'tryGetAsync' = 'get'
    ) {
        super({
            code: 'SAGIFIRE_IOC_GET_USED_FOR_MULTI_TOKEN',
            message:
                `Composed runtime ${accessMethod}() cannot resolve multi capability ` +
                `"${tokenId}"; use getAll() instead`,
            details: {
                tokenId,
                accessMethod,
                cardinality: 'multi'
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
        this.accessMethod = accessMethod
    }
}

export class GetAllUsedForSingleTokenError extends SagifireIocError<GetAllUsedForSingleTokenErrorDetails> {
    override readonly name = 'GetAllUsedForSingleTokenError'
    override readonly code = 'SAGIFIRE_IOC_GET_ALL_USED_FOR_SINGLE_TOKEN'
    readonly tokenId: string
    readonly accessMethod = 'getAll' as const
    readonly cardinality = 'single' as const

    constructor(tokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_GET_ALL_USED_FOR_SINGLE_TOKEN',
            message:
                `Composed runtime getAll() cannot resolve single capability "${tokenId}"; ` +
                'use get() instead',
            details: {
                tokenId,
                accessMethod: 'getAll',
                cardinality: 'single'
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
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

type NormalizedModuleDependencies<TRequires extends readonly ModuleDependencyDefinitionInput[]> = {
    readonly [TIndex in keyof TRequires]: TRequires[TIndex] extends ModuleDependencyDefinitionInput<
        infer TValue
    >
        ? NormalizedModuleDependencyDefinition<TValue>
        : never
}

type NormalizedModuleDependencyDefinition<TValue = unknown> = ModuleDependencyDefinition<TValue> & {
    readonly cardinality: ModuleCardinality
}

type NormalizedModuleCapabilities<TProvides extends readonly ModuleCapabilityDefinitionInput[]> = {
    readonly [TIndex in keyof TProvides]: TProvides[TIndex] extends ModuleCapabilityDefinitionInput<
        infer TValue
    >
        ? NormalizedModuleCapabilityDefinition<TValue>
        : never
}

type NormalizedModuleCapabilityDefinition<TValue = unknown> = ModuleCapabilityDefinition<TValue> & {
    readonly cardinality: ModuleCardinality
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
          readonly dependencyOptions: ProviderDependencyOptions | undefined
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
          readonly dependencyOptions: ProviderDependencyOptions | undefined
      }
    | {
          readonly kind: 'adapter'
          readonly token: Token<unknown>
          readonly source: ComposerAdapterSourceRecord
          readonly factory: (source: unknown) => unknown
      }

type ComposerAdapterSourceRecord =
    | {
          readonly kind: 'token'
          readonly token: Token<unknown>
      }
    | {
          readonly kind: 'object'
          readonly entries: readonly ComposerAdapterObjectSourceEntry[]
      }

interface ComposerAdapterObjectSourceEntry {
    readonly property: string
    readonly token: Token<unknown>
}

interface ComposerAdapterSourceEntryRecord {
    readonly property?: string
    readonly token: Token<unknown>
}

type ComposerMultiBindingRecord =
    | {
          readonly kind: 'value'
          readonly token: Token<unknown>
          readonly value: unknown
          readonly providerRegistration: ProviderRegistrationRecord
      }
    | {
          readonly kind: 'factory'
          readonly token: Token<unknown>
          readonly factory: ComposerBindingFactory<unknown>
          readonly dependencyOptions: ProviderDependencyOptions | undefined
          readonly providerRegistration: ProviderRegistrationRecord
      }

interface CapabilityDependencyRecord {
    readonly moduleId: string
    readonly tokenId: string
    readonly kind: ModuleCapabilityKind
    readonly cardinality: ModuleCardinality
}

interface CapabilityDeclarationRecord extends CapabilityDependencyRecord {
    readonly source: string
}

interface RequiredPortDeclarationRecord {
    readonly moduleId: string
    readonly tokenId: string
    readonly dependencyKind: ModuleDependencyKind
    readonly required: boolean
    readonly cardinality: ModuleCardinality
    readonly source: string
}

interface ModuleCyclePath {
    readonly moduleIdPath: readonly string[]
    readonly tokenIdPath: readonly string[]
    readonly edgeKinds: readonly ModuleDependencyEdgeKind[]
}

type ModuleCycleTraversalEdge = CapabilityDependencyEdge | AdapterSourceModuleDependencyEdge

type AdapterSourceModuleDependencyEdge = AdapterSourceDependencyEdge & {
    readonly sourceProvider: ComposerAdapterSourceCapabilityProviderMetadata
}

interface ProviderRegistrationRecord {
    readonly providerKind: InspectionProviderKind
    registrationIndex: number | undefined
    lifetime: ProviderLifetime | undefined
    initialization: AsyncProviderInitializationMode | undefined
}

interface RegisteredCapabilityProviderBase {
    readonly source: ProviderRegistrationSource
    readonly tokenId: string
    readonly kind: ModuleCapabilityKind
    readonly registrationKind: ProviderRegistrationKind
    readonly providers: ProviderRegistrationRecord[]
}

interface RegisteredModuleCapabilityProvider extends RegisteredCapabilityProviderBase {
    readonly source: 'module'
    readonly moduleId: string
}

interface RegisteredCompositionRootCapabilityProvider extends RegisteredCapabilityProviderBase {
    readonly source: 'composition-root'
}

type RegisteredCapabilityProvider =
    RegisteredModuleCapabilityProvider | RegisteredCompositionRootCapabilityProvider

interface CompositionAccessModel {
    readonly publicTokenIds: ReadonlySet<string>
    readonly bindingTokenIds: ReadonlySet<string>
    readonly capabilityDeclarationsByTokenId: ReadonlyMap<
        string,
        readonly CapabilityDeclarationRecord[]
    >
    readonly requiredTokenIdsByModuleId: ReadonlyMap<string, ReadonlySet<string>>
    readonly providedTokenIdsByModuleId: ReadonlyMap<string, ReadonlySet<string>>
    readonly privateTokensByModuleId: Map<string, Map<string, Token<unknown>>>
    readonly registeredCapabilities: Map<string, RegisteredCapabilityProvider[]>
}

interface LiveModuleSetupContext {
    readonly context: ModuleSetupContext
    activate(runtimeContext: ResolutionContext): void
}

type ModuleProviderIdentityAllocator = (
    token: Token<unknown>,
    visibility: 'exported' | 'private',
    registrationKind: ProviderRegistrationKind
) => ProviderRegistrationIdentity | undefined

type ModuleProviderDependencyMapper = (
    options: ProviderDependencyOptions | undefined
) => ProviderDependencyOptions | undefined

interface BuiltComposition {
    readonly modules: readonly ModuleDefinition[]
    readonly bindings: readonly ComposerBindingRecord[]
    readonly multiBindings: readonly ComposerMultiBindingRecord[]
    readonly access: CompositionAccessModel
    readonly runtime: ContainerRuntime
}

interface InvalidModuleDefinitionErrorOptions {
    readonly moduleId?: string
    readonly value?: unknown
}

const moduleIdPattern = /^[A-Za-z0-9._:/-]+$/
const moduleDependencyKinds: readonly ModuleDependencyKind[] = ['external', 'shared']
const moduleCardinalities: readonly ModuleCardinality[] = ['single', 'multi']
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
    const TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly ModuleCapabilityDefinitionInput[] =
        readonly ModuleCapabilityDefinitionInput[]
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

export function createComposer(options: ComposerOptions = {}): Composer {
    const modules: ModuleDefinition[] = []
    const bindings: ComposerBindingRecord[] = []
    const multiBindings: ComposerMultiBindingRecord[] = []
    const composerOptions: ComposerOptions = Object.freeze({
        ...(options.lifetimeValidation === undefined
            ? {}
            : {
                  lifetimeValidation: Object.freeze({ ...options.lifetimeValidation })
              })
    })

    const composer: Composer = {
        use(moduleDefinition: ModuleDefinition): Composer {
            modules.push(moduleDefinition)

            return composer
        },

        bind<TValue>(bindingToken: Token<TValue>): ComposerBindingBuilder<TValue> {
            return createComposerBindingBuilder(bindingToken, bindings)
        },

        add<TValue>(bindingToken: Token<TValue>): ComposerMultiBindingBuilder<TValue> {
            return createComposerMultiBindingBuilder(bindingToken, multiBindings)
        },

        adapt<TValue>(bindingToken: Token<TValue>): ComposerAdapterBuilder<TValue> {
            return createComposerAdapterBuilder(bindingToken, bindings)
        },

        validate(): DiagnosticReport {
            return validateComposer(modules, bindings, multiBindings)
        },

        inspect(): ComposerInspection {
            return createComposerInspection(modules, bindings, multiBindings)
        },

        getGraph(): ModuleGraph {
            return createModuleGraph(modules, bindings, multiBindings)
        },

        prepare(): Promise<PreparedComposition> {
            return prepareComposition(modules, bindings, multiBindings, composerOptions)
        },

        compose(): Promise<ComposedRuntime> {
            return composeRuntime(modules, bindings, multiBindings, composerOptions)
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

        toFactory(
            factory: ComposerBindingFactory<TValue>,
            options?: ProviderDependencyOptions
        ): void {
            bindings.push({
                kind: 'factory',
                token: bindingToken,
                factory,
                dependencyOptions: options
            })
        },

        toClass(classConstructor: ClassConstructor<TValue>): void {
            bindings.push({
                kind: 'class',
                token: bindingToken,
                classConstructor
            })
        },

        toAsyncFactory(
            factory: ComposerAsyncBindingFactory<TValue>,
            options?: ProviderDependencyOptions
        ): void {
            bindings.push({
                kind: 'async-factory',
                token: bindingToken,
                factory,
                dependencyOptions: options
            })
        }
    }
}

function createComposerMultiBindingBuilder<TValue>(
    bindingToken: Token<TValue>,
    multiBindings: ComposerMultiBindingRecord[]
): ComposerMultiBindingBuilder<TValue> {
    return {
        toValue(value: TValue): void {
            multiBindings.push({
                kind: 'value',
                token: bindingToken,
                value,
                providerRegistration: createProviderRegistrationRecord('value', 'singleton')
            })
        },

        toFactory(
            factory: ComposerBindingFactory<TValue>,
            options?: ProviderDependencyOptions
        ): LifetimeBinding {
            const providerRegistration = createProviderRegistrationRecord('factory', 'transient')

            multiBindings.push({
                kind: 'factory',
                token: bindingToken,
                factory,
                dependencyOptions: options,
                providerRegistration
            })

            return createDeferredLifetimeBinding(providerRegistration)
        }
    }
}

function createComposerAdapterBuilder<TValue>(
    bindingToken: Token<TValue>,
    bindings: ComposerBindingRecord[]
): ComposerAdapterBuilder<TValue> {
    return {
        from<const TSource extends ComposerAdapterSource>(
            source: TSource
        ): ComposerAdapterUsingBuilder<TValue, TSource> {
            const adapterSource = createComposerAdapterSourceRecord(source)

            return Object.freeze({
                using(factory: ComposerAdapterFactory<TSource, TValue>): void {
                    bindings.push({
                        kind: 'adapter',
                        token: bindingToken,
                        source: adapterSource,
                        factory: factory as (source: unknown) => unknown
                    })
                }
            })
        }
    }
}

function createComposerAdapterSourceRecord(
    source: ComposerAdapterSource
): ComposerAdapterSourceRecord {
    if (isToken(source)) {
        return Object.freeze({
            kind: 'token',
            token: source
        })
    }

    const entries = Object.freeze(
        Object.entries(source).map(([property, sourceToken]) => {
            return Object.freeze({
                property,
                token: sourceToken
            })
        })
    )

    return Object.freeze({
        kind: 'object',
        entries
    })
}

function getComposerAdapterSourceEntries(
    source: ComposerAdapterSourceRecord
): readonly ComposerAdapterSourceEntryRecord[] {
    if (source.kind === 'token') {
        return Object.freeze([
            Object.freeze({
                token: source.token
            })
        ])
    }

    return Object.freeze(
        source.entries.map((entry) => {
            return Object.freeze({
                property: entry.property,
                token: entry.token
            })
        })
    )
}

function createComposerInspection(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[]
): ComposerInspection {
    const moduleSnapshot = [...modules]
    const bindingSnapshot = [...bindings]
    const multiBindingSnapshot = [...multiBindings]
    const graph = createModuleGraph(moduleSnapshot, bindingSnapshot, multiBindingSnapshot)

    return Object.freeze({
        modules: graph.modules,
        requiredPorts: graph.requiredPorts,
        capabilities: graph.capabilities,
        bindings: graph.bindings,
        edges: graph.edges,
        graph,
        validation: validateComposer(moduleSnapshot, bindingSnapshot, multiBindingSnapshot)
    })
}

function createRuntimeInspection(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[],
    access: CompositionAccessModel,
    lifetimeValidation: LifetimeValidationReport
): RuntimeInspection {
    const graph = createModuleGraph(modules, bindings, multiBindings)

    return Object.freeze({
        modules: graph.modules,
        requiredPorts: graph.requiredPorts,
        capabilities: graph.capabilities,
        bindings: graph.bindings,
        edges: graph.edges,
        graph,
        validation: validateComposer(modules, bindings, multiBindings),
        ...(lifetimeValidation.mode === 'off' ? {} : { lifetimeValidation }),
        providerRegistrations: createProviderRegistrationSummaries(modules, access)
    })
}

function createModuleGraph(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[]
): ModuleGraph {
    const moduleSnapshot = [...modules]
    const bindingSnapshot = [...bindings]
    const multiBindingSnapshot = [...multiBindings]
    const providedTokenIds = collectProvidedTokenIds(moduleSnapshot)
    const bindingTokenIds = collectBindingTokenIds(bindingSnapshot)
    const multiBindingsByTokenId = collectComposerMultiBindingsByTokenId(multiBindingSnapshot)
    const capabilitiesByTokenId = collectFirstCapabilityByTokenId(moduleSnapshot)
    const capabilityDeclarationsByTokenId = collectCapabilityDeclarationsByTokenId(moduleSnapshot)
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
                    bindingTokenIds,
                    capabilityDeclarationsByTokenId,
                    multiBindingsByTokenId
                )
            })
        })
    )
    const capabilities = Object.freeze(
        moduleSnapshot.flatMap((moduleDefinition) => {
            return moduleDefinition.provides.map((capability) => {
                return createCapabilityMetadata(
                    moduleDefinition,
                    capability,
                    capabilityDeclarationsByTokenId,
                    multiBindingsByTokenId
                )
            })
        })
    )
    const bindingMetadata = Object.freeze(
        bindingSnapshot.map((binding) => {
            return createCompositionBindingMetadata(
                binding,
                capabilityDeclarationsByTokenId,
                bindingsByTokenId,
                multiBindingsByTokenId
            )
        })
    )
    const edges = createModuleDependencyEdges(
        moduleSnapshot,
        capabilitiesByTokenId,
        capabilityDeclarationsByTokenId,
        bindingsByTokenId,
        multiBindingsByTokenId
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
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[],
    options: ComposerOptions
): Promise<PreparedComposition> {
    const composition = await buildCompositionRuntime(modules, bindings, multiBindings, options)

    return createPreparedComposition(composition.modules, composition.access)
}

async function composeRuntime(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[],
    options: ComposerOptions
): Promise<ComposedRuntime> {
    const composition = await buildCompositionRuntime(modules, bindings, multiBindings, options)

    return createComposedRuntime(
        composition.runtime,
        composition.modules,
        composition.bindings,
        composition.multiBindings,
        composition.access
    )
}

async function buildCompositionRuntime(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[],
    options: ComposerOptions
): Promise<BuiltComposition> {
    const moduleSnapshot = [...modules]
    const bindingSnapshot = [...bindings]
    const multiBindingSnapshot = [...multiBindings]
    const staticValidation = validateComposerBeforeSetup(
        moduleSnapshot,
        bindingSnapshot,
        multiBindingSnapshot
    )

    if (!staticValidation.ok) {
        throw new ComposerValidationError(staticValidation)
    }

    const container = createContainer(
        options.lifetimeValidation === undefined
            ? {}
            : { lifetimeValidation: options.lifetimeValidation }
    )
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

    applyComposerMultiBindings(container, multiBindingSnapshot, access)

    const providerValidation = mergeDiagnosticReports(
        validateDeclaredProviderRegistrations(moduleSnapshot, access),
        validateAdapterSourcesAfterSetup(bindingSnapshot, access)
    )

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
        multiBindings: multiBindingSnapshot,
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
        capabilityDeclarationsByTokenId: collectCapabilityDeclarationsByTokenId(modules),
        requiredTokenIdsByModuleId: collectRequiredTokenIdsByModuleId(modules),
        providedTokenIdsByModuleId: collectProvidedTokenIdsByModuleId(modules),
        privateTokensByModuleId: new Map<string, Map<string, Token<unknown>>>(),
        registeredCapabilities: new Map<string, RegisteredCapabilityProvider[]>()
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
    bindingTokenIds: ReadonlySet<string>,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    multiBindingsByTokenId: ReadonlyMap<string, readonly ComposerMultiBindingRecord[]>
): RequiredPortMetadata {
    const base = {
        moduleId: moduleDefinition.id,
        tokenId: dependency.token.id,
        required: dependency.required,
        kind: dependency.kind,
        cardinality: dependency.cardinality ?? 'single',
        providerCount: getRequiredPortProviderCount(
            dependency,
            capabilitiesByTokenId,
            bindingTokenIds,
            multiBindingsByTokenId
        ),
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
    capability: ModuleCapabilityDefinition,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    multiBindingsByTokenId: ReadonlyMap<string, readonly ComposerMultiBindingRecord[]>
): CapabilityMetadata {
    const base = {
        moduleId: moduleDefinition.id,
        tokenId: capability.token.id,
        kind: capability.kind,
        cardinality: capability.cardinality ?? 'single',
        providers: createCapabilityProviderMetadata(
            capability.token.id,
            capabilitiesByTokenId,
            multiBindingsByTokenId
        )
    }

    if (capability.description === undefined) {
        return Object.freeze(base)
    }

    return Object.freeze({
        ...base,
        description: capability.description
    })
}

function createCapabilityProviderMetadata(
    tokenId: string,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    multiBindingsByTokenId: ReadonlyMap<string, readonly ComposerMultiBindingRecord[]>
): readonly CapabilityProviderMetadata[] {
    const capabilities = capabilitiesByTokenId.get(tokenId) ?? []
    const moduleProviders = capabilities.map((capability, index) => {
        return Object.freeze({
            source: 'module' as const,
            moduleId: capability.moduleId,
            registrationKind: capability.cardinality === 'multi' ? 'add' : 'bind',
            registrationIndex: index
        })
    })
    const rootBindings =
        getCapabilityProviderCardinality(tokenId, capabilitiesByTokenId) === 'multi'
            ? (multiBindingsByTokenId.get(tokenId) ?? [])
            : []
    const rootProviders = rootBindings.map((_binding, index) => {
        return Object.freeze({
            source: 'composition-root' as const,
            registrationKind: 'add' as const,
            registrationIndex: moduleProviders.length + index
        })
    })

    return Object.freeze([...moduleProviders, ...rootProviders])
}

function createCompositionBindingMetadata(
    binding: ComposerBindingRecord,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingsByTokenId: ReadonlyMap<string, ComposerBindingRecord>,
    multiBindingsByTokenId: ReadonlyMap<string, readonly ComposerMultiBindingRecord[]>
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

    if (binding.kind === 'adapter') {
        return Object.freeze({
            tokenId: binding.token.id,
            kind: binding.kind,
            providerKind: 'factory',
            lifetime: 'transient',
            adapterSource: createComposerAdapterSourceMetadata(
                binding.source,
                capabilitiesByTokenId,
                bindingsByTokenId,
                multiBindingsByTokenId
            )
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

function createComposerAdapterSourceMetadata(
    source: ComposerAdapterSourceRecord,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingsByTokenId: ReadonlyMap<string, ComposerBindingRecord>,
    multiBindingsByTokenId: ReadonlyMap<string, readonly ComposerMultiBindingRecord[]>
): ComposerAdapterSourceMetadata {
    if (source.kind === 'token') {
        return Object.freeze({
            kind: 'token',
            tokenId: source.token.id,
            providers: createComposerAdapterSourceProviderMetadata(
                source.token.id,
                capabilitiesByTokenId,
                bindingsByTokenId,
                multiBindingsByTokenId
            )
        })
    }

    return Object.freeze({
        kind: 'object',
        properties: Object.freeze(
            source.entries.map((entry) => {
                return Object.freeze({
                    property: entry.property,
                    tokenId: entry.token.id,
                    providers: createComposerAdapterSourceProviderMetadata(
                        entry.token.id,
                        capabilitiesByTokenId,
                        bindingsByTokenId,
                        multiBindingsByTokenId
                    )
                })
            })
        )
    })
}

function createComposerAdapterSourceProviderMetadata(
    tokenId: string,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingsByTokenId: ReadonlyMap<string, ComposerBindingRecord>,
    multiBindingsByTokenId: ReadonlyMap<string, readonly ComposerMultiBindingRecord[]>
): readonly ComposerAdapterSourceProviderMetadata[] {
    const capabilities = capabilitiesByTokenId.get(tokenId) ?? []
    const capabilityProviders = capabilities.map((capability, index) => {
        return Object.freeze({
            source: 'module' as const,
            providerKind: 'capability' as const,
            moduleId: capability.moduleId,
            tokenId,
            capabilityKind: capability.kind,
            cardinality: capability.cardinality,
            registrationKind: capability.cardinality === 'multi' ? 'add' : 'bind',
            registrationIndex: index
        })
    })
    const binding = bindingsByTokenId.get(tokenId)
    const bindingProviders =
        binding === undefined
            ? []
            : [
                  Object.freeze({
                      source: 'composition-root' as const,
                      providerKind: 'binding' as const,
                      tokenId,
                      bindingKind: binding.kind,
                      cardinality: 'single' as const,
                      registrationIndex: capabilityProviders.length
                  })
              ]
    const multiBindings = multiBindingsByTokenId.get(tokenId) ?? []
    const multiBindingProviders = multiBindings.map((multiBinding, index) => {
        return Object.freeze({
            source: 'composition-root' as const,
            providerKind: 'multi-binding' as const,
            tokenId,
            bindingKind: multiBinding.kind,
            cardinality: 'multi' as const,
            registrationIndex: capabilityProviders.length + bindingProviders.length + index
        })
    })

    return Object.freeze([...capabilityProviders, ...bindingProviders, ...multiBindingProviders])
}

function createModuleDependencyEdges(
    modules: readonly ModuleDefinition[],
    capabilitiesByTokenId: ReadonlyMap<string, CapabilityDependencyRecord>,
    capabilityDeclarationsByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingsByTokenId: ReadonlyMap<string, ComposerBindingRecord>,
    multiBindingsByTokenId: ReadonlyMap<string, readonly ComposerMultiBindingRecord[]>
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

                if (binding.kind === 'adapter') {
                    edges.push(
                        ...createAdapterSourceDependencyEdges(
                            moduleDefinition,
                            dependency,
                            binding,
                            capabilityDeclarationsByTokenId,
                            bindingsByTokenId,
                            multiBindingsByTokenId
                        )
                    )
                }

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

function createAdapterSourceDependencyEdges(
    moduleDefinition: ModuleDefinition,
    dependency: ModuleDependencyDefinition,
    binding: Extract<ComposerBindingRecord, { readonly kind: 'adapter' }>,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingsByTokenId: ReadonlyMap<string, ComposerBindingRecord>,
    multiBindingsByTokenId: ReadonlyMap<string, readonly ComposerMultiBindingRecord[]>
): readonly AdapterSourceDependencyEdge[] {
    return Object.freeze(
        getComposerAdapterSourceEntries(binding.source).flatMap((entry) => {
            const sourceProviders = createComposerAdapterSourceProviderMetadata(
                entry.token.id,
                capabilitiesByTokenId,
                bindingsByTokenId,
                multiBindingsByTokenId
            )

            if (sourceProviders.length === 0) {
                return [
                    createAdapterSourceDependencyEdge(moduleDefinition, dependency, binding, entry)
                ]
            }

            return sourceProviders.map((sourceProvider) => {
                return createAdapterSourceDependencyEdge(
                    moduleDefinition,
                    dependency,
                    binding,
                    entry,
                    sourceProvider
                )
            })
        })
    )
}

function createAdapterSourceDependencyEdge(
    moduleDefinition: ModuleDefinition,
    dependency: ModuleDependencyDefinition,
    binding: Extract<ComposerBindingRecord, { readonly kind: 'adapter' }>,
    entry: ComposerAdapterSourceEntryRecord,
    sourceProvider?: ComposerAdapterSourceProviderMetadata
): AdapterSourceDependencyEdge {
    const base = {
        edgeKind: 'adapter-source' as const,
        consumerModuleId: moduleDefinition.id,
        requiredTokenId: dependency.token.id,
        dependencyKind: dependency.kind,
        adapterTargetTokenId: binding.token.id,
        adapterSourceTokenId: entry.token.id,
        adapterSourceKind: binding.source.kind
    }
    const edge =
        entry.property === undefined
            ? base
            : {
                  ...base,
                  adapterSourceProperty: entry.property
              }

    if (sourceProvider === undefined) {
        return Object.freeze(edge)
    }

    return Object.freeze({
        ...edge,
        sourceProvider
    })
}

function createProviderRegistrationSummaries(
    modules: readonly ModuleDefinition[],
    access: CompositionAccessModel
): readonly ProviderRegistrationSummary[] {
    const summaries: ProviderRegistrationSummary[] = []

    for (const moduleDefinition of modules) {
        for (const capability of moduleDefinition.provides) {
            const registration = findRegisteredModuleCapability(
                access,
                moduleDefinition.id,
                capability.token.id
            )

            if (registration === undefined) {
                continue
            }

            summaries.push(createProviderRegistrationSummary(registration))
        }
    }

    for (const registrations of access.registeredCapabilities.values()) {
        for (const registration of registrations) {
            if (registration.source === 'composition-root') {
                summaries.push(createProviderRegistrationSummary(registration))
            }
        }
    }

    return Object.freeze(summaries)
}

function createProviderRegistrationSummary(
    registration: RegisteredCapabilityProvider
): ProviderRegistrationSummary {
    const base = {
        source: registration.source,
        tokenId: registration.tokenId,
        capabilityKind: registration.kind,
        cardinality: registration.registrationKind,
        visibility: 'exported' as const,
        registrationKind: registration.registrationKind,
        providers: Object.freeze(
            registration.providers.map((provider) => {
                return createProviderRegistrationProviderSummary(provider)
            })
        )
    }

    if (registration.source === 'module') {
        return Object.freeze({
            ...base,
            moduleId: registration.moduleId
        })
    }

    return Object.freeze(base)
}

function createProviderRegistrationProviderSummary(
    provider: ProviderRegistrationRecord
): ProviderRegistrationProviderSummary {
    const lifetime = provider.lifetime
    const initialization = provider.initialization
    const base = {
        providerKind: provider.providerKind,
        registrationIndex: provider.registrationIndex ?? 0
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
    if (bindingTokenIds.has(dependency.token.id)) {
        return 'binding'
    }

    if (providedTokenIds.has(dependency.token.id)) {
        return 'capability'
    }

    if (!dependency.required) {
        return 'optional'
    }

    return 'missing'
}

function getRequiredPortProviderCount(
    dependency: ModuleDependencyDefinition,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingTokenIds: ReadonlySet<string>,
    multiBindingsByTokenId: ReadonlyMap<string, readonly ComposerMultiBindingRecord[]>
): number {
    if (bindingTokenIds.has(dependency.token.id)) {
        return 1
    }

    const capabilityCount = capabilitiesByTokenId.get(dependency.token.id)?.length ?? 0

    if (capabilityCount === 0 || (dependency.cardinality ?? 'single') !== 'multi') {
        return capabilityCount
    }

    return capabilityCount + (multiBindingsByTokenId.get(dependency.token.id)?.length ?? 0)
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
            }, binding.dependencyOptions)
        } else if (binding.kind === 'adapter') {
            builder.toFactory((context) => {
                return binding.factory(
                    resolveComposerAdapterSource(binding.source, context, access)
                )
            })
        } else if (binding.kind === 'class') {
            builder.toClass(binding.classConstructor)
        } else {
            builder.toAsyncFactory((context) => {
                return binding.factory(createComposerBindingResolutionContext(context, access))
            }, binding.dependencyOptions)
        }
    }
}

function resolveComposerAdapterSource(
    source: ComposerAdapterSourceRecord,
    context: ResolutionContext,
    access: CompositionAccessModel
): unknown {
    const bindingContext = createComposerBindingResolutionContext(context, access)

    if (source.kind === 'token') {
        return bindingContext.get(source.token)
    }

    const resolvedSource: Record<string, unknown> = {}

    for (const entry of source.entries) {
        resolvedSource[entry.property] = bindingContext.get(entry.token)
    }

    return Object.freeze(resolvedSource)
}

function applyComposerMultiBindings(
    container: ContainerBuilder,
    multiBindings: readonly ComposerMultiBindingRecord[],
    access: CompositionAccessModel
): void {
    for (const binding of multiBindings) {
        const builder = container.add(binding.token)

        if (binding.kind === 'value') {
            builder.toValue(binding.value)
        } else {
            const lifetime = builder.toFactory((context) => {
                return binding.factory(createComposerBindingResolutionContext(context, access))
            }, binding.dependencyOptions)

            applyDeferredProviderLifetime(lifetime, binding.providerRegistration.lifetime)
        }

        recordCompositionRootProvider(binding.token, binding.providerRegistration, access)
    }
}

function applyDeferredProviderLifetime(
    binding: LifetimeBinding,
    lifetime: ProviderLifetime | undefined
): void {
    if (lifetime === 'singleton') {
        binding.singleton()

        return
    }

    if (lifetime === 'scoped') {
        binding.scoped()

        return
    }

    if (lifetime === 'transient') {
        binding.transient()
    }
}

function createLiveModuleSetupContext(
    moduleDefinition: ModuleDefinition,
    container: ContainerBuilder,
    access: CompositionAccessModel
): LiveModuleSetupContext {
    let activeContext: ResolutionContext | undefined
    let nextModuleRegistrationIndex = 0
    let nextPrivateCollectionOrdinal = 0
    let nextPrivateDependencySelectorIndex = 0
    const privateCollections = new Map<
        string,
        {
            readonly ordinal: number
            nextContributionIndex: number
        }
    >()
    const privateDependencySelectorIndexes = new Map<string, number>()

    const allocateProviderIdentity: ModuleProviderIdentityAllocator = (
        originalToken,
        visibility,
        registrationKind
    ) => {
        const registrationIndex = nextModuleRegistrationIndex

        nextModuleRegistrationIndex += 1

        if (visibility === 'exported') {
            return undefined
        }

        if (registrationKind === 'single') {
            return createPrivateProviderRegistrationIdentity({
                moduleId: moduleDefinition.id,
                registrationIndex,
                registrationKind
            })
        }

        let collection = privateCollections.get(originalToken.id)

        if (collection === undefined) {
            collection = {
                ordinal: nextPrivateCollectionOrdinal,
                nextContributionIndex: 0
            }
            nextPrivateCollectionOrdinal += 1
            privateCollections.set(originalToken.id, collection)
        }

        const contributionIndex = collection.nextContributionIndex

        collection.nextContributionIndex += 1

        return createPrivateProviderRegistrationIdentity({
            moduleId: moduleDefinition.id,
            registrationIndex,
            registrationKind,
            privateCollectionOrdinal: collection.ordinal,
            contributionIndex
        })
    }

    const mapDependencyOptions: ModuleProviderDependencyMapper = (options) => {
        return mapProviderDependencyOptions(options, (originalToken) => {
            const registration = resolveModuleRegistrationToken(
                moduleDefinition,
                originalToken,
                access
            )

            if (registration.visibility === 'exported') {
                return {
                    token: registration.token,
                    target: Object.freeze({
                        visibility: 'public' as const,
                        tokenId: originalToken.id
                    })
                }
            }

            let selectorIndex = privateDependencySelectorIndexes.get(originalToken.id)

            if (selectorIndex === undefined) {
                selectorIndex = nextPrivateDependencySelectorIndex
                nextPrivateDependencySelectorIndex += 1
                privateDependencySelectorIndexes.set(originalToken.id, selectorIndex)
            }

            const target: ProviderDependencyTarget = Object.freeze({
                visibility: 'private',
                moduleId: moduleDefinition.id,
                selectorIndex
            })

            return {
                token: registration.token,
                target
            }
        })
    }

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
            return createModuleBindingBuilder(
                moduleDefinition,
                bindingToken,
                container,
                access,
                allocateProviderIdentity,
                mapDependencyOptions
            )
        },

        add<TValue>(bindingToken: Token<TValue>): MultiBindingBuilder<TValue> {
            return createModuleMultiBindingBuilder(
                moduleDefinition,
                bindingToken,
                container,
                access,
                allocateProviderIdentity,
                mapDependencyOptions
            )
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

        async getAllAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue[]> {
            return getActiveContext(resolutionToken).getAllAsync(resolutionToken)
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
    access: CompositionAccessModel,
    allocateProviderIdentity: ModuleProviderIdentityAllocator,
    mapDependencyOptions: ModuleProviderDependencyMapper
): BindingBuilder<TValue> {
    const registration = resolveModuleRegistrationToken(moduleDefinition, originalToken, access)
    const builder = container.bind(registration.token)

    return {
        toValue(value: TValue): void {
            applyModuleProviderIdentity(
                builder,
                allocateProviderIdentity(originalToken, registration.visibility, 'single')
            )
            builder.toValue(value)
            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'single',
                createProviderRegistrationRecord('value', 'singleton'),
                access
            )
        },

        toFactory(factory, options): LifetimeBinding {
            applyModuleProviderIdentity(
                builder,
                allocateProviderIdentity(originalToken, registration.visibility, 'single')
            )
            const providerRegistration = createProviderRegistrationRecord('factory', 'transient')
            const lifetime = builder.toFactory((context) => {
                return factory(createModuleResolutionContext(moduleDefinition, context, access))
            }, mapDependencyOptions(options))

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
            applyModuleProviderIdentity(
                builder,
                allocateProviderIdentity(originalToken, registration.visibility, 'single')
            )
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

        toAsyncFactory(factory, options): AsyncFactoryBinding {
            applyModuleProviderIdentity(
                builder,
                allocateProviderIdentity(originalToken, registration.visibility, 'single')
            )
            const providerRegistration = createProviderRegistrationRecord(
                'async-factory',
                'transient',
                'lazy'
            )
            const binding = builder.toAsyncFactory((context) => {
                return factory(createModuleResolutionContext(moduleDefinition, context, access))
            }, mapDependencyOptions(options))

            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'single',
                providerRegistration,
                access
            )

            return createInspectableAsyncFactoryBinding(binding, providerRegistration)
        },

        toAsyncResource(factory, options): AsyncResourceBinding {
            applyModuleProviderIdentity(
                builder,
                allocateProviderIdentity(originalToken, registration.visibility, 'single')
            )
            const providerRegistration = createProviderRegistrationRecord(
                'async-resource',
                undefined,
                'lazy'
            )
            const binding = builder.toAsyncResource((context) => {
                return factory(createModuleResolutionContext(moduleDefinition, context, access))
            }, mapDependencyOptions(options))

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
    access: CompositionAccessModel,
    allocateProviderIdentity: ModuleProviderIdentityAllocator,
    mapDependencyOptions: ModuleProviderDependencyMapper
): MultiBindingBuilder<TValue> {
    const registration = resolveModuleRegistrationToken(moduleDefinition, originalToken, access)
    const builder = container.add(registration.token)

    return {
        toValue(value: TValue): void {
            applyModuleProviderIdentity(
                builder,
                allocateProviderIdentity(originalToken, registration.visibility, 'multi')
            )
            builder.toValue(value)
            recordModuleProvider(
                moduleDefinition,
                originalToken,
                'multi',
                createProviderRegistrationRecord('value', 'singleton'),
                access
            )
        },

        toFactory(factory, options): LifetimeBinding {
            applyModuleProviderIdentity(
                builder,
                allocateProviderIdentity(originalToken, registration.visibility, 'multi')
            )
            const providerRegistration = createProviderRegistrationRecord('factory', 'transient')
            const lifetime = builder.toFactory((context) => {
                return factory(createModuleResolutionContext(moduleDefinition, context, access))
            }, mapDependencyOptions(options))

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

function applyModuleProviderIdentity<TValue>(
    builder: BindingBuilder<TValue> | MultiBindingBuilder<TValue>,
    identity: ProviderRegistrationIdentity | undefined
): void {
    if (identity !== undefined) {
        setProviderRegistrationIdentity(builder, identity)
    }
}

function createProviderRegistrationRecord(
    providerKind: InspectionProviderKind,
    lifetime: ProviderLifetime | undefined,
    initialization?: AsyncProviderInitializationMode
): ProviderRegistrationRecord {
    return {
        providerKind,
        registrationIndex: undefined,
        lifetime,
        initialization
    }
}

function createDeferredLifetimeBinding(
    providerRegistration: ProviderRegistrationRecord
): LifetimeBinding {
    return {
        singleton(): void {
            providerRegistration.lifetime = 'singleton'
        },

        transient(): void {
            providerRegistration.lifetime = 'transient'
        },

        scoped(): void {
            providerRegistration.lifetime = 'scoped'
        }
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
            return context.tryGet(
                resolveModuleAccessToken(moduleDefinition, resolutionToken, access)
            )
        },

        getAll<TValue>(resolutionToken: Token<TValue>): TValue[] {
            return context.getAll(
                resolveModuleAccessToken(moduleDefinition, resolutionToken, access)
            )
        },

        async getAllAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue[]> {
            return context.getAllAsync(
                resolveModuleAccessToken(moduleDefinition, resolutionToken, access)
            )
        },

        getAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue> {
            return context.getAsync(
                resolveModuleAccessToken(moduleDefinition, resolutionToken, access)
            )
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

        async getAllAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue[]> {
            return context.getAllAsync(resolveToken(resolutionToken))
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
    multiBindings: readonly ComposerMultiBindingRecord[],
    access: CompositionAccessModel
): ComposedRuntime {
    const inspection = createRuntimeInspection(
        modules,
        bindings,
        multiBindings,
        access,
        getLifetimeValidationReport(containerRuntime)
    )

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

    const runtime: ComposedRuntime & ProviderGraphSnapshotAwareRuntime = {
        [providerGraphSnapshotBridge]: getProviderGraphSnapshot(containerRuntime),
        get<TValue>(resolutionToken: Token<TValue>): TValue {
            return containerRuntime.get(
                resolvePublicSingleCapabilityToken(resolutionToken, access, 'get')
            )
        },

        tryGet<TValue>(resolutionToken: Token<TValue>): TValue | undefined {
            return containerRuntime.tryGet(
                resolvePublicSingleCapabilityToken(resolutionToken, access, 'tryGet')
            )
        },

        getAll<TValue>(resolutionToken: Token<TValue>): TValue[] {
            return containerRuntime.getAll(
                resolvePublicMultiCapabilityToken(resolutionToken, access)
            )
        },

        async getAllAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue[]> {
            return containerRuntime.getAllAsync(
                resolvePublicMultiCapabilityToken(resolutionToken, access)
            )
        },

        createScope(options?: CreateScopeOptions): Scope {
            assertScopeOptionsUsePublicCapabilities(options, access)

            return createComposedScope(containerRuntime.createScope(options), access)
        },

        withScope,

        getAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue> {
            return containerRuntime.getAsync(
                resolvePublicSingleCapabilityToken(resolutionToken, access, 'getAsync')
            )
        },

        tryGetAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue | undefined> {
            return containerRuntime.tryGetAsync(
                resolvePublicSingleCapabilityToken(resolutionToken, access, 'tryGetAsync')
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
    function withChildScope<TValue>(callback: ScopeCallback<TValue>): Promise<TValue>
    function withChildScope<TValue>(
        options: CreateScopeOptions,
        callback: ScopeCallback<TValue>
    ): Promise<TValue>
    function withChildScope<TValue>(
        optionsOrCallback: CreateScopeOptions | ScopeCallback<TValue>,
        callback?: ScopeCallback<TValue>
    ): Promise<TValue> {
        if (typeof optionsOrCallback === 'function') {
            return containerScope.withChildScope((childScope) => {
                return optionsOrCallback(createComposedScope(childScope, access))
            })
        }

        if (callback === undefined) {
            return containerScope.withChildScope(
                optionsOrCallback,
                callback as unknown as ScopeCallback<TValue>
            )
        }

        assertScopeOptionsUsePublicCapabilities(optionsOrCallback, access)

        return containerScope.withChildScope(optionsOrCallback, (childScope) => {
            return callback(createComposedScope(childScope, access))
        })
    }

    const scope: Scope = {
        get<TValue>(resolutionToken: Token<TValue>): TValue {
            return containerScope.get(
                resolvePublicSingleCapabilityToken(resolutionToken, access, 'get')
            )
        },

        tryGet<TValue>(resolutionToken: Token<TValue>): TValue | undefined {
            return containerScope.tryGet(
                resolvePublicSingleCapabilityToken(resolutionToken, access, 'tryGet')
            )
        },

        getAll<TValue>(resolutionToken: Token<TValue>): TValue[] {
            return containerScope.getAll(resolvePublicMultiCapabilityToken(resolutionToken, access))
        },

        async getAllAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue[]> {
            return containerScope.getAllAsync(
                resolvePublicMultiCapabilityToken(resolutionToken, access)
            )
        },

        getAsync<TValue>(resolutionToken: Token<TValue>): Promise<TValue> {
            return containerScope.getAsync(
                resolvePublicSingleCapabilityToken(resolutionToken, access, 'getAsync')
            )
        },

        createChildScope(options?: CreateScopeOptions): Scope {
            assertScopeOptionsUsePublicCapabilities(options, access)

            return createComposedScope(containerScope.createChildScope(options), access)
        },

        withChildScope,

        dispose(): Promise<void> {
            return containerScope.dispose()
        }
    }

    return Object.freeze(scope)
}

function resolvePublicSingleCapabilityToken<TValue>(
    resolutionToken: Token<TValue>,
    access: CompositionAccessModel,
    accessMethod: 'get' | 'tryGet' | 'getAsync' | 'tryGetAsync'
): Token<TValue> {
    const cardinality = getPublicCapabilityCardinality(resolutionToken, access)

    if (cardinality === undefined) {
        throw new PrivateProviderAccessError(resolutionToken.id, 'runtime', 'token-not-visible')
    }

    if (cardinality === 'single') {
        return resolutionToken
    }

    throw new GetUsedForMultiTokenError(resolutionToken.id, accessMethod)
}

function resolvePublicMultiCapabilityToken<TValue>(
    resolutionToken: Token<TValue>,
    access: CompositionAccessModel
): Token<TValue> {
    const cardinality = getPublicCapabilityCardinality(resolutionToken, access)

    if (cardinality === undefined) {
        throw new PrivateProviderAccessError(resolutionToken.id, 'runtime', 'token-not-visible')
    }

    if (cardinality === 'multi') {
        return resolutionToken
    }

    throw new GetAllUsedForSingleTokenError(resolutionToken.id)
}

function resolvePublicCapabilityToken<TValue>(
    resolutionToken: Token<TValue>,
    access: CompositionAccessModel
): Token<TValue> {
    if (getPublicCapabilityCardinality(resolutionToken, access) !== undefined) {
        return resolutionToken
    }

    throw new PrivateProviderAccessError(resolutionToken.id, 'runtime', 'token-not-visible')
}

function getPublicCapabilityCardinality(
    resolutionToken: Token<unknown>,
    access: CompositionAccessModel
): ProviderRegistrationKind | undefined {
    return access.registeredCapabilities.get(resolutionToken.id)?.[0]?.registrationKind
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
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[]
): DiagnosticReport {
    return validateComposerModel(modules, bindings, multiBindings, {
        includeAdapterSourceMissingDiagnostics: true
    })
}

function validateComposerBeforeSetup(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[]
): DiagnosticReport {
    return validateComposerModel(modules, bindings, multiBindings, {
        includeAdapterSourceMissingDiagnostics: false
    })
}

function validateComposerModel(
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[],
    options: {
        readonly includeAdapterSourceMissingDiagnostics: boolean
    }
): DiagnosticReport {
    const diagnostics: Diagnostic[] = []

    appendDuplicateModuleIdDiagnostics(diagnostics, modules)
    appendCapabilityDeclarationDiagnostics(diagnostics, modules)
    appendRequiredPortDeclarationConflictDiagnostics(diagnostics, modules)

    const providedTokenIds = collectProvidedTokenIds(modules)
    const bindingTokenIds = collectBindingTokenIds(bindings)
    const requiredPortTokenIds = collectRequiredPortTokenIds(modules)
    const capabilitiesByTokenId = collectCapabilityDeclarationsByTokenId(modules)
    const bindingsByTokenId = collectFirstBindingByTokenId(bindings)
    const multiBindingTokenIds = collectComposerMultiBindingTokenIds(multiBindings)
    const externalRequiredPortTokenIds = collectRequiredPortTokenIdsByKind(modules, 'external')

    appendDuplicateBindingDiagnostics(diagnostics, bindings)
    appendComposerBindingCardinalityConflictDiagnostics(
        diagnostics,
        bindings,
        multiBindings,
        multiBindingTokenIds
    )
    appendRequiredPortCardinalityMismatchDiagnostics(
        diagnostics,
        modules,
        capabilitiesByTokenId,
        bindingsByTokenId
    )
    appendMissingRequiredPortDiagnostics(
        diagnostics,
        modules,
        providedTokenIds,
        bindingTokenIds,
        capabilitiesByTokenId,
        bindingsByTokenId
    )
    appendInvalidBindingDiagnostics(diagnostics, bindings, requiredPortTokenIds)
    appendInvalidAdapterTargetDiagnostics(diagnostics, bindings, externalRequiredPortTokenIds)
    appendAdapterSourceDiagnostics(
        diagnostics,
        bindings,
        capabilitiesByTokenId,
        bindingTokenIds,
        multiBindingTokenIds,
        options.includeAdapterSourceMissingDiagnostics
    )
    appendInvalidComposerMultiBindingDiagnostics(
        diagnostics,
        multiBindings,
        capabilitiesByTokenId,
        requiredPortTokenIds
    )
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
                diagnostics.push(
                    diagnosticFromError(new DuplicateModuleIdError(moduleDefinition.id))
                )
                reportedModuleIds.add(moduleDefinition.id)
            }

            continue
        }

        seenModuleIds.add(moduleDefinition.id)
    }
}

function appendCapabilityDeclarationDiagnostics(
    diagnostics: Diagnostic[],
    modules: readonly ModuleDefinition[]
): void {
    const capabilitiesByTokenId = collectCapabilityDeclarationsByTokenId(modules)

    for (const [tokenId, capabilities] of capabilitiesByTokenId) {
        const singleCapabilities = capabilities.filter((capability) => {
            return capability.cardinality === 'single'
        })
        const multiCapabilities = capabilities.filter((capability) => {
            return capability.cardinality === 'multi'
        })

        if (singleCapabilities.length > 0 && multiCapabilities.length > 0) {
            diagnostics.push(
                diagnosticFromError(
                    new CapabilityCardinalityConflictError(
                        tokenId,
                        createNonEmptySources(singleCapabilities),
                        createNonEmptySources(multiCapabilities)
                    )
                )
            )

            continue
        }

        const [firstSingle, secondSingle, ...remainingSingles] = singleCapabilities

        if (firstSingle !== undefined && secondSingle !== undefined) {
            diagnostics.push(
                diagnosticFromError(
                    new DuplicateSingleCapabilityError(tokenId, [
                        firstSingle.moduleId,
                        secondSingle.moduleId,
                        ...remainingSingles.map((capability) => {
                            return capability.moduleId
                        })
                    ])
                )
            )

            continue
        }

        if (multiCapabilities.length > 1) {
            const [firstMulti, ...remainingMultis] = multiCapabilities
            const incompatibleKind = remainingMultis.some((capability) => {
                return capability.kind !== firstMulti?.kind
            })

            if (firstMulti !== undefined && incompatibleKind) {
                const [secondMulti, ...restMultis] = remainingMultis

                if (secondMulti !== undefined) {
                    diagnostics.push(
                        diagnosticFromError(
                            new DuplicateModuleCapabilityError(
                                [
                                    firstMulti.moduleId,
                                    secondMulti.moduleId,
                                    ...restMultis.map((capability) => {
                                        return capability.moduleId
                                    })
                                ],
                                tokenId
                            )
                        )
                    )
                }
            }
        }
    }
}

function appendRequiredPortDeclarationConflictDiagnostics(
    diagnostics: Diagnostic[],
    modules: readonly ModuleDefinition[]
): void {
    const requiredPortsByTokenId = collectRequiredPortDeclarationsByTokenId(modules)

    for (const [tokenId, dependencies] of requiredPortsByTokenId) {
        const singleDependencies = dependencies.filter((dependency) => {
            return dependency.cardinality === 'single'
        })
        const multiDependencies = dependencies.filter((dependency) => {
            return dependency.cardinality === 'multi'
        })

        if (singleDependencies.length > 0 && multiDependencies.length > 0) {
            diagnostics.push(
                diagnosticFromError(
                    new CapabilityCardinalityConflictError(
                        tokenId,
                        createNonEmptyRequiredSources(singleDependencies),
                        createNonEmptyRequiredSources(multiDependencies)
                    )
                )
            )
        }
    }
}

function appendDuplicateBindingDiagnostics(
    diagnostics: Diagnostic[],
    bindings: readonly ComposerBindingRecord[]
): void {
    const bindingKindsByTokenId = new Map<string, ComposerBindingKind[]>()

    for (const binding of bindings) {
        const bindingKinds = bindingKindsByTokenId.get(binding.token.id)

        if (bindingKinds === undefined) {
            bindingKindsByTokenId.set(binding.token.id, [binding.kind])
        } else {
            bindingKinds.push(binding.kind)
        }
    }

    for (const [tokenId, bindingKinds] of bindingKindsByTokenId) {
        const [firstBindingKind, secondBindingKind, ...remainingBindingKinds] = bindingKinds

        if (firstBindingKind !== undefined && secondBindingKind !== undefined) {
            diagnostics.push(
                diagnosticFromError(
                    new DuplicateComposerBindingError(tokenId, [
                        firstBindingKind,
                        secondBindingKind,
                        ...remainingBindingKinds
                    ])
                )
            )
        }
    }
}

function appendComposerBindingCardinalityConflictDiagnostics(
    diagnostics: Diagnostic[],
    bindings: readonly ComposerBindingRecord[],
    multiBindings: readonly ComposerMultiBindingRecord[],
    multiBindingTokenIds: ReadonlySet<string>
): void {
    const bindingKindsByTokenId = collectComposerBindingKindsByTokenId(bindings)
    const multiBindingKindsByTokenId = collectComposerMultiBindingKindsByTokenId(multiBindings)

    for (const tokenId of multiBindingTokenIds) {
        const bindingKinds = bindingKindsByTokenId.get(tokenId)
        const multiBindingKinds = multiBindingKindsByTokenId.get(tokenId)

        if (bindingKinds === undefined || multiBindingKinds === undefined) {
            continue
        }

        const [firstBindingKind, ...remainingBindingKinds] = bindingKinds
        const [firstMultiBindingKind, ...remainingMultiBindingKinds] = multiBindingKinds

        if (firstBindingKind === undefined || firstMultiBindingKind === undefined) {
            continue
        }

        diagnostics.push(
            diagnosticFromError(
                new ComposerBindingCardinalityConflictError(
                    tokenId,
                    [firstBindingKind, ...remainingBindingKinds],
                    [firstMultiBindingKind, ...remainingMultiBindingKinds]
                )
            )
        )
    }
}

function appendMissingRequiredPortDiagnostics(
    diagnostics: Diagnostic[],
    modules: readonly ModuleDefinition[],
    providedTokenIds: ReadonlySet<string>,
    bindingTokenIds: ReadonlySet<string>,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingsByTokenId: ReadonlyMap<string, ComposerBindingRecord>
): void {
    for (const moduleDefinition of modules) {
        for (const dependency of moduleDefinition.requires) {
            if (!dependency.required) {
                continue
            }

            const tokenId = dependency.token.id

            if (hasRequiredPortProvider(dependency, capabilitiesByTokenId, bindingsByTokenId)) {
                continue
            }

            if (!providedTokenIds.has(tokenId) && !bindingTokenIds.has(tokenId)) {
                if (dependency.cardinality === 'multi') {
                    diagnostics.push(
                        diagnosticFromError(
                            new RequiredMultiCapabilityMissingError(
                                moduleDefinition.id,
                                tokenId,
                                dependency.kind
                            )
                        )
                    )

                    continue
                }

                diagnostics.push(
                    diagnosticFromError(
                        new MissingRequiredPortError(moduleDefinition.id, tokenId, dependency.kind)
                    )
                )
            }
        }
    }
}

function appendRequiredPortCardinalityMismatchDiagnostics(
    diagnostics: Diagnostic[],
    modules: readonly ModuleDefinition[],
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingsByTokenId: ReadonlyMap<string, ComposerBindingRecord>
): void {
    for (const moduleDefinition of modules) {
        for (const dependency of moduleDefinition.requires) {
            const tokenId = dependency.token.id
            const binding = bindingsByTokenId.get(tokenId)
            const dependencyCardinality = dependency.cardinality ?? 'single'

            if (binding !== undefined && dependencyCardinality !== 'single') {
                diagnostics.push(
                    diagnosticFromError(
                        new RequiredPortCardinalityMismatchError(
                            moduleDefinition.id,
                            tokenId,
                            dependency.kind,
                            dependencyCardinality,
                            'single',
                            'binding'
                        )
                    )
                )

                continue
            }

            const providerCardinality = getCapabilityProviderCardinality(
                tokenId,
                capabilitiesByTokenId
            )

            if (
                providerCardinality !== undefined &&
                providerCardinality !== dependencyCardinality
            ) {
                diagnostics.push(
                    diagnosticFromError(
                        new RequiredPortCardinalityMismatchError(
                            moduleDefinition.id,
                            tokenId,
                            dependency.kind,
                            dependencyCardinality,
                            providerCardinality,
                            'capability'
                        )
                    )
                )
            }
        }
    }
}

function createNonEmptySources(
    capabilities: readonly CapabilityDeclarationRecord[]
): readonly [string, ...string[]] {
    const sources = capabilities.map((capability) => {
        return capability.source
    })
    const [firstSource, ...remainingSources] = sources

    if (firstSource === undefined) {
        throw new Error('Expected at least one capability cardinality source')
    }

    return [firstSource, ...remainingSources]
}

function createNonEmptyRequiredSources(
    dependencies: readonly RequiredPortDeclarationRecord[]
): readonly [string, ...string[]] {
    const sources = dependencies.map((dependency) => {
        return dependency.source
    })
    const [firstSource, ...remainingSources] = sources

    if (firstSource === undefined) {
        throw new Error('Expected at least one required port cardinality source')
    }

    return [firstSource, ...remainingSources]
}

function hasRequiredPortProvider(
    dependency: ModuleDependencyDefinition,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingsByTokenId: ReadonlyMap<string, ComposerBindingRecord>
): boolean {
    const tokenId = dependency.token.id
    const dependencyCardinality = dependency.cardinality ?? 'single'

    if (bindingsByTokenId.has(tokenId)) {
        return dependencyCardinality === 'single'
    }

    return (
        getCapabilityProviderCardinality(tokenId, capabilitiesByTokenId) === dependencyCardinality
    )
}

function getCapabilityProviderCardinality(
    tokenId: string,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>
): ModuleCardinality | undefined {
    const capabilities = capabilitiesByTokenId.get(tokenId)

    if (capabilities === undefined) {
        return undefined
    }

    let cardinality: ModuleCardinality | undefined

    for (const capability of capabilities) {
        if (cardinality === undefined) {
            cardinality = capability.cardinality

            continue
        }

        if (cardinality !== capability.cardinality) {
            return undefined
        }
    }

    return cardinality
}

function appendInvalidBindingDiagnostics(
    diagnostics: Diagnostic[],
    bindings: readonly ComposerBindingRecord[],
    requiredPortTokenIds: ReadonlySet<string>
): void {
    for (const binding of bindings) {
        if (binding.kind === 'adapter') {
            continue
        }

        if (!requiredPortTokenIds.has(binding.token.id)) {
            diagnostics.push(
                diagnosticFromError(new InvalidComposerBindingError(binding.token.id, binding.kind))
            )
        }
    }
}

function appendInvalidAdapterTargetDiagnostics(
    diagnostics: Diagnostic[],
    bindings: readonly ComposerBindingRecord[],
    externalRequiredPortTokenIds: ReadonlySet<string>
): void {
    for (const binding of bindings) {
        if (binding.kind !== 'adapter') {
            continue
        }

        if (!externalRequiredPortTokenIds.has(binding.token.id)) {
            diagnostics.push(diagnosticFromError(new AdapterTargetInvalidError(binding.token.id)))
        }
    }
}

function appendAdapterSourceDiagnostics(
    diagnostics: Diagnostic[],
    bindings: readonly ComposerBindingRecord[],
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    bindingTokenIds: ReadonlySet<string>,
    multiBindingTokenIds: ReadonlySet<string>,
    includeMissingDiagnostics: boolean
): void {
    for (const binding of bindings) {
        if (binding.kind !== 'adapter') {
            continue
        }

        for (const sourceEntry of getComposerAdapterSourceEntries(binding.source)) {
            const tokenId = sourceEntry.token.id
            const capabilities = capabilitiesByTokenId.get(tokenId) ?? []
            const hasSingleCapability = capabilities.some((capability) => {
                return capability.cardinality === 'single'
            })
            const hasMultiCapability = capabilities.some((capability) => {
                return capability.cardinality === 'multi'
            })

            if (hasMultiCapability) {
                diagnostics.push(
                    diagnosticFromError(
                        new AdapterSourceCardinalityMismatchError(
                            binding.token.id,
                            tokenId,
                            'capability',
                            sourceEntry.property
                        )
                    )
                )

                continue
            }

            if (multiBindingTokenIds.has(tokenId)) {
                diagnostics.push(
                    diagnosticFromError(
                        new AdapterSourceCardinalityMismatchError(
                            binding.token.id,
                            tokenId,
                            'multi-binding',
                            sourceEntry.property
                        )
                    )
                )

                continue
            }

            if (hasSingleCapability || bindingTokenIds.has(tokenId)) {
                continue
            }

            if (includeMissingDiagnostics) {
                diagnostics.push(
                    diagnosticFromError(
                        new AdapterSourceMissingError(
                            binding.token.id,
                            tokenId,
                            sourceEntry.property
                        )
                    )
                )
            }
        }
    }
}

function appendInvalidComposerMultiBindingDiagnostics(
    diagnostics: Diagnostic[],
    multiBindings: readonly ComposerMultiBindingRecord[],
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    requiredPortTokenIds: ReadonlySet<string>
): void {
    for (const binding of multiBindings) {
        const reason = getInvalidComposerMultiBindingReason(
            binding.token.id,
            capabilitiesByTokenId,
            requiredPortTokenIds
        )

        if (reason === undefined) {
            continue
        }

        diagnostics.push(
            diagnosticFromError(
                new InvalidComposerMultiBindingError(binding.token.id, binding.kind, reason)
            )
        )
    }
}

function getInvalidComposerMultiBindingReason(
    tokenId: string,
    capabilitiesByTokenId: ReadonlyMap<string, readonly CapabilityDeclarationRecord[]>,
    requiredPortTokenIds: ReadonlySet<string>
): InvalidComposerMultiBindingReason | undefined {
    const capabilities = capabilitiesByTokenId.get(tokenId) ?? []
    const hasMultiCapability = capabilities.some((capability) => {
        return capability.cardinality === 'multi'
    })
    const hasSingleCapability = capabilities.some((capability) => {
        return capability.cardinality === 'single'
    })

    if (hasMultiCapability) {
        return undefined
    }

    if (hasSingleCapability) {
        return 'single-capability'
    }

    if (requiredPortTokenIds.has(tokenId)) {
        return 'required-port-only'
    }

    return 'missing-public-multi-capability'
}

function appendModuleCycleDiagnostics(
    diagnostics: Diagnostic[],
    modules: readonly ModuleDefinition[],
    bindings: readonly ComposerBindingRecord[]
): void {
    const capabilitiesByTokenId = collectFirstCapabilityByTokenId(modules)
    const capabilityDeclarationsByTokenId = collectCapabilityDeclarationsByTokenId(modules)
    const bindingsByTokenId = collectFirstBindingByTokenId(bindings)
    const edges = createModuleDependencyEdges(
        modules,
        capabilitiesByTokenId,
        capabilityDeclarationsByTokenId,
        bindingsByTokenId,
        new Map<string, readonly ComposerMultiBindingRecord[]>()
    )
    const cycles = detectModuleCycles(modules, edges)

    for (const cycle of cycles) {
        diagnostics.push(diagnosticFromError(new ModuleCycleError(cycle)))
    }
}

function detectModuleCycles(
    modules: readonly ModuleDefinition[],
    edges: readonly ModuleDependencyEdge[]
): readonly ModuleCyclePath[] {
    const cycleEdgesByConsumerModuleId = collectCycleEdgesByConsumerModuleId(edges)
    const visitStateByModuleId = new Map<string, 'visiting' | 'visited'>()
    const moduleIdStack: string[] = []
    const edgeStack: ModuleCycleTraversalEdge[] = []
    const cycles: ModuleCyclePath[] = []

    for (const moduleDefinition of modules) {
        if (visitStateByModuleId.has(moduleDefinition.id)) {
            continue
        }

        visitModuleForCycles(
            moduleDefinition.id,
            cycleEdgesByConsumerModuleId,
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
    cycleEdgesByConsumerModuleId: ReadonlyMap<string, readonly ModuleCycleTraversalEdge[]>,
    visitStateByModuleId: Map<string, 'visiting' | 'visited'>,
    moduleIdStack: string[],
    edgeStack: ModuleCycleTraversalEdge[],
    cycles: ModuleCyclePath[]
): void {
    visitStateByModuleId.set(moduleId, 'visiting')
    moduleIdStack.push(moduleId)

    for (const edge of cycleEdgesByConsumerModuleId.get(moduleId) ?? []) {
        const providerModuleId = getCycleProviderModuleId(edge)
        const providerState = visitStateByModuleId.get(providerModuleId)

        if (providerState === 'visiting') {
            cycles.push(createModuleCyclePath(edge, moduleIdStack, edgeStack))

            continue
        }

        if (providerState === 'visited') {
            continue
        }

        edgeStack.push(edge)
        visitModuleForCycles(
            providerModuleId,
            cycleEdgesByConsumerModuleId,
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
    closingEdge: ModuleCycleTraversalEdge,
    moduleIdStack: readonly string[],
    edgeStack: readonly ModuleCycleTraversalEdge[]
): ModuleCyclePath {
    const startIndex = moduleIdStack.indexOf(getCycleProviderModuleId(closingEdge))
    const cycleEdges = [...edgeStack.slice(startIndex), closingEdge]
    const moduleIdPath = Object.freeze([
        ...moduleIdStack.slice(startIndex),
        getCycleProviderModuleId(closingEdge)
    ])
    const tokenIdPath = Object.freeze(
        cycleEdges.map((edge) => {
            return getCycleTokenId(edge)
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

function collectCycleEdgesByConsumerModuleId(
    edges: readonly ModuleDependencyEdge[]
): ReadonlyMap<string, readonly ModuleCycleTraversalEdge[]> {
    const edgesByModuleId = new Map<string, ModuleCycleTraversalEdge[]>()

    for (const edge of edges) {
        const cycleEdge = getCycleTraversalEdge(edge)

        if (cycleEdge === undefined) {
            continue
        }

        const moduleEdges = edgesByModuleId.get(cycleEdge.consumerModuleId)

        if (moduleEdges === undefined) {
            edgesByModuleId.set(cycleEdge.consumerModuleId, [cycleEdge])
        } else {
            moduleEdges.push(cycleEdge)
        }
    }

    return edgesByModuleId
}

function getCycleTraversalEdge(edge: ModuleDependencyEdge): ModuleCycleTraversalEdge | undefined {
    if (edge.edgeKind === 'capability') {
        return edge
    }

    if (isAdapterSourceModuleDependencyEdge(edge)) {
        return edge
    }

    return undefined
}

function isAdapterSourceModuleDependencyEdge(
    edge: ModuleDependencyEdge
): edge is AdapterSourceModuleDependencyEdge {
    return (
        edge.edgeKind === 'adapter-source' &&
        edge.sourceProvider !== undefined &&
        edge.sourceProvider.source === 'module' &&
        edge.sourceProvider.providerKind === 'capability' &&
        edge.sourceProvider.cardinality === 'single'
    )
}

function getCycleProviderModuleId(edge: ModuleCycleTraversalEdge): string {
    if (edge.edgeKind === 'capability') {
        return edge.providerModuleId
    }

    return edge.sourceProvider.moduleId
}

function getCycleTokenId(edge: ModuleCycleTraversalEdge): string {
    if (edge.edgeKind === 'capability') {
        return edge.requiredTokenId
    }

    return edge.adapterSourceTokenId
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

function collectComposerMultiBindingTokenIds(
    multiBindings: readonly ComposerMultiBindingRecord[]
): ReadonlySet<string> {
    const tokenIds = new Set<string>()

    for (const binding of multiBindings) {
        tokenIds.add(binding.token.id)
    }

    return tokenIds
}

function collectComposerBindingKindsByTokenId(
    bindings: readonly ComposerBindingRecord[]
): ReadonlyMap<string, readonly ComposerBindingKind[]> {
    const bindingKindsByTokenId = new Map<string, ComposerBindingKind[]>()

    for (const binding of bindings) {
        const bindingKinds = bindingKindsByTokenId.get(binding.token.id)

        if (bindingKinds === undefined) {
            bindingKindsByTokenId.set(binding.token.id, [binding.kind])
        } else {
            bindingKinds.push(binding.kind)
        }
    }

    return bindingKindsByTokenId
}

function collectComposerMultiBindingKindsByTokenId(
    multiBindings: readonly ComposerMultiBindingRecord[]
): ReadonlyMap<string, readonly ComposerMultiBindingKind[]> {
    const bindingKindsByTokenId = new Map<string, ComposerMultiBindingKind[]>()

    for (const binding of multiBindings) {
        const bindingKinds = bindingKindsByTokenId.get(binding.token.id)

        if (bindingKinds === undefined) {
            bindingKindsByTokenId.set(binding.token.id, [binding.kind])
        } else {
            bindingKinds.push(binding.kind)
        }
    }

    return bindingKindsByTokenId
}

function collectComposerMultiBindingsByTokenId(
    multiBindings: readonly ComposerMultiBindingRecord[]
): ReadonlyMap<string, readonly ComposerMultiBindingRecord[]> {
    const bindingsByTokenId = new Map<string, ComposerMultiBindingRecord[]>()

    for (const binding of multiBindings) {
        const bindingsForToken = bindingsByTokenId.get(binding.token.id)

        if (bindingsForToken === undefined) {
            bindingsByTokenId.set(binding.token.id, [binding])
        } else {
            bindingsForToken.push(binding)
        }
    }

    return bindingsByTokenId
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
                kind: capability.kind,
                cardinality: capability.cardinality ?? 'single'
            })
        }
    }

    return capabilitiesByTokenId
}

function collectCapabilityDeclarationsByTokenId(
    modules: readonly ModuleDefinition[]
): ReadonlyMap<string, readonly CapabilityDeclarationRecord[]> {
    const capabilitiesByTokenId = new Map<string, CapabilityDeclarationRecord[]>()

    for (const moduleDefinition of modules) {
        for (const capability of moduleDefinition.provides) {
            const declaration = {
                moduleId: moduleDefinition.id,
                tokenId: capability.token.id,
                kind: capability.kind,
                cardinality: capability.cardinality ?? 'single',
                source: `provides:${moduleDefinition.id}`
            }
            const existingDeclarations = capabilitiesByTokenId.get(capability.token.id)

            if (existingDeclarations === undefined) {
                capabilitiesByTokenId.set(capability.token.id, [declaration])
            } else {
                existingDeclarations.push(declaration)
            }
        }
    }

    return capabilitiesByTokenId
}

function collectRequiredPortDeclarationsByTokenId(
    modules: readonly ModuleDefinition[]
): ReadonlyMap<string, readonly RequiredPortDeclarationRecord[]> {
    const dependenciesByTokenId = new Map<string, RequiredPortDeclarationRecord[]>()

    for (const moduleDefinition of modules) {
        for (const dependency of moduleDefinition.requires) {
            const declaration = {
                moduleId: moduleDefinition.id,
                tokenId: dependency.token.id,
                dependencyKind: dependency.kind,
                required: dependency.required,
                cardinality: dependency.cardinality ?? 'single',
                source: `requires:${moduleDefinition.id}`
            }
            const existingDeclarations = dependenciesByTokenId.get(dependency.token.id)

            if (existingDeclarations === undefined) {
                dependenciesByTokenId.set(dependency.token.id, [declaration])
            } else {
                existingDeclarations.push(declaration)
            }
        }
    }

    return dependenciesByTokenId
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

function collectRequiredPortTokenIdsByKind(
    modules: readonly ModuleDefinition[],
    dependencyKind: ModuleDependencyKind
): ReadonlySet<string> {
    const tokenIds = new Set<string>()

    for (const moduleDefinition of modules) {
        for (const dependency of moduleDefinition.requires) {
            if (dependency.kind === dependencyKind) {
                tokenIds.add(dependency.token.id)
            }
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

    providerRegistration.registrationIndex = getNextProviderRegistrationIndex(
        access,
        originalToken.id
    )

    const existingRegistration = findRegisteredModuleCapability(
        access,
        moduleDefinition.id,
        originalToken.id
    )

    if (existingRegistration !== undefined) {
        existingRegistration.providers.push(providerRegistration)

        return
    }

    const registration = {
        source: 'module' as const,
        moduleId: moduleDefinition.id,
        tokenId: originalToken.id,
        kind: capability.kind,
        registrationKind,
        providers: [providerRegistration]
    }
    const existingRegistrations = access.registeredCapabilities.get(originalToken.id)

    if (existingRegistrations === undefined) {
        access.registeredCapabilities.set(originalToken.id, [registration])

        return
    }

    existingRegistrations.push(registration)
}

function recordCompositionRootProvider(
    originalToken: Token<unknown>,
    providerRegistration: ProviderRegistrationRecord,
    access: CompositionAccessModel
): void {
    const capability = findFirstPublicMultiCapabilityDeclaration(access, originalToken.id)

    if (capability === undefined) {
        return
    }

    providerRegistration.registrationIndex = getNextProviderRegistrationIndex(
        access,
        originalToken.id
    )

    const existingRegistration = findRegisteredCompositionRootCapability(access, originalToken.id)

    if (existingRegistration !== undefined) {
        existingRegistration.providers.push(providerRegistration)

        return
    }

    const registration = {
        source: 'composition-root' as const,
        tokenId: originalToken.id,
        kind: capability.kind,
        registrationKind: 'multi' as const,
        providers: [providerRegistration]
    }
    const existingRegistrations = access.registeredCapabilities.get(originalToken.id)

    if (existingRegistrations === undefined) {
        access.registeredCapabilities.set(originalToken.id, [registration])

        return
    }

    existingRegistrations.push(registration)
}

function findFirstPublicMultiCapabilityDeclaration(
    access: CompositionAccessModel,
    tokenId: string
): CapabilityDeclarationRecord | undefined {
    return access.capabilityDeclarationsByTokenId.get(tokenId)?.find((capability) => {
        return capability.cardinality === 'multi'
    })
}

function findRegisteredCompositionRootCapability(
    access: CompositionAccessModel,
    tokenId: string
): RegisteredCompositionRootCapabilityProvider | undefined {
    return access.registeredCapabilities.get(tokenId)?.find((registration) => {
        return registration.source === 'composition-root'
    }) as RegisteredCompositionRootCapabilityProvider | undefined
}

function getNextProviderRegistrationIndex(access: CompositionAccessModel, tokenId: string): number {
    const registrations = access.registeredCapabilities.get(tokenId)

    if (registrations === undefined) {
        return 0
    }

    return registrations.reduce((count, registration) => {
        return count + registration.providers.length
    }, 0)
}

function validateDeclaredProviderRegistrations(
    modules: readonly ModuleDefinition[],
    access: CompositionAccessModel
): DiagnosticReport {
    const diagnostics: Diagnostic[] = []

    for (const moduleDefinition of modules) {
        for (const capability of moduleDefinition.provides) {
            const declaredCardinality = capability.cardinality ?? 'single'
            const registeredCapability = findRegisteredModuleCapability(
                access,
                moduleDefinition.id,
                capability.token.id
            )

            if (registeredCapability === undefined) {
                diagnostics.push(
                    diagnosticFromError(
                        new MissingModuleProviderError(moduleDefinition.id, capability.token.id)
                    )
                )

                continue
            }

            if (registeredCapability.registrationKind !== declaredCardinality) {
                diagnostics.push(
                    diagnosticFromError(
                        new CapabilityRegistrationCardinalityMismatchError(
                            moduleDefinition.id,
                            capability.token.id,
                            declaredCardinality,
                            registeredCapability.registrationKind
                        )
                    )
                )
            }
        }
    }

    return createDiagnosticReport(diagnostics)
}

function validateAdapterSourcesAfterSetup(
    bindings: readonly ComposerBindingRecord[],
    access: CompositionAccessModel
): DiagnosticReport {
    const diagnostics: Diagnostic[] = []

    for (const binding of bindings) {
        if (binding.kind !== 'adapter') {
            continue
        }

        for (const sourceEntry of getComposerAdapterSourceEntries(binding.source)) {
            const tokenId = sourceEntry.token.id

            if (access.publicTokenIds.has(tokenId) || access.bindingTokenIds.has(tokenId)) {
                continue
            }

            if (hasPrivateProviderTokenId(access, tokenId)) {
                diagnostics.push(
                    diagnosticFromError(
                        new AdapterSourcePrivateError(
                            binding.token.id,
                            tokenId,
                            sourceEntry.property
                        )
                    )
                )

                continue
            }

            diagnostics.push(
                diagnosticFromError(
                    new AdapterSourceMissingError(binding.token.id, tokenId, sourceEntry.property)
                )
            )
        }
    }

    return createDiagnosticReport(diagnostics)
}

function hasPrivateProviderTokenId(access: CompositionAccessModel, tokenId: string): boolean {
    for (const privateTokens of access.privateTokensByModuleId.values()) {
        if (privateTokens.has(tokenId)) {
            return true
        }
    }

    return false
}

function findRegisteredModuleCapability(
    access: CompositionAccessModel,
    moduleId: string,
    tokenId: string
): RegisteredModuleCapabilityProvider | undefined {
    return access.registeredCapabilities.get(tokenId)?.find((registration) => {
        return registration.source === 'module' && registration.moduleId === moduleId
    }) as RegisteredModuleCapabilityProvider | undefined
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
        [...access.registeredCapabilities.values()]
            .flatMap((capabilitiesForToken) => {
                return capabilitiesForToken
            })
            .map((capability) => {
                const base = {
                    source: capability.source,
                    tokenId: capability.tokenId,
                    kind: capability.kind,
                    registrationKind: capability.registrationKind
                }

                if (capability.source === 'module') {
                    return Object.freeze({
                        ...base,
                        moduleId: capability.moduleId
                    })
                }

                return Object.freeze(base)
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

function mergeDiagnosticReports(...reports: readonly DiagnosticReport[]): DiagnosticReport {
    return createDiagnosticReport(
        reports.flatMap((report) => {
            return report.diagnostics
        })
    )
}

function createModuleDefinition<
    TMetadata,
    TRequires extends readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinitionInput[]
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
): NormalizedModuleDependencyDefinition {
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
    const cardinality = validateCardinality(
        dependency.cardinality,
        moduleId,
        `requires[${index}].cardinality`
    )
    const description = validateOptionalString(
        dependency.description,
        moduleId,
        `requires[${index}].description`
    )
    const base = {
        token: dependencyToken,
        required: required ?? true,
        kind: kind ?? 'external',
        cardinality: cardinality ?? 'single'
    }
    const normalized =
        description === undefined
            ? base
            : {
                  ...base,
                  description
              }

    return Object.freeze(normalized)
}

function normalizeCapability(
    moduleId: string,
    capability: unknown,
    index: number
): NormalizedModuleCapabilityDefinition {
    if (!isRecord(capability)) {
        throw new InvalidModuleDefinitionError(`provides[${index}] must be an object`, {
            moduleId,
            value: capability
        })
    }

    const capabilityToken = validateToken(capability.token, moduleId, `provides[${index}].token`)
    const kind = validateCapabilityKind(capability.kind, moduleId, `provides[${index}].kind`)
    const cardinality = validateCardinality(
        capability.cardinality,
        moduleId,
        `provides[${index}].cardinality`
    )
    const description = validateOptionalString(
        capability.description,
        moduleId,
        `provides[${index}].description`
    )
    const base = {
        token: capabilityToken,
        kind,
        cardinality: cardinality ?? 'single'
    }
    const normalized =
        description === undefined
            ? base
            : {
                  ...base,
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

function validateCardinality(
    value: unknown,
    moduleId: string,
    field: string
): ModuleCardinality | undefined {
    if (value === undefined) {
        return undefined
    }

    if (!isModuleCardinality(value)) {
        throw new InvalidModuleDefinitionError(
            `${field} must be "single" or "multi" when provided`,
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

function formatInvalidComposerMultiBindingReason(
    reason: InvalidComposerMultiBindingReason
): string {
    if (reason === 'single-capability') {
        return 'target is declared as a single public capability'
    }

    if (reason === 'required-port-only') {
        return 'target is declared only as a required port'
    }

    return 'target is not a declared public multi capability'
}

function createAdapterSourceErrorDetails(
    targetTokenId: string,
    sourceTokenId: string,
    sourceProperty: string | undefined
): AdapterSourceErrorDetails {
    if (sourceProperty === undefined) {
        return Object.freeze({
            targetTokenId,
            sourceTokenId
        })
    }

    return Object.freeze({
        targetTokenId,
        sourceTokenId,
        sourceProperty
    })
}

function formatAdapterSourceMessage(
    targetTokenId: string,
    sourceTokenId: string,
    sourceProperty: string | undefined,
    reason: string
): string {
    const propertyDetail = sourceProperty === undefined ? '' : ` property "${sourceProperty}"`

    return (
        `Invalid adapter source${propertyDetail} "${sourceTokenId}" for target ` +
        `"${targetTokenId}": ${reason}`
    )
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

function isModuleCardinality(value: unknown): value is ModuleCardinality {
    return moduleCardinalities.includes(value as ModuleCardinality)
}

function isModuleCapabilityKind(value: unknown): value is ModuleCapabilityKind {
    return moduleCapabilityKinds.includes(value as ModuleCapabilityKind)
}

function isToken(value: unknown): value is Token<unknown> {
    return isRecord(value) && typeof value.id === 'string' && value.id.length > 0
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
