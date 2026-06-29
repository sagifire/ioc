import type { Token } from './tokens'

export type ProviderLifetime = 'singleton' | 'transient'

export type ProviderRegistrationKind = 'single' | 'multi'

export type SyncProviderFactory<TValue> = (context: ResolutionContext) => TValue

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
}

export interface MultiBindingBuilder<TValue> {
    toValue(value: TValue): void
    toFactory(factory: SyncProviderFactory<TValue>): LifetimeBinding
}

export interface LifetimeBinding {
    singleton(): void
    transient(): void
}

export interface ContainerRuntime {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
}

export interface ResolutionContext {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
}

export class ProviderNotFoundError extends Error {
    override readonly name = 'ProviderNotFoundError'
    readonly code = 'SAGIFIRE_IOC_PROVIDER_NOT_FOUND'
    readonly tokenId: string

    constructor(tokenId: string) {
        super(`Provider not found for token "${tokenId}"`)

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
    }
}

export class DuplicateProviderError extends Error {
    override readonly name = 'DuplicateProviderError'
    readonly code = 'SAGIFIRE_IOC_DUPLICATE_PROVIDER'
    readonly tokenId: string

    constructor(tokenId: string) {
        super(`Duplicate provider for token "${tokenId}"`)

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
    }
}

export class ProviderKindMismatchError extends Error {
    override readonly name = 'ProviderKindMismatchError'
    readonly code = 'SAGIFIRE_IOC_PROVIDER_KIND_MISMATCH'
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
        super(
            `Cannot ${action} for token "${tokenId}": expected ${expectedKind} provider ` +
                `registration but found ${actualKind} provider registration`
        )

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
        this.expectedKind = expectedKind
        this.actualKind = actualKind
        this.action = action
    }
}

export class ProviderCycleError extends Error {
    override readonly name = 'ProviderCycleError'
    readonly code = 'SAGIFIRE_IOC_PROVIDER_CYCLE'
    readonly tokenIds: readonly string[]

    constructor(tokenIds: readonly string[]) {
        super(`Provider cycle detected: ${tokenIds.join(' -> ')}`)

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenIds = tokenIds
    }
}

export class ContainerFrozenError extends Error {
    override readonly name = 'ContainerFrozenError'
    readonly code = 'SAGIFIRE_IOC_CONTAINER_FROZEN'
    readonly action: string

    constructor(action: string) {
        super(`Container configuration is frozen after freeze(); cannot ${action}`)

        Object.setPrototypeOf(this, new.target.prototype)

        this.action = action
    }
}

type SingletonCache<TValue> =
    | {
          readonly state: 'empty'
      }
    | {
          readonly state: 'ready'
          readonly value: TValue
      }

interface ProviderRecord<TValue> {
    readonly tokenId: string
    lifetime: ProviderLifetime
    cache: SingletonCache<TValue>
    create(context: ResolutionContext): TValue
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

type AssertMutable = (action: string) => void

export function createContainer(): ContainerBuilder {
    const registrations = new Map<string, ProviderRegistration>()

    let isFrozen = false
    let frozenRuntime: ContainerRuntime | undefined

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
            if (frozenRuntime !== undefined) {
                return Promise.resolve(frozenRuntime)
            }

            isFrozen = true
            frozenRuntime = createRuntime(cloneProviderRegistrations(registrations))

            return Promise.resolve(frozenRuntime)
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
                cache: {
                    state: 'ready',
                    value
                },
                create(): TValue {
                    return value
                }
            })
        },

        toFactory(factory: SyncProviderFactory<TValue>): LifetimeBinding {
            assertMutable(`register factory provider for token "${tokenId}"`)

            const provider: ProviderRecord<TValue> = {
                tokenId,
                lifetime: 'transient',
                cache: {
                    state: 'empty'
                },
                create(context): TValue {
                    return factory(context)
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
                cache: {
                    state: 'empty'
                },
                create(): TValue {
                    return new classConstructor()
                }
            }

            addSingleProvider(registrations, provider)

            return createLifetimeBinding(tokenId, provider, assertMutable)
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
                cache: {
                    state: 'ready',
                    value
                },
                create(): TValue {
                    return value
                }
            })
        },

        toFactory(factory: SyncProviderFactory<TValue>): LifetimeBinding {
            assertMutable(`register multi-provider factory contribution for token "${tokenId}"`)

            const provider: ProviderRecord<TValue> = {
                tokenId,
                lifetime: 'transient',
                cache: {
                    state: 'empty'
                },
                create(context): TValue {
                    return factory(context)
                }
            }

            addMultiProvider(registrations, provider)

            return createLifetimeBinding(tokenId, provider, assertMutable)
        }
    }
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
        }
    }
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

    throw new ProviderKindMismatchError(tokenId, 'multi', 'single', 'add multi-provider contribution')
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
        cache: cloneCache(provider.cache),
        create: provider.create
    }
}

function cloneCache<TValue>(cache: SingletonCache<TValue>): SingletonCache<TValue> {
    if (cache.state === 'empty') {
        return {
            state: 'empty'
        }
    }

    return {
        state: 'ready',
        value: cache.value
    }
}

function createRuntime(
    registrations: ReadonlyMap<string, ProviderRegistration>
): ContainerRuntime {
    const resolveProvider = <TValue>(
        provider: ProviderRecord<TValue>,
        stack: readonly string[]
    ): TValue => {
        const cycleStart = stack.indexOf(provider.tokenId)

        if (cycleStart !== -1) {
            throw new ProviderCycleError([...stack.slice(cycleStart), provider.tokenId])
        }

        if (provider.lifetime === 'singleton' && provider.cache.state === 'ready') {
            return provider.cache.value
        }

        const nextStack = [...stack, provider.tokenId]
        const context: ResolutionContext = Object.freeze({
            get<TResolved>(token: Token<TResolved>): TResolved {
                return resolveRequired(token, nextStack)
            },

            tryGet<TResolved>(token: Token<TResolved>): TResolved | undefined {
                return resolveOptional(token, nextStack)
            },

            getAll<TResolved>(token: Token<TResolved>): TResolved[] {
                return resolveAll(token, nextStack)
            }
        })

        const value = provider.create(context)

        if (provider.lifetime === 'singleton') {
            provider.cache = {
                state: 'ready',
                value
            }
        }

        return value
    }

    const resolveRequired = <TValue>(token: Token<TValue>, stack: readonly string[]): TValue => {
        const registration = registrations.get(token.id)

        if (registration === undefined) {
            throw new ProviderNotFoundError(token.id)
        }

        if (registration.kind === 'multi') {
            throw new ProviderKindMismatchError(token.id, 'single', 'multi', 'resolve single provider')
        }

        return resolveProvider(registration.provider as ProviderRecord<TValue>, stack)
    }

    const resolveOptional = <TValue>(
        token: Token<TValue>,
        stack: readonly string[]
    ): TValue | undefined => {
        const registration = registrations.get(token.id)

        if (registration === undefined) {
            return undefined
        }

        if (registration.kind === 'multi') {
            throw new ProviderKindMismatchError(token.id, 'single', 'multi', 'resolve single provider')
        }

        return resolveProvider(registration.provider as ProviderRecord<TValue>, stack)
    }

    const resolveAll = <TValue>(token: Token<TValue>, stack: readonly string[]): TValue[] => {
        const registration = registrations.get(token.id)

        if (registration === undefined) {
            return []
        }

        if (registration.kind === 'single') {
            throw new ProviderKindMismatchError(
                token.id,
                'multi',
                'single',
                'resolve multi-provider collection'
            )
        }

        return registration.providers.map((provider) =>
            resolveProvider(provider as ProviderRecord<TValue>, stack)
        )
    }

    const runtime: ContainerRuntime = {
        get<TValue>(token: Token<TValue>): TValue {
            return resolveRequired(token, [])
        },

        tryGet<TValue>(token: Token<TValue>): TValue | undefined {
            return resolveOptional(token, [])
        },

        getAll<TValue>(token: Token<TValue>): TValue[] {
            return resolveAll(token, [])
        }
    }

    return Object.freeze(runtime)
}
