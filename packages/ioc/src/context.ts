import { SagifireIocError } from './diagnostics'
import type { LifetimeValidationReport } from './lifetime-validation'
import type { NormalizedProviderGraphSnapshot } from './provider-metadata'
import type { Token } from './tokens'

export interface ProviderInspection {
    readonly providerGraph: NormalizedProviderGraphSnapshot
    readonly lifetimeValidation?: LifetimeValidationReport
}

export interface Scope {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
    getAllAsync<TValue>(token: Token<TValue>): Promise<TValue[]>
    getAsync<TValue>(token: Token<TValue>): Promise<TValue>
    inspect(): ProviderInspection
    createChildScope(options?: CreateScopeOptions): Scope
    withChildScope<TValue>(callback: ScopeCallback<TValue>): Promise<TValue>
    withChildScope<TValue>(
        options: CreateScopeOptions,
        callback: ScopeCallback<TValue>
    ): Promise<TValue>
    dispose(): Promise<void>
}

export type ScopeCallback<TValue> = (scope: Scope) => TValue | Promise<TValue>

export interface ScopeLocalValueObject<TValue = unknown> {
    readonly token: Token<TValue>
    readonly value: TValue
}

export type ScopeLocalValue<TValue = unknown> =
    ScopeLocalValueObject<TValue> | readonly [token: Token<TValue>, value: TValue]

export interface CreateScopeOptions {
    readonly values?: readonly ScopeLocalValue[]
    readonly multiValues?: readonly ScopeLocalValue[]
}

export type InvalidScopeReason =
    'scope-disposed' | 'scoped-provider-without-scope' | 'invalid-with-scope-callback'

export interface InvalidScopeErrorOptions {
    readonly reason: InvalidScopeReason
    readonly tokenId?: string
}

export class InvalidScopeError extends SagifireIocError<{
    readonly reason: InvalidScopeReason
    readonly tokenId: string | undefined
}> {
    override readonly name = 'InvalidScopeError'
    override readonly code = 'SAGIFIRE_IOC_INVALID_SCOPE'
    readonly reason: InvalidScopeReason
    readonly tokenId: string | undefined

    constructor(message: string, options: InvalidScopeErrorOptions) {
        super({
            code: 'SAGIFIRE_IOC_INVALID_SCOPE',
            message,
            details: {
                reason: options.reason,
                tokenId: options.tokenId
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.reason = options.reason
        this.tokenId = options.tokenId
    }
}

export class ScopeDisposedError extends SagifireIocError<{
    readonly reason: 'scope-disposed'
}> {
    override readonly name = 'ScopeDisposedError'
    override readonly code = 'SAGIFIRE_IOC_SCOPE_DISPOSED'

    constructor(action = 'resolve providers') {
        super({
            code: 'SAGIFIRE_IOC_SCOPE_DISPOSED',
            message: `Scope has been disposed and cannot ${action}`,
            details: {
                reason: 'scope-disposed'
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class DuplicateScopeLocalValueError extends SagifireIocError<{
    readonly tokenId: string
}> {
    override readonly name = 'DuplicateScopeLocalValueError'
    override readonly code = 'SAGIFIRE_IOC_DUPLICATE_SCOPE_LOCAL_VALUE'
    readonly tokenId: string

    constructor(tokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_DUPLICATE_SCOPE_LOCAL_VALUE',
            message: `Duplicate scope-local single value for token "${tokenId}"`,
            details: {
                tokenId
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
    }
}

export function scopeValue<TValue>(
    valueToken: Token<TValue>,
    value: TValue
): ScopeLocalValueObject<TValue> {
    return Object.freeze({
        token: valueToken,
        value
    })
}

export function scopeMultiValue<TValue>(
    valueToken: Token<TValue>,
    value: TValue
): ScopeLocalValueObject<TValue> {
    return Object.freeze({
        token: valueToken,
        value
    })
}
