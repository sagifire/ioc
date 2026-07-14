import {
    createComposer,
    defineModule,
    type ComposedRuntime,
    type Composer,
    type ComposerAdapterFactory,
    type ComposerAdapterResolvedSource,
    type ComposerAdapterSource,
    type ComposerAsyncBindingFactory,
    type ComposerAsyncResourceFactory,
    type ComposerBindingFactory,
    type ComposerInspection,
    type ComposerOptions,
    type ModuleCardinality,
    type ModuleCapabilityDefinition,
    type ModuleCapabilityDefinitionInput,
    type ModuleDefinition,
    type ModuleDefinitionInput,
    type ModuleDependencyDefinition,
    type ModuleDependencyDefinitionInput,
    type ModuleGraph,
    type PreparedComposition
} from './composer'
import type {
    AsyncFactoryBinding,
    AsyncProviderInitializationMode,
    AsyncResourceBinding,
    ClassConstructor,
    LifetimeBinding,
    ProviderLifetime
} from './container'
import type { DiagnosticReport } from './diagnostics'
import type { ProviderDependencyOptions } from './provider-metadata'
import type { Token } from './tokens'

export type ModuleDslDefinitionInput<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinitionInput[] =
        readonly ModuleCapabilityDefinitionInput[]
> = ModuleDefinitionInput<TMetadata, TRequires, TProvides>

export type ModuleDslDefinitionOptions<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinitionInput[] =
        readonly ModuleCapabilityDefinitionInput[]
> = Omit<ModuleDslDefinitionInput<TMetadata, TRequires, TProvides>, 'id'>

type NormalizedModuleDslDependencies<TRequires extends readonly ModuleDependencyDefinitionInput[]> =
    {
        readonly [
            TIndex in keyof TRequires
        ]: TRequires[TIndex] extends ModuleDependencyDefinitionInput<infer TValue>
            ? ModuleDependencyDefinition<TValue> & {
                  readonly cardinality: ModuleCardinality
              }
            : never
    }

type NormalizedModuleDslCapabilities<TProvides extends readonly ModuleCapabilityDefinitionInput[]> =
    {
        readonly [
            TIndex in keyof TProvides
        ]: TProvides[TIndex] extends ModuleCapabilityDefinitionInput<infer TValue>
            ? ModuleCapabilityDefinition<TValue> & {
                  readonly cardinality: ModuleCardinality
              }
            : never
    }

export type ModuleDslDefinition<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinitionInput[] =
        readonly ModuleCapabilityDefinitionInput[]
> = ModuleDefinition<
    TMetadata,
    NormalizedModuleDslDependencies<TRequires>,
    NormalizedModuleDslCapabilities<TProvides>
>

export type AppDslBindingDefinition<TValue = unknown> =
    | AppDslValueBindingDefinition<TValue>
    | AppDslFactoryBindingDefinition<TValue>
    | AppDslClassBindingDefinition<TValue>
    | AppDslAsyncFactoryBindingDefinition<TValue>
    | AppDslMultiValueBindingDefinition<TValue>
    | AppDslMultiFactoryBindingDefinition<TValue>
    | AppDslMultiAsyncFactoryBindingDefinition<TValue>
    | AppDslMultiAsyncResourceBindingDefinition<TValue>
    | AppDslAdapterBindingDefinition<TValue>

export interface AppDslValueBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly useValue: TValue
}

export interface AppDslFactoryBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly useFactory: ComposerBindingFactory<TValue>
    readonly options?: ProviderDependencyOptions
}

export interface AppDslClassBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly useClass: ClassConstructor<TValue>
}

export interface AppDslAsyncFactoryBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly useAsyncFactory: ComposerAsyncBindingFactory<TValue>
    readonly options?: ProviderDependencyOptions
}

export interface AppDslMultiValueBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly addValue: TValue
}

export interface AppDslMultiFactoryBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly addFactory: ComposerBindingFactory<TValue>
    readonly options?: ProviderDependencyOptions
    readonly lifetime: ProviderLifetime | undefined
    singleton(): AppDslMultiFactoryBindingDefinition<TValue>
    transient(): AppDslMultiFactoryBindingDefinition<TValue>
    scoped(): AppDslMultiFactoryBindingDefinition<TValue>
}

export interface AppDslMultiAsyncFactoryBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly addAsyncFactory: ComposerAsyncBindingFactory<TValue>
    readonly options?: ProviderDependencyOptions
    readonly lifetime: ProviderLifetime | undefined
    readonly initialization: AsyncProviderInitializationMode | undefined
    singleton(): AppDslMultiAsyncFactoryBindingDefinition<TValue>
    transient(): AppDslMultiAsyncFactoryBindingDefinition<TValue>
    scoped(): AppDslMultiAsyncFactoryBindingDefinition<TValue>
    eager(): AppDslMultiAsyncFactoryBindingDefinition<TValue>
    lazy(): AppDslMultiAsyncFactoryBindingDefinition<TValue>
}

export interface AppDslMultiAsyncResourceBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly addAsyncResource: ComposerAsyncResourceFactory<TValue>
    readonly options?: ProviderDependencyOptions
    readonly lifetime: Exclude<ProviderLifetime, 'transient'> | undefined
    readonly initialization: AsyncProviderInitializationMode | undefined
    singleton(): AppDslMultiAsyncResourceBindingDefinition<TValue>
    scoped(): AppDslMultiAsyncResourceBindingDefinition<TValue>
    eager(): AppDslMultiAsyncResourceBindingDefinition<TValue>
    lazy(): AppDslMultiAsyncResourceBindingDefinition<TValue>
}

export interface AppDslAdapterBindingDefinition<
    TValue = unknown,
    TSource extends ComposerAdapterSource = ComposerAdapterSource
> {
    readonly token: Token<TValue>
    readonly source: TSource
    useAdapter(source: ComposerAdapterResolvedSource<TSource>): TValue
}

export interface BindDslBuilder<TValue> {
    toValue(value: TValue): AppDslValueBindingDefinition<TValue>
    toFactory(
        factory: ComposerBindingFactory<TValue>,
        options?: ProviderDependencyOptions
    ): AppDslFactoryBindingDefinition<TValue>
    toClass(classConstructor: ClassConstructor<TValue>): AppDslClassBindingDefinition<TValue>
    toAsyncFactory(
        factory: ComposerAsyncBindingFactory<TValue>,
        options?: ProviderDependencyOptions
    ): AppDslAsyncFactoryBindingDefinition<TValue>
}

export interface AddDslBuilder<TValue> {
    toValue(value: TValue): AppDslMultiValueBindingDefinition<TValue>
    toFactory(
        factory: ComposerBindingFactory<TValue>,
        options?: ProviderDependencyOptions
    ): AppDslMultiFactoryBindingDefinition<TValue>
    toAsyncFactory(
        factory: ComposerAsyncBindingFactory<TValue>,
        options?: ProviderDependencyOptions
    ): AppDslMultiAsyncFactoryBindingDefinition<TValue>
    toAsyncResource(
        factory: ComposerAsyncResourceFactory<TValue>,
        options?: ProviderDependencyOptions
    ): AppDslMultiAsyncResourceBindingDefinition<TValue>
}

export interface AdapterDslBuilder<TValue> {
    from<const TSource extends ComposerAdapterSource>(
        source: TSource
    ): AdapterUsingDslBuilder<TValue, TSource>
}

export interface AdapterUsingDslBuilder<TValue, TSource extends ComposerAdapterSource> {
    using(
        factory: ComposerAdapterFactory<TSource, TValue>
    ): AppDslAdapterBindingDefinition<TValue, TSource>
}

export interface AppDslDefinitionInput<
    TModules extends readonly ModuleDefinition[] = readonly ModuleDefinition[],
    TBindings extends readonly AppDslBindingDefinition[] = readonly AppDslBindingDefinition[]
> {
    readonly modules: TModules
    readonly bindings?: TBindings
    readonly options?: ComposerOptions
}

export interface AppDslDefinition<
    TModules extends readonly ModuleDefinition[] = readonly ModuleDefinition[],
    TBindings extends readonly AppDslBindingDefinition[] = readonly AppDslBindingDefinition[]
> {
    readonly modules: TModules
    readonly bindings: TBindings
    readonly options?: ComposerOptions
    createComposer(): Composer
    validate(): DiagnosticReport
    inspect(): ComposerInspection
    getGraph(): ModuleGraph
    prepare(): Promise<PreparedComposition>
    compose(): Promise<ComposedRuntime>
}

function createModuleDsl<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly ModuleCapabilityDefinitionInput[] =
        readonly ModuleCapabilityDefinitionInput[]
>(
    definition: ModuleDslDefinitionInput<TMetadata, TRequires, TProvides>
): ModuleDslDefinition<TMetadata, TRequires, TProvides>
function createModuleDsl<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly ModuleCapabilityDefinitionInput[] =
        readonly ModuleCapabilityDefinitionInput[]
>(
    id: string,
    definition: ModuleDslDefinitionOptions<TMetadata, TRequires, TProvides>
): ModuleDslDefinition<TMetadata, TRequires, TProvides>
function createModuleDsl<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] =
        readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly ModuleCapabilityDefinitionInput[] =
        readonly ModuleCapabilityDefinitionInput[]
>(
    idOrDefinition: string | ModuleDslDefinitionInput<TMetadata, TRequires, TProvides>,
    definition?: ModuleDslDefinitionOptions<TMetadata, TRequires, TProvides>
): ModuleDslDefinition<TMetadata, TRequires, TProvides> {
    const moduleDefinition =
        typeof idOrDefinition === 'string'
            ? ({
                  ...definition,
                  id: idOrDefinition
              } as ModuleDslDefinitionInput<TMetadata, TRequires, TProvides>)
            : idOrDefinition

    return defineModule(moduleDefinition)
}

function defineAppDsl<
    const TModules extends readonly ModuleDefinition[] = readonly ModuleDefinition[],
    const TBindings extends readonly AppDslBindingDefinition[] = readonly AppDslBindingDefinition[]
>(definition: AppDslDefinitionInput<TModules, TBindings>): AppDslDefinition<TModules, TBindings> {
    const modules = Object.freeze([...definition.modules]) as unknown as TModules
    const bindings = Object.freeze([...(definition.bindings ?? [])]) as unknown as TBindings
    const options =
        definition.options === undefined ? undefined : Object.freeze({ ...definition.options })

    const createConfiguredComposer = (): Composer => {
        const composer = createComposer(options)

        for (const moduleDefinition of modules) {
            composer.use(moduleDefinition)
        }

        for (const binding of bindings) {
            applyAppDslBinding(composer, binding)
        }

        return composer
    }

    return Object.freeze({
        modules,
        bindings,
        ...(options === undefined ? {} : { options }),

        createComposer(): Composer {
            return createConfiguredComposer()
        },

        validate(): DiagnosticReport {
            return createConfiguredComposer().validate()
        },

        inspect(): ComposerInspection {
            return createConfiguredComposer().inspect()
        },

        getGraph(): ModuleGraph {
            return createConfiguredComposer().getGraph()
        },

        prepare(): Promise<PreparedComposition> {
            return createConfiguredComposer().prepare()
        },

        compose(): Promise<ComposedRuntime> {
            return createConfiguredComposer().compose()
        }
    })
}

function createBindDsl<TValue>(bindingToken: Token<TValue>): BindDslBuilder<TValue> {
    return Object.freeze({
        toValue(value: TValue): AppDslValueBindingDefinition<TValue> {
            return Object.freeze({
                token: bindingToken,
                useValue: value
            })
        },

        toFactory(
            factory: ComposerBindingFactory<TValue>,
            options?: ProviderDependencyOptions
        ): AppDslFactoryBindingDefinition<TValue> {
            return Object.freeze({
                token: bindingToken,
                useFactory: factory,
                ...(options === undefined ? {} : { options })
            })
        },

        toClass(classConstructor: ClassConstructor<TValue>): AppDslClassBindingDefinition<TValue> {
            return Object.freeze({
                token: bindingToken,
                useClass: classConstructor
            })
        },

        toAsyncFactory(
            factory: ComposerAsyncBindingFactory<TValue>,
            options?: ProviderDependencyOptions
        ): AppDslAsyncFactoryBindingDefinition<TValue> {
            return Object.freeze({
                token: bindingToken,
                useAsyncFactory: factory,
                ...(options === undefined ? {} : { options })
            })
        }
    })
}

function createAddDsl<TValue>(bindingToken: Token<TValue>): AddDslBuilder<TValue> {
    return Object.freeze({
        toValue(value: TValue): AppDslMultiValueBindingDefinition<TValue> {
            return Object.freeze({
                token: bindingToken,
                addValue: value
            })
        },

        toFactory(
            factory: ComposerBindingFactory<TValue>,
            options?: ProviderDependencyOptions
        ): AppDslMultiFactoryBindingDefinition<TValue> {
            return createAppDslMultiFactoryBinding(bindingToken, factory, options)
        },

        toAsyncFactory(
            factory: ComposerAsyncBindingFactory<TValue>,
            options?: ProviderDependencyOptions
        ): AppDslMultiAsyncFactoryBindingDefinition<TValue> {
            return createAppDslMultiAsyncFactoryBinding(bindingToken, factory, options)
        },

        toAsyncResource(
            factory: ComposerAsyncResourceFactory<TValue>,
            options?: ProviderDependencyOptions
        ): AppDslMultiAsyncResourceBindingDefinition<TValue> {
            return createAppDslMultiAsyncResourceBinding(bindingToken, factory, options)
        }
    })
}

function createAppDslMultiFactoryBinding<TValue>(
    bindingToken: Token<TValue>,
    factory: ComposerBindingFactory<TValue>,
    options?: ProviderDependencyOptions
): AppDslMultiFactoryBindingDefinition<TValue> {
    let lifetime: ProviderLifetime | undefined
    const binding: AppDslMultiFactoryBindingDefinition<TValue> = {
        token: bindingToken,
        addFactory: factory,
        ...(options === undefined ? {} : { options }),

        get lifetime(): ProviderLifetime | undefined {
            return lifetime
        },

        singleton(): AppDslMultiFactoryBindingDefinition<TValue> {
            lifetime = 'singleton'

            return this
        },

        transient(): AppDslMultiFactoryBindingDefinition<TValue> {
            lifetime = 'transient'

            return this
        },

        scoped(): AppDslMultiFactoryBindingDefinition<TValue> {
            lifetime = 'scoped'

            return this
        }
    }

    return Object.freeze(binding)
}

function createAppDslMultiAsyncFactoryBinding<TValue>(
    bindingToken: Token<TValue>,
    factory: ComposerAsyncBindingFactory<TValue>,
    options?: ProviderDependencyOptions
): AppDslMultiAsyncFactoryBindingDefinition<TValue> {
    let lifetime: ProviderLifetime | undefined
    let initialization: AsyncProviderInitializationMode | undefined
    const binding: AppDslMultiAsyncFactoryBindingDefinition<TValue> = {
        token: bindingToken,
        addAsyncFactory: factory,
        ...(options === undefined ? {} : { options }),

        get lifetime(): ProviderLifetime | undefined {
            return lifetime
        },

        get initialization(): AsyncProviderInitializationMode | undefined {
            return initialization
        },

        singleton(): AppDslMultiAsyncFactoryBindingDefinition<TValue> {
            lifetime = 'singleton'

            return this
        },

        transient(): AppDslMultiAsyncFactoryBindingDefinition<TValue> {
            lifetime = 'transient'

            return this
        },

        scoped(): AppDslMultiAsyncFactoryBindingDefinition<TValue> {
            lifetime = 'scoped'

            return this
        },

        eager(): AppDslMultiAsyncFactoryBindingDefinition<TValue> {
            initialization = 'eager'

            return this
        },

        lazy(): AppDslMultiAsyncFactoryBindingDefinition<TValue> {
            initialization = 'lazy'

            return this
        }
    }

    return Object.freeze(binding)
}

function createAppDslMultiAsyncResourceBinding<TValue>(
    bindingToken: Token<TValue>,
    factory: ComposerAsyncResourceFactory<TValue>,
    options?: ProviderDependencyOptions
): AppDslMultiAsyncResourceBindingDefinition<TValue> {
    let lifetime: Exclude<ProviderLifetime, 'transient'> | undefined
    let initialization: AsyncProviderInitializationMode | undefined
    const binding: AppDslMultiAsyncResourceBindingDefinition<TValue> = {
        token: bindingToken,
        addAsyncResource: factory,
        ...(options === undefined ? {} : { options }),

        get lifetime(): Exclude<ProviderLifetime, 'transient'> | undefined {
            return lifetime
        },

        get initialization(): AsyncProviderInitializationMode | undefined {
            return initialization
        },

        singleton(): AppDslMultiAsyncResourceBindingDefinition<TValue> {
            lifetime = 'singleton'

            return this
        },

        scoped(): AppDslMultiAsyncResourceBindingDefinition<TValue> {
            lifetime = 'scoped'

            return this
        },

        eager(): AppDslMultiAsyncResourceBindingDefinition<TValue> {
            initialization = 'eager'

            return this
        },

        lazy(): AppDslMultiAsyncResourceBindingDefinition<TValue> {
            initialization = 'lazy'

            return this
        }
    }

    return Object.freeze(binding)
}

function adaptDsl<TValue>(
    bindingToken: Token<TValue>,
    factory: ComposerBindingFactory<TValue>
): AppDslFactoryBindingDefinition<TValue> {
    return Object.freeze({
        token: bindingToken,
        useFactory: factory
    })
}

function createAdapterDsl<TValue>(bindingToken: Token<TValue>): AdapterDslBuilder<TValue> {
    return Object.freeze({
        from<const TSource extends ComposerAdapterSource>(
            source: TSource
        ): AdapterUsingDslBuilder<TValue, TSource> {
            return Object.freeze({
                using(
                    factory: ComposerAdapterFactory<TSource, TValue>
                ): AppDslAdapterBindingDefinition<TValue, TSource> {
                    return Object.freeze({
                        token: bindingToken,
                        source,
                        useAdapter: factory
                    })
                }
            })
        }
    })
}

function applyAppDslBinding(composer: Composer, binding: AppDslBindingDefinition): void {
    if ('addValue' in binding) {
        composer.add(binding.token).toValue(binding.addValue)

        return
    }

    if ('addFactory' in binding) {
        const lifetimeBinding = composer
            .add(binding.token)
            .toFactory(binding.addFactory, binding.options)

        applyAppDslProviderLifetime(lifetimeBinding, binding.lifetime)

        return
    }

    if ('addAsyncFactory' in binding) {
        const asyncBinding = composer
            .add(binding.token)
            .toAsyncFactory(binding.addAsyncFactory, binding.options)

        applyAppDslAsyncFactoryOptions(asyncBinding, binding.lifetime, binding.initialization)

        return
    }

    if ('addAsyncResource' in binding) {
        const resourceBinding = composer
            .add(binding.token)
            .toAsyncResource(binding.addAsyncResource, binding.options)

        applyAppDslAsyncResourceOptions(resourceBinding, binding.lifetime, binding.initialization)

        return
    }

    if ('useAdapter' in binding) {
        applyAppDslAdapterBinding(composer, binding)

        return
    }

    const builder = composer.bind(binding.token)

    if ('useValue' in binding) {
        builder.toValue(binding.useValue)

        return
    }

    if ('useFactory' in binding) {
        builder.toFactory(binding.useFactory, binding.options)

        return
    }

    if ('useClass' in binding) {
        builder.toClass(binding.useClass)

        return
    }

    builder.toAsyncFactory(binding.useAsyncFactory, binding.options)
}

function applyAppDslAsyncFactoryOptions(
    binding: AsyncFactoryBinding,
    lifetime: ProviderLifetime | undefined,
    initialization: AsyncProviderInitializationMode | undefined
): void {
    if (lifetime === 'singleton') {
        binding.singleton()
    } else if (lifetime === 'scoped') {
        binding.scoped()
    } else if (lifetime === 'transient') {
        binding.transient()
    }

    if (initialization === 'eager') {
        binding.eager()
    } else if (initialization === 'lazy') {
        binding.lazy()
    }
}

function applyAppDslAsyncResourceOptions(
    binding: AsyncResourceBinding,
    lifetime: Exclude<ProviderLifetime, 'transient'> | undefined,
    initialization: AsyncProviderInitializationMode | undefined
): void {
    if (lifetime === 'singleton') {
        binding.singleton()
    } else if (lifetime === 'scoped') {
        binding.scoped()
    }

    if (initialization === 'eager') {
        binding.eager()
    } else if (initialization === 'lazy') {
        binding.lazy()
    }
}

function applyAppDslAdapterBinding<TValue, TSource extends ComposerAdapterSource>(
    composer: Composer,
    binding: AppDslAdapterBindingDefinition<TValue, TSource>
): void {
    composer.adapt(binding.token).from(binding.source).using(binding.useAdapter)
}

function applyAppDslProviderLifetime(
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

export { adaptDsl as adapt }
export { createAdapterDsl as adapter }
export { createAddDsl as add }
export { createBindDsl as bind }
export { createModuleDsl as module }
export { defineAppDsl as defineApp }
