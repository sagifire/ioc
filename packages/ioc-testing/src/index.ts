import {
    SagifireIocError,
    diagnosticFromError,
    defineModule,
    formatDiagnostics,
    createComposer,
    createContainer,
    type AsyncProviderFactory,
    type ClassConstructor,
    type ComposedRuntime,
    type Composer,
    type ComposerBindingKind,
    type ComposerInspection,
    type ContainerBuilder,
    type ContainerRuntime,
    type Diagnostic,
    type DiagnosticReport,
    type DiagnosticSeverity,
    type InspectionProviderKind,
    type ModuleCapabilityDefinition,
    type ModuleCapabilityKind,
    type ModuleDependencyDefinition,
    type ModuleDependencyDefinitionInput,
    type ModuleDependencyEdge,
    type ModuleDefinition,
    type ModuleDefinitionInput,
    type ModuleDependencyKind,
    type ModuleGraph,
    type ModuleSetupContext,
    type PreparedComposition,
    type RequiredPortSatisfaction,
    type RuntimeInspection,
    type SyncProviderFactory,
    type Token
} from '@sagifire/ioc'

type Awaitable<TValue> = TValue | Promise<TValue>

export type TestRuntimeConfigurator = (container: ContainerBuilder) => Awaitable<void>
export type TestComposerConfigurator = (composer: Composer) => void

export type TestOverrideKind = 'value' | 'factory' | 'class' | 'async-factory'
export type FakeModuleProviderKind = 'value' | 'factory' | 'async-factory'

export interface TestValueOverride<TValue = unknown> {
    readonly kind: 'value'
    readonly token: Token<TValue>
    readonly value: TValue
}

export interface TestFactoryOverride<TValue = unknown> {
    readonly kind: 'factory'
    readonly token: Token<TValue>
    readonly factory: SyncProviderFactory<TValue>
}

export interface TestClassOverride<TValue = unknown> {
    readonly kind: 'class'
    readonly token: Token<TValue>
    readonly classConstructor: ClassConstructor<TValue>
}

export interface TestAsyncFactoryOverride<TValue = unknown> {
    readonly kind: 'async-factory'
    readonly token: Token<TValue>
    readonly factory: AsyncProviderFactory<TValue>
}

export type TestOverride<TValue = unknown> =
    | TestValueOverride<TValue>
    | TestFactoryOverride<TValue>
    | TestClassOverride<TValue>
    | TestAsyncFactoryOverride<TValue>

export interface FakeModuleProviderBase<TValue = unknown> {
    readonly token: Token<TValue>
    readonly kind?: ModuleCapabilityKind
    readonly description?: string
}

export interface FakeModuleValueProvider<TValue = unknown> extends FakeModuleProviderBase<TValue> {
    readonly useValue: TValue
}

export interface FakeModuleFactoryProvider<
    TValue = unknown
> extends FakeModuleProviderBase<TValue> {
    readonly useFactory: SyncProviderFactory<TValue>
}

export interface FakeModuleAsyncFactoryProvider<
    TValue = unknown
> extends FakeModuleProviderBase<TValue> {
    readonly useAsyncFactory: AsyncProviderFactory<TValue>
}

export type FakeModuleProvider<TValue = unknown> =
    | FakeModuleValueProvider<TValue>
    | FakeModuleFactoryProvider<TValue>
    | FakeModuleAsyncFactoryProvider<TValue>

export interface TestOverrideBuilder<TValue> {
    toValue(value: TValue): TestValueOverride<TValue>
    toFactory(factory: SyncProviderFactory<TValue>): TestFactoryOverride<TValue>
    toClass(classConstructor: ClassConstructor<TValue>): TestClassOverride<TValue>
    toAsyncFactory(factory: AsyncProviderFactory<TValue>): TestAsyncFactoryOverride<TValue>
}

type NormalizedFakeModuleDependencies<
    TRequires extends readonly ModuleDependencyDefinitionInput[]
> = {
    readonly [TIndex in keyof TRequires]: TRequires[TIndex] extends ModuleDependencyDefinitionInput<
        infer TValue
    >
        ? ModuleDependencyDefinition<TValue>
        : never
}

type NormalizedFakeModuleCapabilities<TProvides extends readonly FakeModuleProvider[]> = {
    readonly [TIndex in keyof TProvides]: TProvides[TIndex] extends FakeModuleProvider<infer TValue>
        ? ModuleCapabilityDefinition<TValue>
        : never
}

export interface DuplicateTestOverrideErrorDetails {
    readonly tokenId: string
}

export class DuplicateTestOverrideError extends SagifireIocError<DuplicateTestOverrideErrorDetails> {
    override readonly name = 'DuplicateTestOverrideError'
    override readonly code = 'SAGIFIRE_IOC_TESTING_DUPLICATE_OVERRIDE'
    readonly tokenId: string

    constructor(tokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_TESTING_DUPLICATE_OVERRIDE',
            message: `Duplicate test override for token "${tokenId}"`,
            details: {
                tokenId
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
    }
}

export interface CreateTestRuntimeOptions {
    readonly configure?: TestRuntimeConfigurator
    readonly overrides?: readonly TestOverride[]
}

export interface CreateTestComposerOptions {
    readonly modules?: readonly ModuleDefinition[]
    readonly configure?: TestComposerConfigurator
    readonly overrides?: readonly TestOverride[]
}

export interface FakeModuleOptions<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
> {
    readonly version?: string
    readonly metadata?: TMetadata
    readonly requires?: TRequires
    readonly provides?: TProvides
}

export interface FakeModuleInput<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
> extends FakeModuleOptions<TMetadata, TRequires, TProvides> {
    readonly id: string
}

export type FakeModuleDefinition<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
> = ModuleDefinition<
    TMetadata,
    NormalizedFakeModuleDependencies<TRequires>,
    NormalizedFakeModuleCapabilities<TProvides>
>

export interface CreateModuleHarnessOptions<TModule extends ModuleDefinition = ModuleDefinition> {
    readonly module: TModule
    readonly supportModules?: readonly ModuleDefinition[]
    readonly fakeModules?: readonly ModuleDefinition[]
    readonly configure?: TestComposerConfigurator
    readonly overrides?: readonly TestOverride[]
}

export interface ModuleHarness<TModule extends ModuleDefinition = ModuleDefinition> {
    readonly module: TModule
    readonly supportModules: readonly ModuleDefinition[]
    readonly fakeModules: readonly ModuleDefinition[]
    readonly modules: readonly ModuleDefinition[]
    readonly composer: Composer
    validate(): DiagnosticReport
    inspect(): ComposerInspection
    getGraph(): ModuleGraph
    prepare(): Promise<PreparedComposition>
    compose(): Promise<ComposedRuntime>
}

export type GraphAssertionInput = ModuleGraph | ComposerInspection | RuntimeInspection

export interface GraphCapabilityExpectation {
    readonly moduleId?: string
    readonly tokenId: string
    readonly kind?: ModuleCapabilityKind
}

export interface GraphRequiredPortExpectation {
    readonly moduleId: string
    readonly tokenId: string
    readonly required?: boolean
    readonly kind?: ModuleDependencyKind
    readonly satisfiedBy?: RequiredPortSatisfaction
}

export interface GraphBindingExpectation {
    readonly tokenId: string
    readonly kind?: ComposerBindingKind
    readonly providerKind?: InspectionProviderKind
}

export type GraphEdgeExpectation = GraphCapabilityEdgeExpectation | GraphBindingEdgeExpectation

export interface GraphCapabilityEdgeExpectation {
    readonly edgeKind: 'capability'
    readonly consumerModuleId?: string
    readonly requiredTokenId?: string
    readonly dependencyKind?: ModuleDependencyKind
    readonly providerModuleId?: string
    readonly capabilityTokenId?: string
    readonly capabilityKind?: ModuleCapabilityKind
}

export interface GraphBindingEdgeExpectation {
    readonly edgeKind: 'binding'
    readonly consumerModuleId?: string
    readonly requiredTokenId?: string
    readonly dependencyKind?: ModuleDependencyKind
    readonly bindingTokenId?: string
    readonly bindingKind?: ComposerBindingKind
}

export interface DiagnosticExpectation {
    readonly code?: string
    readonly severity?: DiagnosticSeverity
    readonly message?: string
    readonly messageIncludes?: string
    readonly details?: unknown
}

export class GraphAssertionError extends Error {
    override readonly name = 'GraphAssertionError'

    constructor(message: string) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class DiagnosticAssertionError extends Error {
    override readonly name = 'DiagnosticAssertionError'

    constructor(message: string) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export function createTestRuntime(configure?: TestRuntimeConfigurator): Promise<ContainerRuntime>
export function createTestRuntime(options?: CreateTestRuntimeOptions): Promise<ContainerRuntime>
export async function createTestRuntime(
    input?: TestRuntimeConfigurator | CreateTestRuntimeOptions
): Promise<ContainerRuntime> {
    const configure = getTestRuntimeConfigurator(input)
    const overrides = getTestRuntimeOverrides(input)

    assertNoDuplicateTestOverrides(overrides)

    const container = createContainer()

    if (configure !== undefined) {
        await configure(container)
    }

    applyTestOverridesToContainer(container, overrides)

    return container.freeze()
}

export function createTestComposer(configure?: TestComposerConfigurator): Composer
export function createTestComposer(options?: CreateTestComposerOptions): Composer
export function createTestComposer(
    input?: TestComposerConfigurator | CreateTestComposerOptions
): Composer {
    const modules = getTestComposerModules(input)
    const configure = getTestComposerConfigurator(input)
    const overrides = getTestComposerOverrides(input)

    assertNoDuplicateTestOverrides(overrides)

    const composer = createComposer()

    for (const moduleDefinition of modules) {
        composer.use(moduleDefinition)
    }

    if (configure !== undefined) {
        configure(composer)
    }

    applyTestOverridesToComposer(composer, overrides)

    return composer
}

export function fakeModule<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
>(
    definition: FakeModuleInput<TMetadata, TRequires, TProvides>
): FakeModuleDefinition<TMetadata, TRequires, TProvides>
export function fakeModule<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
>(
    id: string,
    definition?: FakeModuleOptions<TMetadata, TRequires, TProvides>
): FakeModuleDefinition<TMetadata, TRequires, TProvides>
export function fakeModule<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
>(
    idOrDefinition: string | FakeModuleInput<TMetadata, TRequires, TProvides>,
    definition?: FakeModuleOptions<TMetadata, TRequires, TProvides>
): FakeModuleDefinition<TMetadata, TRequires, TProvides> {
    const fakeModuleDefinition =
        typeof idOrDefinition === 'string'
            ? createFakeModuleInput(idOrDefinition, definition)
            : idOrDefinition
    const providers = fakeModuleDefinition.provides ?? ([] as unknown as TProvides)
    const moduleDefinitionInput = createExplicitFakeModuleDefinitionInput(
        fakeModuleDefinition,
        providers
    )

    return defineModule(moduleDefinitionInput) as unknown as FakeModuleDefinition<
        TMetadata,
        TRequires,
        TProvides
    >
}

export function createModuleHarness<TModule extends ModuleDefinition = ModuleDefinition>(
    options: CreateModuleHarnessOptions<TModule>
): ModuleHarness<TModule> {
    const supportModules = Object.freeze([...(options.supportModules ?? [])])
    const fakeModules = Object.freeze([...(options.fakeModules ?? [])])
    const modules = Object.freeze([options.module, ...supportModules, ...fakeModules])
    const composer = createTestComposer({
        modules,
        ...(options.configure === undefined ? {} : { configure: options.configure }),
        ...(options.overrides === undefined ? {} : { overrides: options.overrides })
    })

    return Object.freeze({
        module: options.module,
        supportModules,
        fakeModules,
        modules,
        composer,

        validate(): DiagnosticReport {
            return composer.validate()
        },

        inspect(): ComposerInspection {
            return composer.inspect()
        },

        getGraph(): ModuleGraph {
            return composer.getGraph()
        },

        prepare(): Promise<PreparedComposition> {
            return composer.prepare()
        },

        compose(): Promise<ComposedRuntime> {
            return composer.compose()
        }
    })
}

export function assertGraphHasModule(input: GraphAssertionInput, moduleId: string): void {
    const graph = getAssertionGraph(input)
    const matchedModule = graph.modules.find((moduleMetadata) => {
        return moduleMetadata.id === moduleId
    })

    if (matchedModule !== undefined) {
        return
    }

    throw new GraphAssertionError(
        [
            `Expected module graph to contain module "${moduleId}".`,
            'Available modules:',
            ...formatGraphModules(graph)
        ].join('\n')
    )
}

export function assertGraphHasCapability(
    input: GraphAssertionInput,
    expectation: GraphCapabilityExpectation
): void {
    const graph = getAssertionGraph(input)
    const matchedCapability = graph.capabilities.find((capability) => {
        return (
            capability.tokenId === expectation.tokenId &&
            matchesOptional(capability.moduleId, expectation.moduleId) &&
            matchesOptional(capability.kind, expectation.kind)
        )
    })

    if (matchedCapability !== undefined) {
        return
    }

    throw new GraphAssertionError(
        [
            `Expected module graph to contain capability ${formatCapabilityExpectation(expectation)}.`,
            'Available capabilities:',
            ...formatGraphCapabilities(graph)
        ].join('\n')
    )
}

export function assertGraphHasRequiredPort(
    input: GraphAssertionInput,
    expectation: GraphRequiredPortExpectation
): void {
    const graph = getAssertionGraph(input)
    const matchedRequiredPort = graph.requiredPorts.find((requiredPort) => {
        return (
            requiredPort.moduleId === expectation.moduleId &&
            requiredPort.tokenId === expectation.tokenId &&
            matchesOptional(requiredPort.required, expectation.required) &&
            matchesOptional(requiredPort.kind, expectation.kind) &&
            matchesOptional(requiredPort.satisfiedBy, expectation.satisfiedBy)
        )
    })

    if (matchedRequiredPort !== undefined) {
        return
    }

    throw new GraphAssertionError(
        [
            `Expected module graph to contain required port ${formatRequiredPortExpectation(expectation)}.`,
            'Available required ports:',
            ...formatGraphRequiredPorts(graph)
        ].join('\n')
    )
}

export function assertGraphHasBinding(
    input: GraphAssertionInput,
    expectation: GraphBindingExpectation
): void {
    const graph = getAssertionGraph(input)
    const matchedBinding = graph.bindings.find((binding) => {
        return (
            binding.tokenId === expectation.tokenId &&
            matchesOptional(binding.kind, expectation.kind) &&
            matchesOptional(binding.providerKind, expectation.providerKind)
        )
    })

    if (matchedBinding !== undefined) {
        return
    }

    throw new GraphAssertionError(
        [
            `Expected module graph to contain binding ${formatBindingExpectation(expectation)}.`,
            'Available bindings:',
            ...formatGraphBindings(graph)
        ].join('\n')
    )
}

export function assertGraphHasEdge(
    input: GraphAssertionInput,
    expectation: GraphEdgeExpectation
): void {
    const graph = getAssertionGraph(input)
    const matchedEdge = graph.edges.find((edge) => {
        return matchesGraphEdge(edge, expectation)
    })

    if (matchedEdge !== undefined) {
        return
    }

    throw new GraphAssertionError(
        [
            `Expected module graph to contain ${formatEdgeExpectation(expectation)}.`,
            'Available dependency edges:',
            ...formatGraphEdges(graph)
        ].join('\n')
    )
}

export function assertDiagnosticReportOk(report: DiagnosticReport): void {
    if (report.ok && report.diagnostics.length === 0) {
        return
    }

    throw new DiagnosticAssertionError(
        [
            'Expected diagnostic report to be ok with no diagnostics.',
            'Actual report:',
            formatDiagnostics(report)
        ].join('\n')
    )
}

export function assertDiagnosticReportHasDiagnostic(
    report: DiagnosticReport,
    expectation: DiagnosticExpectation
): void {
    const matchedDiagnostic = report.diagnostics.find((diagnostic) => {
        return matchesDiagnostic(diagnostic, expectation)
    })

    if (matchedDiagnostic !== undefined) {
        return
    }

    throw new DiagnosticAssertionError(
        [
            `Expected diagnostic report to contain diagnostic ${formatDiagnosticExpectation(expectation)}.`,
            'Actual report:',
            formatDiagnostics(report)
        ].join('\n')
    )
}

export function assertErrorDiagnostic(error: unknown, expectation: DiagnosticExpectation): void {
    const diagnostic = diagnosticFromError(error)

    if (matchesDiagnostic(diagnostic, expectation)) {
        return
    }

    const report = {
        ok: false,
        diagnostics: [diagnostic]
    }

    throw new DiagnosticAssertionError(
        [
            `Expected error-derived diagnostic to match ${formatDiagnosticExpectation(expectation)}.`,
            'Actual diagnostic:',
            formatDiagnostics(report)
        ].join('\n')
    )
}

function createTestOverride<TValue>(overrideToken: Token<TValue>): TestOverrideBuilder<TValue> {
    return Object.freeze({
        toValue(value: TValue): TestValueOverride<TValue> {
            return Object.freeze({
                kind: 'value',
                token: overrideToken,
                value
            })
        },

        toFactory(factory: SyncProviderFactory<TValue>): TestFactoryOverride<TValue> {
            return Object.freeze({
                kind: 'factory',
                token: overrideToken,
                factory
            })
        },

        toClass(classConstructor: ClassConstructor<TValue>): TestClassOverride<TValue> {
            return Object.freeze({
                kind: 'class',
                token: overrideToken,
                classConstructor
            })
        },

        toAsyncFactory(factory: AsyncProviderFactory<TValue>): TestAsyncFactoryOverride<TValue> {
            return Object.freeze({
                kind: 'async-factory',
                token: overrideToken,
                factory
            })
        }
    })
}

function createFakeModuleInput<
    TMetadata,
    TRequires extends readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly FakeModuleProvider[]
>(
    id: string,
    definition: FakeModuleOptions<TMetadata, TRequires, TProvides> | undefined
): FakeModuleInput<TMetadata, TRequires, TProvides> {
    if (definition === undefined) {
        return {
            id
        }
    }

    return {
        ...definition,
        id
    }
}

function createExplicitFakeModuleDefinitionInput<
    TMetadata,
    TRequires extends readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly FakeModuleProvider[]
>(
    definition: FakeModuleInput<TMetadata, TRequires, TProvides>,
    providers: TProvides
): ModuleDefinitionInput<TMetadata, TRequires, NormalizedFakeModuleCapabilities<TProvides>> {
    const baseDefinition = {
        id: definition.id,
        requires: definition.requires ?? ([] as unknown as TRequires),
        provides: createFakeModuleCapabilities(providers),
        setup(context: ModuleSetupContext): void {
            for (const provider of providers) {
                applyFakeModuleProvider(context, provider)
            }
        }
    }
    const withVersion =
        definition.version === undefined
            ? baseDefinition
            : {
                  ...baseDefinition,
                  version: definition.version
              }

    if (definition.metadata === undefined) {
        return withVersion
    }

    return {
        ...withVersion,
        metadata: definition.metadata
    }
}

function createFakeModuleCapabilities<TProvides extends readonly FakeModuleProvider[]>(
    providers: TProvides
): NormalizedFakeModuleCapabilities<TProvides> {
    return Object.freeze(
        providers.map((provider) => {
            return createFakeModuleCapability(provider)
        })
    ) as NormalizedFakeModuleCapabilities<TProvides>
}

function createFakeModuleCapability<TValue>(
    provider: FakeModuleProvider<TValue>
): ModuleCapabilityDefinition<TValue> {
    const kind = provider.kind ?? 'public-api'

    if (provider.description === undefined) {
        return Object.freeze({
            token: provider.token,
            kind
        })
    }

    return Object.freeze({
        token: provider.token,
        kind,
        description: provider.description
    })
}

function applyFakeModuleProvider<TValue>(
    context: ModuleSetupContext,
    provider: FakeModuleProvider<TValue>
): void {
    const builder = context.bind(provider.token)

    if ('useValue' in provider) {
        builder.toValue(provider.useValue)

        return
    }

    if ('useFactory' in provider) {
        builder.toFactory(provider.useFactory)

        return
    }

    builder.toAsyncFactory(provider.useAsyncFactory)
}

function getTestRuntimeConfigurator(
    input: TestRuntimeConfigurator | CreateTestRuntimeOptions | undefined
): TestRuntimeConfigurator | undefined {
    if (typeof input === 'function') {
        return input
    }

    return input?.configure
}

function getTestRuntimeOverrides(
    input: TestRuntimeConfigurator | CreateTestRuntimeOptions | undefined
): readonly TestOverride[] {
    if (typeof input === 'function') {
        return []
    }

    return input?.overrides ?? []
}

function getTestComposerModules(
    input: TestComposerConfigurator | CreateTestComposerOptions | undefined
): readonly ModuleDefinition[] {
    if (typeof input === 'function') {
        return []
    }

    return input?.modules ?? []
}

function getTestComposerConfigurator(
    input: TestComposerConfigurator | CreateTestComposerOptions | undefined
): TestComposerConfigurator | undefined {
    if (typeof input === 'function') {
        return input
    }

    return input?.configure
}

function getTestComposerOverrides(
    input: TestComposerConfigurator | CreateTestComposerOptions | undefined
): readonly TestOverride[] {
    if (typeof input === 'function') {
        return []
    }

    return input?.overrides ?? []
}

function assertNoDuplicateTestOverrides(overrides: readonly TestOverride[]): void {
    const tokenIds = new Set<string>()

    for (const testOverride of overrides) {
        const tokenId = testOverride.token.id

        if (tokenIds.has(tokenId)) {
            throw new DuplicateTestOverrideError(tokenId)
        }

        tokenIds.add(tokenId)
    }
}

function applyTestOverridesToContainer(
    container: ContainerBuilder,
    overrides: readonly TestOverride[]
): void {
    for (const testOverride of overrides) {
        const builder = container.bind(testOverride.token)

        if (testOverride.kind === 'value') {
            builder.toValue(testOverride.value)
        } else if (testOverride.kind === 'factory') {
            builder.toFactory(testOverride.factory)
        } else if (testOverride.kind === 'class') {
            builder.toClass(testOverride.classConstructor)
        } else {
            builder.toAsyncFactory(testOverride.factory)
        }
    }
}

function applyTestOverridesToComposer(
    composer: Composer,
    overrides: readonly TestOverride[]
): void {
    for (const testOverride of overrides) {
        const builder = composer.bind(testOverride.token)

        if (testOverride.kind === 'value') {
            builder.toValue(testOverride.value)
        } else if (testOverride.kind === 'factory') {
            builder.toFactory(testOverride.factory)
        } else if (testOverride.kind === 'class') {
            builder.toClass(testOverride.classConstructor)
        } else {
            builder.toAsyncFactory(testOverride.factory)
        }
    }
}

function getAssertionGraph(input: GraphAssertionInput): ModuleGraph {
    if (hasGraphProperty(input)) {
        return input.graph
    }

    return input
}

function hasGraphProperty(
    input: GraphAssertionInput
): input is ComposerInspection | RuntimeInspection {
    return 'graph' in input
}

function matchesOptional<TValue>(actual: TValue, expected: TValue | undefined): boolean {
    return expected === undefined || actual === expected
}

function matchesGraphEdge(edge: ModuleDependencyEdge, expectation: GraphEdgeExpectation): boolean {
    if (edge.edgeKind !== expectation.edgeKind) {
        return false
    }

    if (expectation.edgeKind === 'capability') {
        return (
            edge.edgeKind === 'capability' &&
            matchesOptional(edge.consumerModuleId, expectation.consumerModuleId) &&
            matchesOptional(edge.requiredTokenId, expectation.requiredTokenId) &&
            matchesOptional(edge.dependencyKind, expectation.dependencyKind) &&
            matchesOptional(edge.providerModuleId, expectation.providerModuleId) &&
            matchesOptional(edge.capabilityTokenId, expectation.capabilityTokenId) &&
            matchesOptional(edge.capabilityKind, expectation.capabilityKind)
        )
    }

    return (
        edge.edgeKind === 'binding' &&
        matchesOptional(edge.consumerModuleId, expectation.consumerModuleId) &&
        matchesOptional(edge.requiredTokenId, expectation.requiredTokenId) &&
        matchesOptional(edge.dependencyKind, expectation.dependencyKind) &&
        matchesOptional(edge.bindingTokenId, expectation.bindingTokenId) &&
        matchesOptional(edge.bindingKind, expectation.bindingKind)
    )
}

function matchesDiagnostic(diagnostic: Diagnostic, expectation: DiagnosticExpectation): boolean {
    if (!matchesOptional(diagnostic.code, expectation.code)) {
        return false
    }

    if (!matchesOptional(diagnostic.severity, expectation.severity)) {
        return false
    }

    if (!matchesOptional(diagnostic.message, expectation.message)) {
        return false
    }

    if (
        expectation.messageIncludes !== undefined &&
        !diagnostic.message.includes(expectation.messageIncludes)
    ) {
        return false
    }

    if (
        expectation.details !== undefined &&
        stableFormat(diagnostic.details) !== stableFormat(expectation.details)
    ) {
        return false
    }

    return true
}

function formatGraphModules(graph: ModuleGraph): readonly string[] {
    if (graph.modules.length === 0) {
        return ['- <none>']
    }

    return graph.modules.map((moduleMetadata) => {
        return `- "${moduleMetadata.id}"`
    })
}

function formatGraphCapabilities(graph: ModuleGraph): readonly string[] {
    if (graph.capabilities.length === 0) {
        return ['- <none>']
    }

    return graph.capabilities.map((capability) => {
        return (
            `- module "${capability.moduleId}" provides "${capability.tokenId}" ` +
            `(${capability.kind})`
        )
    })
}

function formatGraphRequiredPorts(graph: ModuleGraph): readonly string[] {
    if (graph.requiredPorts.length === 0) {
        return ['- <none>']
    }

    return graph.requiredPorts.map((requiredPort) => {
        return (
            `- module "${requiredPort.moduleId}" requires "${requiredPort.tokenId}" ` +
            `(${requiredPort.kind}, required: ${requiredPort.required}, ` +
            `satisfiedBy: ${requiredPort.satisfiedBy})`
        )
    })
}

function formatGraphBindings(graph: ModuleGraph): readonly string[] {
    if (graph.bindings.length === 0) {
        return ['- <none>']
    }

    return graph.bindings.map((binding) => {
        const details = [
            `kind: ${binding.kind}`,
            `providerKind: ${binding.providerKind}`,
            ...(binding.lifetime === undefined ? [] : [`lifetime: ${binding.lifetime}`]),
            ...(binding.initialization === undefined
                ? []
                : [`initialization: ${binding.initialization}`])
        ]

        return `- token "${binding.tokenId}" (${details.join(', ')})`
    })
}

function formatGraphEdges(graph: ModuleGraph): readonly string[] {
    if (graph.edges.length === 0) {
        return ['- <none>']
    }

    return graph.edges.map((edge) => {
        return `- ${formatGraphEdge(edge)}`
    })
}

function formatCapabilityExpectation(expectation: GraphCapabilityExpectation): string {
    return formatExpectationParts([
        `token "${expectation.tokenId}"`,
        formatOptionalExpectationPart('module', expectation.moduleId),
        formatOptionalExpectationPart('kind', expectation.kind)
    ])
}

function formatRequiredPortExpectation(expectation: GraphRequiredPortExpectation): string {
    return formatExpectationParts([
        `module "${expectation.moduleId}"`,
        `token "${expectation.tokenId}"`,
        formatOptionalExpectationPart('required', expectation.required),
        formatOptionalExpectationPart('kind', expectation.kind),
        formatOptionalExpectationPart('satisfiedBy', expectation.satisfiedBy)
    ])
}

function formatBindingExpectation(expectation: GraphBindingExpectation): string {
    return formatExpectationParts([
        `token "${expectation.tokenId}"`,
        formatOptionalExpectationPart('kind', expectation.kind),
        formatOptionalExpectationPart('providerKind', expectation.providerKind)
    ])
}

function formatEdgeExpectation(expectation: GraphEdgeExpectation): string {
    if (expectation.edgeKind === 'capability') {
        return formatExpectationParts([
            'capability dependency edge',
            formatOptionalExpectationPart('consumerModuleId', expectation.consumerModuleId),
            formatOptionalExpectationPart('requiredTokenId', expectation.requiredTokenId),
            formatOptionalExpectationPart('dependencyKind', expectation.dependencyKind),
            formatOptionalExpectationPart('providerModuleId', expectation.providerModuleId),
            formatOptionalExpectationPart('capabilityTokenId', expectation.capabilityTokenId),
            formatOptionalExpectationPart('capabilityKind', expectation.capabilityKind)
        ])
    }

    return formatExpectationParts([
        'binding dependency edge',
        formatOptionalExpectationPart('consumerModuleId', expectation.consumerModuleId),
        formatOptionalExpectationPart('requiredTokenId', expectation.requiredTokenId),
        formatOptionalExpectationPart('dependencyKind', expectation.dependencyKind),
        formatOptionalExpectationPart('bindingTokenId', expectation.bindingTokenId),
        formatOptionalExpectationPart('bindingKind', expectation.bindingKind)
    ])
}

function formatGraphEdge(edge: ModuleDependencyEdge): string {
    if (edge.edgeKind === 'capability') {
        return (
            `capability: "${edge.consumerModuleId}" requires "${edge.requiredTokenId}" ` +
            `from "${edge.providerModuleId}" capability "${edge.capabilityTokenId}" ` +
            `(${edge.dependencyKind}, ${edge.capabilityKind})`
        )
    }

    return (
        `binding: "${edge.consumerModuleId}" requires "${edge.requiredTokenId}" ` +
        `through binding "${edge.bindingTokenId}" (${edge.dependencyKind}, ` +
        `${edge.bindingKind})`
    )
}

function formatDiagnosticExpectation(expectation: DiagnosticExpectation): string {
    const parts = [
        formatOptionalExpectationPart('code', expectation.code),
        formatOptionalExpectationPart('severity', expectation.severity),
        formatOptionalExpectationPart('message', expectation.message),
        formatOptionalExpectationPart('messageIncludes', expectation.messageIncludes),
        expectation.details === undefined
            ? undefined
            : `details: ${stableFormat(expectation.details)}`
    ].filter((part): part is string => {
        return part !== undefined
    })

    if (parts.length === 0) {
        return 'matching any diagnostic'
    }

    return `{ ${parts.join(', ')} }`
}

function formatExpectationParts(parts: readonly (string | undefined)[]): string {
    return parts
        .filter((part): part is string => {
            return part !== undefined
        })
        .join(', ')
}

function formatOptionalExpectationPart(
    label: string,
    value: string | number | boolean | undefined
): string | undefined {
    if (value === undefined) {
        return undefined
    }

    if (typeof value === 'string') {
        return `${label}: "${value}"`
    }

    return `${label}: ${value}`
}

function stableFormat(value: unknown): string {
    if (typeof value === 'string') {
        return JSON.stringify(value)
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value)
    }

    if (value === undefined) {
        return 'undefined'
    }

    if (value === null) {
        return 'null'
    }

    if (typeof value === 'symbol') {
        return '[symbol]'
    }

    if (typeof value === 'function') {
        return '[function]'
    }

    if (Array.isArray(value)) {
        return `[${value.map((item) => stableFormat(item)).join(', ')}]`
    }

    if (isRecord(value)) {
        const entries = Object.keys(value)
            .sort()
            .map((key) => {
                return `${JSON.stringify(key)}: ${stableFormat(value[key])}`
            })

        return `{ ${entries.join(', ')} }`
    }

    return '[object]'
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export { createTestOverride as override }
