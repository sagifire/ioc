import {
    createComposer,
    defineModule,
    type ComposedRuntime,
    type Composer,
    type ComposerAsyncBindingFactory,
    type ComposerBindingFactory,
    type ComposerInspection,
    type ModuleCapabilityDefinition,
    type ModuleDefinition,
    type ModuleDefinitionInput,
    type ModuleDependencyDefinition,
    type ModuleDependencyDefinitionInput,
    type ModuleGraph,
    type PreparedComposition
} from './composer'
import type { ClassConstructor } from './container'
import type { DiagnosticReport } from './diagnostics'
import type { Token } from './tokens'

export type ModuleDslDefinitionInput<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinition[] = readonly ModuleCapabilityDefinition[]
> = ModuleDefinitionInput<TMetadata, TRequires, TProvides>

export type ModuleDslDefinitionOptions<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinition[] = readonly ModuleCapabilityDefinition[]
> = Omit<ModuleDslDefinitionInput<TMetadata, TRequires, TProvides>, 'id'>

type NormalizedModuleDslDependencies<
    TRequires extends readonly ModuleDependencyDefinitionInput[]
> = {
    readonly [TIndex in keyof TRequires]: TRequires[TIndex] extends ModuleDependencyDefinitionInput<
        infer TValue
    >
        ? ModuleDependencyDefinition<TValue>
        : never
}

type NormalizedModuleDslCapabilities<
    TProvides extends readonly ModuleCapabilityDefinition[]
> = {
    readonly [TIndex in keyof TProvides]: TProvides[TIndex] extends ModuleCapabilityDefinition<
        infer TValue
    >
        ? ModuleCapabilityDefinition<TValue>
        : never
}

export type ModuleDslDefinition<
    TMetadata = unknown,
    TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    TProvides extends readonly ModuleCapabilityDefinition[] = readonly ModuleCapabilityDefinition[]
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

export interface AppDslValueBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly useValue: TValue
}

export interface AppDslFactoryBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly useFactory: ComposerBindingFactory<TValue>
}

export interface AppDslClassBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly useClass: ClassConstructor<TValue>
}

export interface AppDslAsyncFactoryBindingDefinition<TValue = unknown> {
    readonly token: Token<TValue>
    readonly useAsyncFactory: ComposerAsyncBindingFactory<TValue>
}

export interface BindDslBuilder<TValue> {
    toValue(value: TValue): AppDslValueBindingDefinition<TValue>
    toFactory(factory: ComposerBindingFactory<TValue>): AppDslFactoryBindingDefinition<TValue>
    toClass(classConstructor: ClassConstructor<TValue>): AppDslClassBindingDefinition<TValue>
    toAsyncFactory(
        factory: ComposerAsyncBindingFactory<TValue>
    ): AppDslAsyncFactoryBindingDefinition<TValue>
}

export interface AppDslDefinitionInput<
    TModules extends readonly ModuleDefinition[] = readonly ModuleDefinition[],
    TBindings extends readonly AppDslBindingDefinition[] = readonly AppDslBindingDefinition[]
> {
    readonly modules: TModules
    readonly bindings?: TBindings
}

export interface AppDslDefinition<
    TModules extends readonly ModuleDefinition[] = readonly ModuleDefinition[],
    TBindings extends readonly AppDslBindingDefinition[] = readonly AppDslBindingDefinition[]
> {
    readonly modules: TModules
    readonly bindings: TBindings
    createComposer(): Composer
    validate(): DiagnosticReport
    inspect(): ComposerInspection
    getGraph(): ModuleGraph
    prepare(): Promise<PreparedComposition>
    compose(): Promise<ComposedRuntime>
}

function createModuleDsl<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly ModuleCapabilityDefinition[] = readonly ModuleCapabilityDefinition[]
>(
    definition: ModuleDslDefinitionInput<TMetadata, TRequires, TProvides>
): ModuleDslDefinition<TMetadata, TRequires, TProvides>
function createModuleDsl<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly ModuleCapabilityDefinition[] = readonly ModuleCapabilityDefinition[]
>(
    id: string,
    definition: ModuleDslDefinitionOptions<TMetadata, TRequires, TProvides>
): ModuleDslDefinition<TMetadata, TRequires, TProvides>
function createModuleDsl<
    TMetadata = unknown,
    const TRequires extends readonly ModuleDependencyDefinitionInput[] = readonly ModuleDependencyDefinitionInput[],
    const TProvides extends readonly ModuleCapabilityDefinition[] = readonly ModuleCapabilityDefinition[]
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
>(
    definition: AppDslDefinitionInput<TModules, TBindings>
): AppDslDefinition<TModules, TBindings> {
    const modules = Object.freeze([...definition.modules]) as unknown as TModules
    const bindings = Object.freeze([...(definition.bindings ?? [])]) as unknown as TBindings

    const createConfiguredComposer = (): Composer => {
        const composer = createComposer()

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

        toFactory(factory: ComposerBindingFactory<TValue>): AppDslFactoryBindingDefinition<TValue> {
            return Object.freeze({
                token: bindingToken,
                useFactory: factory
            })
        },

        toClass(classConstructor: ClassConstructor<TValue>): AppDslClassBindingDefinition<TValue> {
            return Object.freeze({
                token: bindingToken,
                useClass: classConstructor
            })
        },

        toAsyncFactory(
            factory: ComposerAsyncBindingFactory<TValue>
        ): AppDslAsyncFactoryBindingDefinition<TValue> {
            return Object.freeze({
                token: bindingToken,
                useAsyncFactory: factory
            })
        }
    })
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

function applyAppDslBinding(composer: Composer, binding: AppDslBindingDefinition): void {
    const builder = composer.bind(binding.token)

    if ('useValue' in binding) {
        builder.toValue(binding.useValue)

        return
    }

    if ('useFactory' in binding) {
        builder.toFactory(binding.useFactory)

        return
    }

    if ('useClass' in binding) {
        builder.toClass(binding.useClass)

        return
    }

    builder.toAsyncFactory(binding.useAsyncFactory)
}

export { adaptDsl as adapt }
export { createBindDsl as bind }
export { createModuleDsl as module }
export { defineAppDsl as defineApp }
