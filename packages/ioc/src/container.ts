import type { Resource, ResourceDisposer } from './lifecycle'
import type { Token } from './tokens'
import { DuplicateScopeLocalValueError, InvalidScopeError, ScopeDisposedError } from './context'
import type { CreateScopeOptions, Scope, ScopeCallback, ScopeLocalValue } from './context'
import { SagifireIocError } from './diagnostics'

export {
    DuplicateScopeLocalValueError,
    InvalidScopeError,
    ScopeDisposedError,
    scopeMultiValue,
    scopeValue
} from './context'
export type {
    CreateScopeOptions,
    InvalidScopeReason,
    Scope,
    ScopeCallback,
    ScopeLocalValue,
    ScopeLocalValueObject
} from './context'
export type { Resource, ResourceDisposer } from './lifecycle'

export type ProviderLifetime = 'singleton' | 'transient' | 'scoped'

export type ProviderRegistrationKind = 'single' | 'multi'

export type AsyncProviderInitializationMode = 'lazy' | 'eager'

type Awaitable<TValue> = TValue | Promise<TValue>

export type SyncProviderFactory<TValue> = (context: ResolutionContext) => TValue

export type AsyncProviderFactory<TValue> = (context: ResolutionContext) => Awaitable<TValue>

export type AsyncResourceFactory<TValue> = (
    context: ResolutionContext
) => Awaitable<Resource<TValue>>

export type ClassConstructor<TValue> = new () => TValue

export interface ContainerBuilder {
    bind<TValue>(token: Token<TValue>): BindingBuilder<TValue>
    add<TValue>(token: Token<TValue>): MultiBindingBuilder<TValue>
    freeze(): Promise<ContainerRuntime>
}

export interface BindingBuilder<TValue> {
    toValue(value: TValue): void
    toFactory(factory: SyncProviderFactory<TValue>): LifetimeBinding
    toClass(classConstructor: ClassConstructor<TValue>): LifetimeBinding
    toAsyncFactory(factory: AsyncProviderFactory<TValue>): AsyncFactoryBinding
    toAsyncResource(factory: AsyncResourceFactory<TValue>): AsyncResourceBinding
}

export interface MultiBindingBuilder<TValue> {
    toValue(value: TValue): void
    toFactory(factory: SyncProviderFactory<TValue>): LifetimeBinding
}

export interface LifetimeBinding {
    singleton(): void
    transient(): void
    scoped(): void
}

export interface AsyncFactoryBinding {
    singleton(): AsyncFactoryBinding
    transient(): AsyncFactoryBinding
    scoped(): AsyncFactoryBinding
    eager(): AsyncFactoryBinding
    lazy(): AsyncFactoryBinding
}

export interface AsyncResourceBinding {
    singleton(): AsyncResourceBinding
    scoped(): AsyncResourceBinding
    eager(): AsyncResourceBinding
    lazy(): AsyncResourceBinding
}

export interface ContainerRuntime {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    createScope(options?: CreateScopeOptions): Scope
    withScope<TValue>(callback: ScopeCallback<TValue>): Promise<TValue>
    withScope<TValue>(options: CreateScopeOptions, callback: ScopeCallback<TValue>): Promise<TValue>
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
    dispose(): Promise<void>
}

export interface ResolutionContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined>
}

export class ProviderNotFoundError extends SagifireIocError<{
    readonly tokenId: string
}> {
    override readonly name = 'ProviderNotFoundError'
    override readonly code = 'SAGIFIRE_IOC_PROVIDER_NOT_FOUND'
    readonly tokenId: string

    constructor(tokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_PROVIDER_NOT_FOUND',
            message: `Provider not found for token "${tokenId}"`,
            details: {
                tokenId
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
    }
}

export class DuplicateProviderError extends SagifireIocError<{
    readonly tokenId: string
}> {
    override readonly name = 'DuplicateProviderError'
    override readonly code = 'SAGIFIRE_IOC_DUPLICATE_PROVIDER'
    readonly tokenId: string

    constructor(tokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_DUPLICATE_PROVIDER',
            message: `Duplicate provider for token "${tokenId}"`,
            details: {
                tokenId
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
    }
}

export class ProviderKindMismatchError extends SagifireIocError<{
    readonly tokenId: string
    readonly expectedKind: ProviderRegistrationKind
    readonly actualKind: ProviderRegistrationKind
    readonly action: string
}> {
    override readonly name = 'ProviderKindMismatchError'
    override readonly code = 'SAGIFIRE_IOC_PROVIDER_KIND_MISMATCH'
    readonly tokenId: string
    readonly expectedKind: ProviderRegistrationKind
    readonly actualKind: ProviderRegistrationKind
    readonly action: string

    constructor(
        tokenId: string,
        expectedKind: ProviderRegistrationKind,
        actualKind: ProviderRegistrationKind,
        action: string
    ) {
        super({
            code: 'SAGIFIRE_IOC_PROVIDER_KIND_MISMATCH',
            message:
                `Cannot ${action} for token "${tokenId}": expected ${expectedKind} provider ` +
                `registration but found ${actualKind} provider registration`,
            details: {
                tokenId,
                expectedKind,
                actualKind,
                action
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
        this.expectedKind = expectedKind
        this.actualKind = actualKind
        this.action = action
    }
}

export class ProviderCycleError extends SagifireIocError<{
    readonly tokenIds: readonly string[]
}> {
    override readonly name = 'ProviderCycleError'
    override readonly code = 'SAGIFIRE_IOC_PROVIDER_CYCLE'
    readonly tokenIds: readonly string[]

    constructor(tokenIds: readonly string[]) {
        super({
            code: 'SAGIFIRE_IOC_PROVIDER_CYCLE',
            message: `Provider cycle detected: ${tokenIds.join(' -> ')}`,
            details: {
                tokenIds
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenIds = tokenIds
    }
}

export class ContainerFrozenError extends SagifireIocError<{
    readonly action: string
}> {
    override readonly name = 'ContainerFrozenError'
    override readonly code = 'SAGIFIRE_IOC_CONTAINER_FROZEN'
    readonly action: string

    constructor(action: string) {
        super({
            code: 'SAGIFIRE_IOC_CONTAINER_FROZEN',
            message: `Container configuration is frozen after freeze(); cannot ${action}`,
            details: {
                action
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.action = action
    }
}

export class AsyncProviderAccessError extends SagifireIocError<{
    readonly tokenId: string
    readonly accessMethod: 'get' | 'tryGet'
}> {
    override readonly name = 'AsyncProviderAccessError'
    override readonly code = 'SAGIFIRE_IOC_ASYNC_PROVIDER_ACCESS'
    readonly tokenId: string
    readonly accessMethod: 'get' | 'tryGet'

    constructor(tokenId: string, accessMethod: 'get' | 'tryGet') {
        super({
            code: 'SAGIFIRE_IOC_ASYNC_PROVIDER_ACCESS',
            message:
                `Cannot resolve async lazy provider for token "${tokenId}" through ` +
                `${accessMethod}(); use getAsync() instead`,
            details: {
                tokenId,
                accessMethod
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
        this.accessMethod = accessMethod
    }
}

export class SyncFactoryPromiseError extends SagifireIocError<{
    readonly tokenId: string
}> {
    override readonly name = 'SyncFactoryPromiseError'
    override readonly code = 'SAGIFIRE_IOC_SYNC_FACTORY_PROMISE'
    readonly tokenId: string

    constructor(tokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_SYNC_FACTORY_PROMISE',
            message:
                `Sync factory for token "${tokenId}" returned a Promise or thenable; ` +
                'use toAsyncFactory() and getAsync() instead',
            details: {
                tokenId
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
    }
}

export class RuntimeDisposedError extends SagifireIocError<{
    readonly action: string
}> {
    override readonly name = 'RuntimeDisposedError'
    override readonly code = 'SAGIFIRE_IOC_RUNTIME_DISPOSED'
    readonly action: string

    constructor(action: string) {
        super({
            code: 'SAGIFIRE_IOC_RUNTIME_DISPOSED',
            message: `Runtime has been disposed and cannot ${action}`,
            details: {
                action
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.action = action
    }
}

export class InvalidProviderLifecycleError extends SagifireIocError<{
    readonly tokenId: string
    readonly reason: string
}> {
    override readonly name = 'InvalidProviderLifecycleError'
    override readonly code = 'SAGIFIRE_IOC_INVALID_PROVIDER_LIFECYCLE'
    readonly tokenId: string

    constructor(tokenId: string, message: string) {
        super({
            code: 'SAGIFIRE_IOC_INVALID_PROVIDER_LIFECYCLE',
            message: `Invalid provider lifecycle for token "${tokenId}": ${message}`,
            details: {
                tokenId,
                reason: message
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
    }
}

type ProviderCache<TValue> =
    | {
          readonly state: 'empty'
      }
    | {
          readonly state: 'pending'
          readonly promise: Promise<TValue>
      }
    | {
          readonly state: 'ready'
          readonly value: TValue
      }

type ProviderExecution<TValue> =
    | {
          readonly kind: 'sync'
          readonly create: SyncProviderFactory<TValue>
      }
    | {
          readonly kind: 'async-factory'
          readonly create: AsyncProviderFactory<TValue>
      }
    | {
          readonly kind: 'async-resource'
          readonly create: AsyncResourceFactory<TValue>
      }

interface ProviderRecord<TValue> {
    readonly tokenId: string
    lifetime: ProviderLifetime | undefined
    initialization: AsyncProviderInitializationMode
    cache: ProviderCache<TValue>
    readonly execution: ProviderExecution<TValue>
}

interface SingleProviderRegistration {
    readonly kind: 'single'
    readonly provider: ProviderRecord<unknown>
}

interface MultiProviderRegistration {
    readonly kind: 'multi'
    readonly providers: ProviderRecord<unknown>[]
}

type ProviderRegistration = SingleProviderRegistration | MultiProviderRegistration

interface ResourceDisposerRecord {
    readonly tokenId: string
    readonly dispose: ResourceDisposer
}

interface RuntimeState {
    disposed: boolean
    readonly singletonResourceDisposers: ResourceDisposerRecord[]
}

interface ScopeState {
    readonly localSingles: ReadonlyMap<string, unknown>
    readonly localMultis: ReadonlyMap<string, readonly unknown[]>
    readonly scopedCache: Map<ProviderRecord<unknown>, ProviderCache<unknown>>
    readonly scopedResourceDisposers: ResourceDisposerRecord[]
    disposed: boolean
}

interface NormalizedScopeLocalValue {
    readonly tokenId: string
    readonly value: unknown
}

type AssertMutable = (action: string) => void

export function createContainer(): ContainerBuilder {
    const registrations = new Map<string, ProviderRegistration>()

    let isFrozen = false
    let frozenRuntimePromise: Promise<ContainerRuntime> | undefined

    const assertMutable: AssertMutable = (action) => {
        if (isFrozen) {
            throw new ContainerFrozenError(action)
        }
    }

    const builder: ContainerBuilder = {
        bind<TValue>(bindingToken: Token<TValue>): BindingBuilder<TValue> {
            assertMutable(`bind provider for token "${bindingToken.id}"`)
            assertCanBindSingle(registrations, bindingToken.id)

            return createBindingBuilder(bindingToken.id, registrations, assertMutable)
        },

        add<TValue>(bindingToken: Token<TValue>): MultiBindingBuilder<TValue> {
            assertMutable(`add provider contribution for token "${bindingToken.id}"`)
            assertCanAddMulti(registrations, bindingToken.id)

            return createMultiBindingBuilder(bindingToken.id, registrations, assertMutable)
        },

        freeze(): Promise<ContainerRuntime> {
            if (frozenRuntimePromise !== undefined) {
                return frozenRuntimePromise
            }

            isFrozen = true
            frozenRuntimePromise = createRuntime(cloneProviderRegistrations(registrations))

            return frozenRuntimePromise
        }
    }

    return builder
}

function createBindingBuilder<TValue>(
    tokenId: string,
    registrations: Map<string, ProviderRegistration>,
    assertMutable: AssertMutable
): BindingBuilder<TValue> {
    return {
        toValue(value: TValue): void {
            assertMutable(`register value provider for token "${tokenId}"`)

            addSingleProvider(registrations, {
                tokenId,
                lifetime: 'singleton',
                initialization: 'lazy',
                cache: {
                    state: 'ready',
                    value
                },
                execution: {
                    kind: 'sync',
                    create(): TValue {
                        return value
                    }
                }
            })
        },

        toFactory(factory: SyncProviderFactory<TValue>): LifetimeBinding {
            assertMutable(`register factory provider for token "${tokenId}"`)

            const provider: ProviderRecord<TValue> = {
                tokenId,
                lifetime: 'transient',
                initialization: 'lazy',
                cache: {
                    state: 'empty'
                },
                execution: {
                    kind: 'sync',
                    create(context): TValue {
                        return assertSyncFactoryResult(tokenId, factory(context))
                    }
                }
            }

            addSingleProvider(registrations, provider)

            return createLifetimeBinding(tokenId, provider, assertMutable)
        },

        toClass(classConstructor: ClassConstructor<TValue>): LifetimeBinding {
            assertMutable(`register class provider for token "${tokenId}"`)

            const provider: ProviderRecord<TValue> = {
                tokenId,
                lifetime: 'transient',
                initialization: 'lazy',
                cache: {
                    state: 'empty'
                },
                execution: {
                    kind: 'sync',
                    create(): TValue {
                        return new classConstructor()
                    }
                }
            }

            addSingleProvider(registrations, provider)

            return createLifetimeBinding(tokenId, provider, assertMutable)
        },

        toAsyncFactory(factory: AsyncProviderFactory<TValue>): AsyncFactoryBinding {
            assertMutable(`register async factory provider for token "${tokenId}"`)

            const provider: ProviderRecord<TValue> = {
                tokenId,
                lifetime: 'transient',
                initialization: 'lazy',
                cache: {
                    state: 'empty'
                },
                execution: {
                    kind: 'async-factory',
                    create(context): Awaitable<TValue> {
                        return factory(context)
                    }
                }
            }

            addSingleProvider(registrations, provider)

            return createAsyncFactoryBinding(tokenId, provider, assertMutable)
        },

        toAsyncResource(factory: AsyncResourceFactory<TValue>): AsyncResourceBinding {
            assertMutable(`register async resource provider for token "${tokenId}"`)

            const provider: ProviderRecord<TValue> = {
                tokenId,
                lifetime: undefined,
                initialization: 'lazy',
                cache: {
                    state: 'empty'
                },
                execution: {
                    kind: 'async-resource',
                    create(context): Awaitable<Resource<TValue>> {
                        return factory(context)
                    }
                }
            }

            addSingleProvider(registrations, provider)

            return createAsyncResourceBinding(tokenId, provider, assertMutable)
        }
    }
}

function createMultiBindingBuilder<TValue>(
    tokenId: string,
    registrations: Map<string, ProviderRegistration>,
    assertMutable: AssertMutable
): MultiBindingBuilder<TValue> {
    return {
        toValue(value: TValue): void {
            assertMutable(`register multi-provider value contribution for token "${tokenId}"`)

            addMultiProvider(registrations, {
                tokenId,
                lifetime: 'singleton',
                initialization: 'lazy',
                cache: {
                    state: 'ready',
                    value
                },
                execution: {
                    kind: 'sync',
                    create(): TValue {
                        return value
                    }
                }
            })
        },

        toFactory(factory: SyncProviderFactory<TValue>): LifetimeBinding {
            assertMutable(`register multi-provider factory contribution for token "${tokenId}"`)

            const provider: ProviderRecord<TValue> = {
                tokenId,
                lifetime: 'transient',
                initialization: 'lazy',
                cache: {
                    state: 'empty'
                },
                execution: {
                    kind: 'sync',
                    create(context): TValue {
                        return assertSyncFactoryResult(tokenId, factory(context))
                    }
                }
            }

            addMultiProvider(registrations, provider)

            return createLifetimeBinding(tokenId, provider, assertMutable)
        }
    }
}

function assertSyncFactoryResult<TValue>(tokenId: string, value: TValue): TValue {
    if (isThenable(value)) {
        throw new SyncFactoryPromiseError(tokenId)
    }

    return value
}

function isThenable(value: unknown): boolean {
    if (value === null) {
        return false
    }

    if (typeof value !== 'object' && typeof value !== 'function') {
        return false
    }

    return typeof (value as { readonly then?: unknown }).then === 'function'
}

function createLifetimeBinding<TValue>(
    tokenId: string,
    provider: ProviderRecord<TValue>,
    assertMutable: AssertMutable
): LifetimeBinding {
    return {
        singleton(): void {
            assertMutable(`change lifetime for token "${tokenId}"`)

            provider.lifetime = 'singleton'
        },

        transient(): void {
            assertMutable(`change lifetime for token "${tokenId}"`)

            provider.lifetime = 'transient'
        },

        scoped(): void {
            assertMutable(`change lifetime for token "${tokenId}"`)

            provider.lifetime = 'scoped'
        }
    }
}

function createAsyncFactoryBinding<TValue>(
    tokenId: string,
    provider: ProviderRecord<TValue>,
    assertMutable: AssertMutable
): AsyncFactoryBinding {
    const binding: AsyncFactoryBinding = {
        singleton(): AsyncFactoryBinding {
            assertMutable(`change async factory lifetime for token "${tokenId}"`)

            provider.lifetime = 'singleton'

            return binding
        },

        transient(): AsyncFactoryBinding {
            assertMutable(`change async factory lifetime for token "${tokenId}"`)

            provider.lifetime = 'transient'

            return binding
        },

        scoped(): AsyncFactoryBinding {
            assertMutable(`change async factory lifetime for token "${tokenId}"`)

            provider.lifetime = 'scoped'

            return binding
        },

        eager(): AsyncFactoryBinding {
            assertMutable(`change async factory initialization mode for token "${tokenId}"`)

            provider.initialization = 'eager'

            return binding
        },

        lazy(): AsyncFactoryBinding {
            assertMutable(`change async factory initialization mode for token "${tokenId}"`)

            provider.initialization = 'lazy'

            return binding
        }
    }

    return binding
}

function createAsyncResourceBinding<TValue>(
    tokenId: string,
    provider: ProviderRecord<TValue>,
    assertMutable: AssertMutable
): AsyncResourceBinding {
    const binding: AsyncResourceBinding = {
        singleton(): AsyncResourceBinding {
            assertMutable(`change async resource ownership for token "${tokenId}"`)

            provider.lifetime = 'singleton'

            return binding
        },

        scoped(): AsyncResourceBinding {
            assertMutable(`change async resource ownership for token "${tokenId}"`)

            provider.lifetime = 'scoped'

            return binding
        },

        eager(): AsyncResourceBinding {
            assertMutable(`change async resource initialization mode for token "${tokenId}"`)

            provider.initialization = 'eager'

            return binding
        },

        lazy(): AsyncResourceBinding {
            assertMutable(`change async resource initialization mode for token "${tokenId}"`)

            provider.initialization = 'lazy'

            return binding
        }
    }

    return binding
}

function assertCanBindSingle(
    registrations: ReadonlyMap<string, ProviderRegistration>,
    tokenId: string
): void {
    const registration = registrations.get(tokenId)

    if (registration === undefined) {
        return
    }

    if (registration.kind === 'single') {
        throw new DuplicateProviderError(tokenId)
    }

    throw new ProviderKindMismatchError(tokenId, 'single', 'multi', 'bind single provider')
}

function assertCanAddMulti(
    registrations: ReadonlyMap<string, ProviderRegistration>,
    tokenId: string
): void {
    const registration = registrations.get(tokenId)

    if (registration === undefined || registration.kind === 'multi') {
        return
    }

    throw new ProviderKindMismatchError(
        tokenId,
        'multi',
        'single',
        'add multi-provider contribution'
    )
}

function addSingleProvider<TValue>(
    registrations: Map<string, ProviderRegistration>,
    provider: ProviderRecord<TValue>
): void {
    const registration = registrations.get(provider.tokenId)

    if (registration === undefined) {
        registrations.set(provider.tokenId, {
            kind: 'single',
            provider
        })

        return
    }

    if (registration.kind === 'single') {
        throw new DuplicateProviderError(provider.tokenId)
    }

    throw new ProviderKindMismatchError(provider.tokenId, 'single', 'multi', 'bind single provider')
}

function addMultiProvider<TValue>(
    registrations: Map<string, ProviderRegistration>,
    provider: ProviderRecord<TValue>
): void {
    const registration = registrations.get(provider.tokenId)

    if (registration === undefined) {
        registrations.set(provider.tokenId, {
            kind: 'multi',
            providers: [provider]
        })

        return
    }

    if (registration.kind === 'single') {
        throw new ProviderKindMismatchError(
            provider.tokenId,
            'multi',
            'single',
            'add multi-provider contribution'
        )
    }

    registration.providers.push(provider)
}

function cloneProviderRegistrations(
    registrations: ReadonlyMap<string, ProviderRegistration>
): Map<string, ProviderRegistration> {
    const clonedRegistrations = new Map<string, ProviderRegistration>()

    for (const [tokenId, registration] of registrations) {
        clonedRegistrations.set(tokenId, cloneProviderRegistration(registration))
    }

    return clonedRegistrations
}

function cloneProviderRegistration(registration: ProviderRegistration): ProviderRegistration {
    if (registration.kind === 'single') {
        return {
            kind: 'single',
            provider: cloneProvider(registration.provider)
        }
    }

    return {
        kind: 'multi',
        providers: registration.providers.map((provider) => cloneProvider(provider))
    }
}

function cloneProvider<TValue>(provider: ProviderRecord<TValue>): ProviderRecord<TValue> {
    return {
        tokenId: provider.tokenId,
        lifetime: provider.lifetime,
        initialization: provider.initialization,
        cache: cloneCache(provider.cache),
        execution: provider.execution
    }
}

function cloneCache<TValue>(cache: ProviderCache<TValue>): ProviderCache<TValue> {
    if (cache.state === 'empty') {
        return {
            state: 'empty'
        }
    }

    if (cache.state === 'pending') {
        return {
            state: 'pending',
            promise: cache.promise
        }
    }

    return {
        state: 'ready',
        value: cache.value
    }
}

async function createRuntime(
    registrations: ReadonlyMap<string, ProviderRegistration>
): Promise<ContainerRuntime> {
    validateProviderRegistrations(registrations)

    const runtimeState: RuntimeState = {
        disposed: false,
        singletonResourceDisposers: []
    }

    const assertRuntimeIsActive = (action: string): void => {
        if (runtimeState.disposed) {
            throw new RuntimeDisposedError(action)
        }
    }

    const assertResolutionIsActive = (scopeState: ScopeState | undefined, action: string): void => {
        if (scopeState?.disposed === true) {
            throw new ScopeDisposedError()
        }

        assertRuntimeIsActive(action)
    }

    const assertScopeForScopedProvider = (
        provider: ProviderRecord<unknown>,
        scopeState: ScopeState | undefined
    ): void => {
        if (provider.lifetime === 'scoped' && scopeState === undefined) {
            throw new InvalidScopeError(
                `Cannot resolve scoped provider for token "${provider.tokenId}" without an active scope`,
                {
                    reason: 'scoped-provider-without-scope',
                    tokenId: provider.tokenId
                }
            )
        }
    }

    const createResolutionContext = (
        stack: readonly string[],
        scopeState: ScopeState | undefined
    ): ResolutionContext =>
        Object.freeze({
            get<TResolved>(token: Token<TResolved>): TResolved {
                return resolveRequired(token, stack, scopeState)
            },

            tryGet<TResolved>(token: Token<TResolved>): TResolved | undefined {
                return resolveOptional(token, stack, scopeState)
            },

            getAll<TResolved>(token: Token<TResolved>): TResolved[] {
                return resolveAll(token, stack, scopeState)
            },

            getAsync<TResolved>(token: Token<TResolved>): Promise<TResolved> {
                return resolveRequiredAsync(token, stack, scopeState)
            },

            tryGetAsync<TResolved>(token: Token<TResolved>): Promise<TResolved | undefined> {
                return resolveOptionalAsync(token, stack, scopeState)
            }
        })

    const assertProviderHasNoCycle = (
        provider: ProviderRecord<unknown>,
        stack: readonly string[]
    ): void => {
        const cycleStart = stack.indexOf(provider.tokenId)

        if (cycleStart !== -1) {
            throw new ProviderCycleError([...stack.slice(cycleStart), provider.tokenId])
        }
    }

    const resolveProvider = <TValue>(
        provider: ProviderRecord<TValue>,
        stack: readonly string[],
        scopeState: ScopeState | undefined,
        accessMethod: 'get' | 'tryGet'
    ): TValue => {
        assertProviderHasNoCycle(provider, stack)
        assertScopeForScopedProvider(provider, scopeState)

        if (provider.execution.kind !== 'sync') {
            if (
                provider.initialization === 'eager' &&
                provider.lifetime === 'singleton' &&
                provider.cache.state === 'ready'
            ) {
                return provider.cache.value
            }

            throw new AsyncProviderAccessError(provider.tokenId, accessMethod)
        }

        if (provider.lifetime === 'scoped' && scopeState !== undefined) {
            const scopedCache = scopeState.scopedCache.get(provider as ProviderRecord<unknown>)

            if (scopedCache?.state === 'ready') {
                return scopedCache.value as TValue
            }
        }

        if (provider.lifetime === 'singleton' && provider.cache.state === 'ready') {
            return provider.cache.value
        }

        const nextStack = [...stack, provider.tokenId]
        const context = createResolutionContext(nextStack, scopeState)
        const value = provider.execution.create(context)

        if (provider.lifetime === 'singleton') {
            provider.cache = {
                state: 'ready',
                value
            }
        }

        if (provider.lifetime === 'scoped' && scopeState !== undefined) {
            scopeState.scopedCache.set(provider as ProviderRecord<unknown>, {
                state: 'ready',
                value
            })
        }

        return value
    }

    const resolveProviderAsync = <TValue>(
        provider: ProviderRecord<TValue>,
        stack: readonly string[],
        scopeState: ScopeState | undefined
    ): Promise<TValue> => {
        assertProviderHasNoCycle(provider, stack)
        assertScopeForScopedProvider(provider, scopeState)

        if (provider.execution.kind === 'sync') {
            return Promise.resolve(resolveProvider(provider, stack, scopeState, 'get'))
        }

        if (provider.lifetime === 'singleton') {
            if (provider.cache.state === 'ready') {
                return Promise.resolve(provider.cache.value)
            }

            if (provider.cache.state === 'pending') {
                return provider.cache.promise
            }

            const pending = initializeAsyncProvider(provider, stack, scopeState)
                .then((value) => {
                    provider.cache = {
                        state: 'ready',
                        value
                    }

                    return value
                })
                .catch((error: unknown) => {
                    if (provider.cache.state === 'pending' && provider.cache.promise === pending) {
                        provider.cache = {
                            state: 'empty'
                        }
                    }

                    throw error
                })

            provider.cache = {
                state: 'pending',
                promise: pending
            }

            return pending
        }

        if (provider.lifetime === 'scoped') {
            if (scopeState === undefined) {
                throw new InvalidScopeError(
                    `Cannot resolve scoped provider for token "${provider.tokenId}" without an active scope`,
                    {
                        reason: 'scoped-provider-without-scope',
                        tokenId: provider.tokenId
                    }
                )
            }

            const scopedCacheKey = provider as ProviderRecord<unknown>
            const scopedCache = scopeState.scopedCache.get(scopedCacheKey)

            if (scopedCache?.state === 'ready') {
                return Promise.resolve(scopedCache.value as TValue)
            }

            if (scopedCache?.state === 'pending') {
                return scopedCache.promise as Promise<TValue>
            }

            const pending = initializeAsyncProvider(provider, stack, scopeState)
                .then((value) => {
                    scopeState.scopedCache.set(scopedCacheKey, {
                        state: 'ready',
                        value
                    })

                    return value
                })
                .catch((error: unknown) => {
                    const currentCache = scopeState.scopedCache.get(scopedCacheKey)

                    if (currentCache?.state === 'pending' && currentCache.promise === pending) {
                        scopeState.scopedCache.delete(scopedCacheKey)
                    }

                    throw error
                })

            scopeState.scopedCache.set(scopedCacheKey, {
                state: 'pending',
                promise: pending
            })

            return pending
        }

        return initializeAsyncProvider(provider, stack, scopeState)
    }

    const initializeAsyncProvider = async <TValue>(
        provider: ProviderRecord<TValue>,
        stack: readonly string[],
        scopeState: ScopeState | undefined
    ): Promise<TValue> => {
        const nextStack = [...stack, provider.tokenId]
        const context = createResolutionContext(nextStack, scopeState)

        if (provider.execution.kind === 'async-factory') {
            const value = await provider.execution.create(context)

            assertResolutionIsActive(
                scopeState,
                `finish initializing provider for token "${provider.tokenId}"`
            )

            return value
        }

        if (provider.execution.kind === 'async-resource') {
            const resource = await provider.execution.create(context)

            return registerResourceValue(provider, resource, scopeState)
        }

        const value = provider.execution.create(context)

        assertResolutionIsActive(
            scopeState,
            `finish initializing provider for token "${provider.tokenId}"`
        )

        return value
    }

    const registerResourceValue = async <TValue>(
        provider: ProviderRecord<TValue>,
        resource: Resource<TValue>,
        scopeState: ScopeState | undefined
    ): Promise<TValue> => {
        const dispose = resource.dispose

        if (dispose === undefined) {
            assertResolutionIsActive(
                scopeState,
                `finish initializing resource for token "${provider.tokenId}"`
            )

            return resource.value
        }

        const disposerRecord: ResourceDisposerRecord = {
            tokenId: provider.tokenId,
            dispose
        }

        if (provider.lifetime === 'singleton') {
            if (runtimeState.disposed) {
                await dispose()

                throw new RuntimeDisposedError(
                    `finish initializing resource for token "${provider.tokenId}"`
                )
            }

            runtimeState.singletonResourceDisposers.push(disposerRecord)

            return resource.value
        }

        if (provider.lifetime === 'scoped') {
            if (scopeState === undefined) {
                await dispose()

                throw new InvalidScopeError(
                    `Cannot initialize scoped resource for token "${provider.tokenId}" without an active scope`,
                    {
                        reason: 'scoped-provider-without-scope',
                        tokenId: provider.tokenId
                    }
                )
            }

            if (scopeState.disposed) {
                await dispose()

                throw new ScopeDisposedError()
            }

            if (runtimeState.disposed) {
                await dispose()

                throw new RuntimeDisposedError(
                    `finish initializing resource for token "${provider.tokenId}"`
                )
            }

            scopeState.scopedResourceDisposers.push(disposerRecord)

            return resource.value
        }

        await dispose()

        throw new InvalidProviderLifecycleError(
            provider.tokenId,
            'async resources require singleton or scoped ownership'
        )
    }

    const resolveRequired = <TValue>(
        token: Token<TValue>,
        stack: readonly string[],
        scopeState: ScopeState | undefined
    ): TValue => {
        assertResolutionIsActive(scopeState, `resolve provider for token "${token.id}"`)

        if (scopeState !== undefined) {
            if (scopeState.localSingles.has(token.id)) {
                return scopeState.localSingles.get(token.id) as TValue
            }

            if (scopeState.localMultis.has(token.id)) {
                throw new ProviderKindMismatchError(
                    token.id,
                    'single',
                    'multi',
                    'resolve single provider'
                )
            }
        }

        const registration = registrations.get(token.id)

        if (registration === undefined) {
            throw new ProviderNotFoundError(token.id)
        }

        if (registration.kind === 'multi') {
            throw new ProviderKindMismatchError(
                token.id,
                'single',
                'multi',
                'resolve single provider'
            )
        }

        return resolveProvider(
            registration.provider as ProviderRecord<TValue>,
            stack,
            scopeState,
            'get'
        )
    }

    const resolveOptional = <TValue>(
        token: Token<TValue>,
        stack: readonly string[],
        scopeState: ScopeState | undefined
    ): TValue | undefined => {
        assertResolutionIsActive(scopeState, `resolve provider for token "${token.id}"`)

        if (scopeState !== undefined) {
            if (scopeState.localSingles.has(token.id)) {
                return scopeState.localSingles.get(token.id) as TValue
            }

            if (scopeState.localMultis.has(token.id)) {
                throw new ProviderKindMismatchError(
                    token.id,
                    'single',
                    'multi',
                    'resolve single provider'
                )
            }
        }

        const registration = registrations.get(token.id)

        if (registration === undefined) {
            return undefined
        }

        if (registration.kind === 'multi') {
            throw new ProviderKindMismatchError(
                token.id,
                'single',
                'multi',
                'resolve single provider'
            )
        }

        return resolveProvider(
            registration.provider as ProviderRecord<TValue>,
            stack,
            scopeState,
            'tryGet'
        )
    }

    const resolveRequiredAsync = async <TValue>(
        token: Token<TValue>,
        stack: readonly string[],
        scopeState: ScopeState | undefined
    ): Promise<TValue> => {
        assertResolutionIsActive(scopeState, `resolve provider for token "${token.id}"`)

        if (scopeState !== undefined) {
            if (scopeState.localSingles.has(token.id)) {
                return scopeState.localSingles.get(token.id) as TValue
            }

            if (scopeState.localMultis.has(token.id)) {
                throw new ProviderKindMismatchError(
                    token.id,
                    'single',
                    'multi',
                    'resolve single provider'
                )
            }
        }

        const registration = registrations.get(token.id)

        if (registration === undefined) {
            throw new ProviderNotFoundError(token.id)
        }

        if (registration.kind === 'multi') {
            throw new ProviderKindMismatchError(
                token.id,
                'single',
                'multi',
                'resolve single provider'
            )
        }

        return resolveProviderAsync(
            registration.provider as ProviderRecord<TValue>,
            stack,
            scopeState
        )
    }

    const resolveOptionalAsync = async <TValue>(
        token: Token<TValue>,
        stack: readonly string[],
        scopeState: ScopeState | undefined
    ): Promise<TValue | undefined> => {
        assertResolutionIsActive(scopeState, `resolve provider for token "${token.id}"`)

        if (scopeState !== undefined) {
            if (scopeState.localSingles.has(token.id)) {
                return scopeState.localSingles.get(token.id) as TValue
            }

            if (scopeState.localMultis.has(token.id)) {
                throw new ProviderKindMismatchError(
                    token.id,
                    'single',
                    'multi',
                    'resolve single provider'
                )
            }
        }

        const registration = registrations.get(token.id)

        if (registration === undefined) {
            return undefined
        }

        if (registration.kind === 'multi') {
            throw new ProviderKindMismatchError(
                token.id,
                'single',
                'multi',
                'resolve single provider'
            )
        }

        return resolveProviderAsync(
            registration.provider as ProviderRecord<TValue>,
            stack,
            scopeState
        )
    }

    const resolveAll = <TValue>(
        token: Token<TValue>,
        stack: readonly string[],
        scopeState: ScopeState | undefined
    ): TValue[] => {
        assertResolutionIsActive(scopeState, `resolve provider collection for token "${token.id}"`)

        let localMultiValues: readonly unknown[] | undefined

        if (scopeState !== undefined) {
            if (scopeState.localSingles.has(token.id)) {
                throw new ProviderKindMismatchError(
                    token.id,
                    'multi',
                    'single',
                    'resolve multi-provider collection'
                )
            }

            localMultiValues = scopeState.localMultis.get(token.id)
        }

        const registration = registrations.get(token.id)

        if (registration === undefined) {
            if (localMultiValues === undefined) {
                return []
            }

            return [...localMultiValues] as TValue[]
        }

        if (registration.kind === 'single') {
            throw new ProviderKindMismatchError(
                token.id,
                'multi',
                'single',
                'resolve multi-provider collection'
            )
        }

        const runtimeValues = registration.providers.map((provider) =>
            resolveProvider(provider as ProviderRecord<TValue>, stack, scopeState, 'get')
        )

        if (localMultiValues === undefined) {
            return runtimeValues
        }

        return [...runtimeValues, ...localMultiValues] as TValue[]
    }

    const disposeResourceRecords = async (
        resourceDisposers: ResourceDisposerRecord[]
    ): Promise<void> => {
        const records = [...resourceDisposers].reverse()

        resourceDisposers.length = 0

        let firstError: unknown

        for (const record of records) {
            try {
                await record.dispose()
            } catch (error) {
                if (firstError === undefined) {
                    firstError = error
                }
            }
        }

        if (firstError !== undefined) {
            throw firstError
        }
    }

    const createScope = (options?: CreateScopeOptions): Scope => {
        assertRuntimeIsActive('create scope')

        const scopeState = createScopeState(options, registrations)
        const scope: Scope = {
            get<TValue>(token: Token<TValue>): TValue {
                return resolveRequired(token, [], scopeState)
            },

            tryGet<TValue>(token: Token<TValue>): TValue | undefined {
                return resolveOptional(token, [], scopeState)
            },

            getAll<TValue>(token: Token<TValue>): TValue[] {
                return resolveAll(token, [], scopeState)
            },

            getAsync<TValue>(token: Token<TValue>): Promise<TValue> {
                return resolveRequiredAsync(token, [], scopeState)
            },

            async dispose(): Promise<void> {
                if (scopeState.disposed) {
                    return
                }

                scopeState.disposed = true

                try {
                    await disposeResourceRecords(scopeState.scopedResourceDisposers)
                } finally {
                    scopeState.scopedCache.clear()
                }
            }
        }

        return Object.freeze(scope)
    }

    function withScope<TValue>(callback: ScopeCallback<TValue>): Promise<TValue>
    function withScope<TValue>(
        options: CreateScopeOptions,
        callback: ScopeCallback<TValue>
    ): Promise<TValue>
    async function withScope<TValue>(
        optionsOrCallback: CreateScopeOptions | ScopeCallback<TValue>,
        callback?: ScopeCallback<TValue>
    ): Promise<TValue> {
        let options: CreateScopeOptions | undefined
        let scopeCallback: ScopeCallback<TValue>

        if (typeof optionsOrCallback === 'function') {
            scopeCallback = optionsOrCallback
        } else {
            options = optionsOrCallback

            if (callback === undefined) {
                throw new InvalidScopeError('withScope(options, callback) requires a callback', {
                    reason: 'invalid-with-scope-callback'
                })
            }

            scopeCallback = callback
        }

        const scope = createScope(options)

        try {
            return await scopeCallback(scope)
        } finally {
            await scope.dispose()
        }
    }

    const runtime: ContainerRuntime = {
        get<TValue>(token: Token<TValue>): TValue {
            return resolveRequired(token, [], undefined)
        },

        tryGet<TValue>(token: Token<TValue>): TValue | undefined {
            return resolveOptional(token, [], undefined)
        },

        getAll<TValue>(token: Token<TValue>): TValue[] {
            return resolveAll(token, [], undefined)
        },

        createScope,
        withScope,

        getAsync<TValue>(token: Token<TValue>): Promise<TValue> {
            return resolveRequiredAsync(token, [], undefined)
        },

        tryGetAsync<TValue>(token: Token<TValue>): Promise<TValue | undefined> {
            return resolveOptionalAsync(token, [], undefined)
        },

        async dispose(): Promise<void> {
            if (runtimeState.disposed) {
                return
            }

            runtimeState.disposed = true
            await disposeResourceRecords(runtimeState.singletonResourceDisposers)
        }
    }

    await initializeEagerSingletonProviders(registrations, resolveProviderAsync)

    return Object.freeze(runtime)
}

function validateProviderRegistrations(
    registrations: ReadonlyMap<string, ProviderRegistration>
): void {
    for (const registration of registrations.values()) {
        const providers =
            registration.kind === 'single' ? [registration.provider] : registration.providers

        for (const provider of providers) {
            validateProvider(provider)
        }
    }
}

function validateProvider(provider: ProviderRecord<unknown>): void {
    if (provider.execution.kind === 'async-resource' && provider.lifetime === undefined) {
        throw new InvalidProviderLifecycleError(
            provider.tokenId,
            'async resources require explicit singleton() or scoped() ownership'
        )
    }

    if (provider.execution.kind === 'async-resource' && provider.lifetime === 'transient') {
        throw new InvalidProviderLifecycleError(
            provider.tokenId,
            'async resources cannot use transient ownership'
        )
    }

    if (provider.execution.kind !== 'sync' && provider.initialization === 'eager') {
        if (provider.lifetime !== 'singleton') {
            throw new InvalidProviderLifecycleError(
                provider.tokenId,
                'eager async initialization is valid only for singleton providers'
            )
        }
    }
}

async function initializeEagerSingletonProviders(
    registrations: ReadonlyMap<string, ProviderRegistration>,
    resolveProviderAsync: <TValue>(
        provider: ProviderRecord<TValue>,
        stack: readonly string[],
        scopeState: ScopeState | undefined
    ) => Promise<TValue>
): Promise<void> {
    for (const registration of registrations.values()) {
        if (registration.kind === 'multi') {
            continue
        }

        const provider = registration.provider

        if (provider.execution.kind !== 'sync' && provider.initialization === 'eager') {
            await resolveProviderAsync(provider, [], undefined)
        }
    }
}

function createScopeState(
    options: CreateScopeOptions | undefined,
    registrations: ReadonlyMap<string, ProviderRegistration>
): ScopeState {
    const localSingles = new Map<string, unknown>()
    const localMultis = new Map<string, unknown[]>()

    for (const entry of options?.values ?? []) {
        const localValue = normalizeScopeLocalValue(entry)

        if (localSingles.has(localValue.tokenId)) {
            throw new DuplicateScopeLocalValueError(localValue.tokenId)
        }

        if (localMultis.has(localValue.tokenId)) {
            throw new ProviderKindMismatchError(
                localValue.tokenId,
                'single',
                'multi',
                'create scope-local single value'
            )
        }

        const registration = registrations.get(localValue.tokenId)

        if (registration?.kind === 'multi') {
            throw new ProviderKindMismatchError(
                localValue.tokenId,
                'single',
                'multi',
                'create scope-local single value'
            )
        }

        localSingles.set(localValue.tokenId, localValue.value)
    }

    for (const entry of options?.multiValues ?? []) {
        const localValue = normalizeScopeLocalValue(entry)

        if (localSingles.has(localValue.tokenId)) {
            throw new ProviderKindMismatchError(
                localValue.tokenId,
                'multi',
                'single',
                'create scope-local multi value'
            )
        }

        const registration = registrations.get(localValue.tokenId)

        if (registration?.kind === 'single') {
            throw new ProviderKindMismatchError(
                localValue.tokenId,
                'multi',
                'single',
                'create scope-local multi value'
            )
        }

        const values = localMultis.get(localValue.tokenId)

        if (values === undefined) {
            localMultis.set(localValue.tokenId, [localValue.value])
        } else {
            values.push(localValue.value)
        }
    }

    return {
        localSingles,
        localMultis,
        scopedCache: new Map<ProviderRecord<unknown>, ProviderCache<unknown>>(),
        scopedResourceDisposers: [],
        disposed: false
    }
}

function normalizeScopeLocalValue(entry: ScopeLocalValue): NormalizedScopeLocalValue {
    if (isScopeLocalTuple(entry)) {
        const [localToken, value] = entry

        return {
            tokenId: localToken.id,
            value
        }
    }

    return {
        tokenId: entry.token.id,
        value: entry.value
    }
}

function isScopeLocalTuple(
    entry: ScopeLocalValue
): entry is readonly [token: Token<unknown>, value: unknown] {
    return Array.isArray(entry)
}
