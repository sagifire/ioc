import { SagifireIocError } from './diagnostics'

export interface Token<TValue> {
    readonly id: string
    readonly description?: string
    readonly __type?: TValue
}

declare const multiTokenBrand: unique symbol

export interface MultiToken<TValue> extends Token<TValue> {
    readonly [multiTokenBrand]: 'multi'
}

export type ContributionToken<TValue> = MultiToken<TValue>

export interface TokenOptions {
    readonly description?: string
}

export interface TokenNamespace {
    readonly id: string
    token<TValue>(id: string, options?: TokenOptions): Token<TValue>
    multiToken<TValue>(id: string, options?: TokenOptions): MultiToken<TValue>
    contributionToken<TValue>(id: string, options?: TokenOptions): ContributionToken<TValue>
}

export class InvalidTokenIdError extends SagifireIocError<{
    readonly kind: 'token' | 'namespace'
    readonly value: unknown
    readonly reason: string
}> {
    override readonly name = 'InvalidTokenIdError'
    override readonly code = 'SAGIFIRE_IOC_INVALID_TOKEN_ID'
    readonly kind: 'token' | 'namespace'
    readonly value: unknown
    readonly reason: string

    constructor(kind: 'token' | 'namespace', value: unknown, reason: string) {
        super({
            code: 'SAGIFIRE_IOC_INVALID_TOKEN_ID',
            message: `Invalid ${kind} id ${formatInvalidIdValue(value)}: ${reason}`,
            details: {
                kind,
                value,
                reason
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.kind = kind
        this.value = value
        this.reason = reason
    }
}

const tokenIdPattern = /^[A-Za-z0-9._:/-]+$/

export function token<TValue>(id: string, options?: TokenOptions): Token<TValue> {
    const tokenId = validateTokenId(id, 'token')

    return createToken(tokenId, options)
}

export function multiToken<TValue>(id: string, options?: TokenOptions): MultiToken<TValue> {
    const tokenId = validateTokenId(id, 'token')

    return createMultiToken(tokenId, options)
}

export function contributionToken<TValue>(
    id: string,
    options?: TokenOptions
): ContributionToken<TValue> {
    return multiToken<TValue>(id, options)
}

export function namespace(id: string): TokenNamespace {
    const namespaceId = validateTokenId(id, 'namespace')

    return Object.freeze({
        id: namespaceId,
        token<TValue>(localId: string, options?: TokenOptions): Token<TValue> {
            const tokenId = validateTokenId(localId, 'token')

            return createToken(`${namespaceId}.${tokenId}`, options)
        },
        multiToken<TValue>(localId: string, options?: TokenOptions): MultiToken<TValue> {
            const tokenId = validateTokenId(localId, 'token')

            return createMultiToken(`${namespaceId}.${tokenId}`, options)
        },
        contributionToken<TValue>(
            localId: string,
            options?: TokenOptions
        ): ContributionToken<TValue> {
            const tokenId = validateTokenId(localId, 'token')

            return createMultiToken<TValue>(`${namespaceId}.${tokenId}`, options)
        }
    })
}

function createToken<TValue>(id: string, options?: TokenOptions): Token<TValue> {
    const description = options?.description
    const createdToken: Token<TValue> =
        description === undefined
            ? {
                  id
              }
            : {
                  id,
                  description
              }

    return Object.freeze(createdToken)
}

function createMultiToken<TValue>(id: string, options?: TokenOptions): MultiToken<TValue> {
    return createToken(id, options) as unknown as MultiToken<TValue>
}

function validateTokenId(id: unknown, kind: 'token' | 'namespace'): string {
    if (typeof id !== 'string') {
        throw new InvalidTokenIdError(kind, id, 'id must be a string')
    }

    if (id.length === 0) {
        throw new InvalidTokenIdError(kind, id, 'id must not be empty')
    }

    if (id.trim() !== id) {
        throw new InvalidTokenIdError(kind, id, 'id must not have leading or trailing whitespace')
    }

    if (!tokenIdPattern.test(id)) {
        throw new InvalidTokenIdError(
            kind,
            id,
            'id may contain only ASCII letters, ASCII digits, ".", "-", "_", ":", and "/"'
        )
    }

    return id
}

function formatInvalidIdValue(value: unknown): string {
    if (typeof value === 'string') {
        if (value.length === 0) {
            return '<empty string>'
        }

        return `"${value}"`
    }

    if (value === undefined) {
        return 'undefined'
    }

    if (value === null) {
        return 'null'
    }

    return `${typeof value} value`
}
