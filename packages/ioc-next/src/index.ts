import {
    scopeMultiValue,
    scopeValue,
    type ContainerRuntime,
    type CreateScopeOptions,
    type Scope,
    type ScopeLocalValue,
    type ScopeLocalValueObject,
    type Token
} from '@sagifire/ioc'

type Awaitable<TValue> = TValue | Promise<TValue>

interface RuntimeCacheEntry<TRuntime> {
    readonly runtime: TRuntime
}

export type NextRequestContextValue<TValue = unknown> = ScopeLocalValueObject<TValue>

export interface NextRequestContextOptions {
    readonly values?: readonly ScopeLocalValue[]
    readonly multiValues?: readonly ScopeLocalValue[]
}

export interface NextRequestContext {
    readonly values: readonly NextRequestContextValue[]
    readonly multiValues: readonly NextRequestContextValue[]
    toScopeOptions(): CreateScopeOptions
}

export type NextRuntimeFactory<TRuntime extends ContainerRuntime = ContainerRuntime> =
    () => Awaitable<TRuntime>

export interface NextRuntimeHelper<TRuntime extends ContainerRuntime = ContainerRuntime> {
    getRuntime(): Promise<TRuntime>
    reset(): void
}

export interface RouteHandlerScopeOptions<TRequest, TRouteContext> {
    readonly request: TRequest
    readonly context: TRouteContext
    readonly requestContext?: NextRequestContext
}

export interface RouteHandlerScopeContext<
    TRuntime extends ContainerRuntime,
    TRequest,
    TRouteContext
> {
    readonly runtime: TRuntime
    readonly scope: Scope
    readonly request: TRequest
    readonly context: TRouteContext
    readonly requestContext: NextRequestContext | undefined
}

export type RouteHandlerScopeCallback<
    TRuntime extends ContainerRuntime,
    TRequest,
    TRouteContext,
    TResult
> = (context: RouteHandlerScopeContext<TRuntime, TRequest, TRouteContext>) => Awaitable<TResult>

export interface ServerActionScopeOptions<TActionContext> {
    readonly context: TActionContext
    readonly actionContext?: NextRequestContext
}

export type ServerActionScopeOptionsFactory<
    TArguments extends readonly unknown[],
    TActionContext
> = (...args: TArguments) => Awaitable<ServerActionScopeOptions<TActionContext>>

export type ServerActionScopeSetup<TArguments extends readonly unknown[], TActionContext> =
    | ServerActionScopeOptions<TActionContext>
    | ServerActionScopeOptionsFactory<TArguments, TActionContext>

export interface ServerActionScopeContext<TRuntime extends ContainerRuntime, TActionContext> {
    readonly runtime: TRuntime
    readonly scope: Scope
    readonly context: TActionContext
    readonly actionContext: NextRequestContext | undefined
}

export type ServerActionScopeCallback<
    TRuntime extends ContainerRuntime,
    TActionContext,
    TArguments extends readonly unknown[],
    TResult
> = (
    context: ServerActionScopeContext<TRuntime, TActionContext>,
    ...args: TArguments
) => Awaitable<TResult>

export function createNextRuntime<TRuntime extends ContainerRuntime>(
    factory: NextRuntimeFactory<TRuntime>
): NextRuntimeHelper<TRuntime> {
    let cache: RuntimeCacheEntry<TRuntime> | undefined
    let inFlight: Promise<TRuntime> | undefined
    let generation = 0

    async function initializeRuntime(initializationGeneration: number): Promise<TRuntime> {
        const runtime = await factory()

        if (generation === initializationGeneration) {
            cache = Object.freeze({
                runtime
            })
        }

        return runtime
    }

    return Object.freeze({
        getRuntime(): Promise<TRuntime> {
            if (cache !== undefined) {
                return Promise.resolve(cache.runtime)
            }

            if (inFlight !== undefined) {
                return inFlight
            }

            const initializationGeneration = generation
            const initialization = initializeRuntime(initializationGeneration).finally(() => {
                if (inFlight === initialization) {
                    inFlight = undefined
                }
            })

            inFlight = initialization

            return initialization
        },

        reset(): void {
            generation += 1
            cache = undefined
            inFlight = undefined
        }
    })
}

export async function withRouteScope<
    TRuntime extends ContainerRuntime,
    TRequest,
    TRouteContext,
    TResult
>(
    runtimeHelper: NextRuntimeHelper<TRuntime>,
    options: RouteHandlerScopeOptions<TRequest, TRouteContext>,
    callback: RouteHandlerScopeCallback<TRuntime, TRequest, TRouteContext, TResult>
): Promise<Awaited<TResult>> {
    const runtime = await runtimeHelper.getRuntime()
    const requestContext = options.requestContext
    const scopeOptions = requestContext?.toScopeOptions()
    const scope =
        scopeOptions === undefined ? runtime.createScope() : runtime.createScope(scopeOptions)

    try {
        return await callback({
            runtime,
            scope,
            request: options.request,
            context: options.context,
            requestContext
        })
    } finally {
        await scope.dispose()
    }
}

export function withServerActionScope<
    TRuntime extends ContainerRuntime,
    TActionContext,
    TArguments extends readonly unknown[],
    TResult
>(
    runtimeHelper: NextRuntimeHelper<TRuntime>,
    setup: ServerActionScopeSetup<TArguments, TActionContext>,
    callback: ServerActionScopeCallback<TRuntime, TActionContext, TArguments, TResult>
): (...args: TArguments) => Promise<Awaited<TResult>> {
    return async (...args: TArguments): Promise<Awaited<TResult>> => {
        const runtime = await runtimeHelper.getRuntime()
        const options = await resolveServerActionScopeOptions(setup, args)
        const actionContext = options.actionContext
        const scopeOptions = actionContext?.toScopeOptions()
        const scope =
            scopeOptions === undefined ? runtime.createScope() : runtime.createScope(scopeOptions)

        try {
            return await callback(
                {
                    runtime,
                    scope,
                    context: options.context,
                    actionContext
                },
                ...args
            )
        } finally {
            await scope.dispose()
        }
    }
}

export function createNextRequestContext(
    options: NextRequestContextOptions = {}
): NextRequestContext {
    const values = Object.freeze((options.values ?? []).map(normalizeSingleRequestValue))
    const multiValues = Object.freeze((options.multiValues ?? []).map(normalizeMultiRequestValue))
    const scopeOptions: CreateScopeOptions = Object.freeze({
        values,
        multiValues
    })

    return Object.freeze({
        values,
        multiValues,
        toScopeOptions(): CreateScopeOptions {
            return scopeOptions
        }
    })
}

export function nextRequestValue<TValue>(
    valueToken: Token<TValue>,
    value: TValue
): NextRequestContextValue<TValue> {
    return scopeValue(valueToken, value)
}

export function nextRequestMultiValue<TValue>(
    valueToken: Token<TValue>,
    value: TValue
): NextRequestContextValue<TValue> {
    return scopeMultiValue(valueToken, value)
}

function normalizeSingleRequestValue(entry: ScopeLocalValue): NextRequestContextValue {
    if (isScopeLocalTuple(entry)) {
        const [valueToken, value] = entry

        return scopeValue(valueToken, value)
    }

    return scopeValue(entry.token, entry.value)
}

function normalizeMultiRequestValue(entry: ScopeLocalValue): NextRequestContextValue {
    if (isScopeLocalTuple(entry)) {
        const [valueToken, value] = entry

        return scopeMultiValue(valueToken, value)
    }

    return scopeMultiValue(entry.token, entry.value)
}

function isScopeLocalTuple(
    entry: ScopeLocalValue
): entry is readonly [token: Token<unknown>, value: unknown] {
    return Array.isArray(entry)
}

async function resolveServerActionScopeOptions<
    TArguments extends readonly unknown[],
    TActionContext
>(
    setup: ServerActionScopeSetup<TArguments, TActionContext>,
    args: TArguments
): Promise<ServerActionScopeOptions<TActionContext>> {
    if (typeof setup === 'function') {
        return setup(...args)
    }

    return setup
}
