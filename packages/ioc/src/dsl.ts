import {
    defineModule,
    type ModuleCapabilityDefinition,
    type ModuleDefinition,
    type ModuleDefinitionInput,
    type ModuleDependencyDefinition,
    type ModuleDependencyDefinitionInput
} from './composer'

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

export { createModuleDsl as module }
