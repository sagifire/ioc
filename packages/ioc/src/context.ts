import type { Token } from './tokens'

export interface Scope {
    get<TValue>(token: Token<TValue>): TValue
    tryGet<TValue>(token: Token<TValue>): TValue | undefined
    getAll<TValue>(token: Token<TValue>): TValue[]
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

export class InvalidScopeError extends Error {
    override readonly name = 'InvalidScopeError'
    readonly code = 'SAGIFIRE_IOC_INVALID_SCOPE'
    readonly reason: InvalidScopeReason
    readonly tokenId: string | undefined

    constructor(message: string, options: InvalidScopeErrorOptions) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)

        this.reason = options.reason
        this.tokenId = options.tokenId
    }
}

export class DuplicateScopeLocalValueError extends Error {
    override readonly name = 'DuplicateScopeLocalValueError'
    readonly code = 'SAGIFIRE_IOC_DUPLICATE_SCOPE_LOCAL_VALUE'
    readonly tokenId: string

    constructor(tokenId: string) {
        super(`Duplicate scope-local single value for token "${tokenId}"`)

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
