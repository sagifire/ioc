import {
    SagifireIocError,
    defineModule,
    createComposer,
    createContainer,
    type AsyncProviderFactory,
    type ClassConstructor,
    type ComposedRuntime,
    type Composer,
    type ComposerInspection,
    type ContainerBuilder,
    type ContainerRuntime,
    type DiagnosticReport,
    type ModuleCapabilityDefinition,
    type ModuleCapabilityKind,
    type ModuleDependencyDefinition,
    type ModuleDependencyDefinitionInput,
    type ModuleDefinition,
    type ModuleDefinitionInput,
    type ModuleGraph,
    type ModuleSetupContext,
    type PreparedComposition,
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

export interface FakeModuleValueProvider<TValue = unknown>
    extends FakeModuleProviderBase<TValue> {
    readonly useValue: TValue
}

export interface FakeModuleFactoryProvider<TValue = unknown>
    extends FakeModuleProviderBase<TValue> {
    readonly useFactory: SyncProviderFactory<TValue>
}

export interface FakeModuleAsyncFactoryProvider<TValue = unknown>
    extends FakeModuleProviderBase<TValue> {
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

type NormalizedFakeModuleCapabilities<
    TProvides extends readonly FakeModuleProvider[]
> = {
    readonly [TIndex in keyof TProvides]: TProvides[TIndex] extends FakeModuleProvider<
        infer TValue
    >
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
    TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
> {
    readonly version?: string
    readonly metadata?: TMetadata
    readonly requires?: TRequires
    readonly provides?: TProvides
}

export interface FakeModuleInput<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
> extends FakeModuleOptions<TMetadata, TRequires, TProvides> {
    readonly id: string
}

export type FakeModuleDefinition<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
> = ModuleDefinition<
    TMetadata,
    NormalizedFakeModuleDependencies<TRequires>,
    NormalizedFakeModuleCapabilities<TProvides>
>

export interface CreateModuleHarnessOptions<
    TModule extends ModuleDefinition = ModuleDefinition
> {
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

export function createTestRuntime(
    configure?: TestRuntimeConfigurator
): Promise<ContainerRuntime>
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
    const TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
>(
    definition: FakeModuleInput<TMetadata, TRequires, TProvides>
): FakeModuleDefinition<TMetadata, TRequires, TProvides>
export function fakeModule<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly FakeModuleProvider[] = readonly FakeModuleProvider[]
>(
    id: string,
    definition?: FakeModuleOptions<TMetadata, TRequires, TProvides>
): FakeModuleDefinition<TMetadata, TRequires, TProvides>
export function fakeModule<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
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

export function createModuleHarness<
    TModule extends ModuleDefinition = ModuleDefinition
>(options: CreateModuleHarnessOptions<TModule>): ModuleHarness<TModule> {
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
): ModuleDefinitionInput<
    TMetadata,
    TRequires,
    NormalizedFakeModuleCapabilities<TProvides>
> {
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

function applyTestOverridesToComposer(composer: Composer, overrides: readonly TestOverride[]): void {
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

export { createTestOverride as override }
