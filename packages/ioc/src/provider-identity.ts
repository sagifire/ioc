export type ProviderIdentityRegistrationKind = 'single' | 'multi'

export interface PublicProviderRegistrationKey {
    readonly visibility: 'public'
    readonly tokenId: string
    readonly registrationIndex: number
}

export interface PrivateProviderRegistrationKey {
    readonly visibility: 'private'
    readonly moduleId: string
    readonly registrationIndex: number
}

export type ProviderRegistrationKey = PublicProviderRegistrationKey | PrivateProviderRegistrationKey

export interface PublicCollectionIdentity {
    readonly visibility: 'public'
    readonly tokenId: string
}

export interface PrivateCollectionCycleCoordinate {
    readonly visibility: 'private'
    readonly moduleId: string
    readonly privateCollectionOrdinal: number
    readonly contributionIndex: number
    readonly providerKey: PrivateProviderRegistrationKey
}

export type ProviderCollectionIdentity = PublicCollectionIdentity | PrivateCollectionCycleCoordinate

export interface ProviderRegistrationIdentity {
    readonly key: ProviderRegistrationKey
    readonly registrationKind: ProviderIdentityRegistrationKind
    readonly collection: ProviderCollectionIdentity | undefined
}

export const providerRegistrationIdentityBridge = Symbol(
    'sagifire.ioc.provider-registration-identity'
)

export interface ProviderRegistrationIdentityAwareBuilder {
    [providerRegistrationIdentityBridge](identity: ProviderRegistrationIdentity): void
}

export function setProviderRegistrationIdentity(
    builder: unknown,
    identity: ProviderRegistrationIdentity
): void {
    const identityAwareBuilder = builder as Partial<ProviderRegistrationIdentityAwareBuilder>
    const setIdentity = identityAwareBuilder[providerRegistrationIdentityBridge]

    if (setIdentity === undefined) {
        throw new Error('Container registration builder does not support provider identity')
    }

    setIdentity(identity)
}

export function createPublicProviderRegistrationIdentity(
    tokenId: string,
    registrationIndex: number,
    registrationKind: ProviderIdentityRegistrationKind
): ProviderRegistrationIdentity {
    const key = Object.freeze({
        visibility: 'public' as const,
        tokenId,
        registrationIndex
    })

    return Object.freeze({
        key,
        registrationKind,
        collection:
            registrationKind === 'multi'
                ? Object.freeze({
                      visibility: 'public' as const,
                      tokenId
                  })
                : undefined
    })
}

export function createPrivateProviderRegistrationIdentity(options: {
    readonly moduleId: string
    readonly registrationIndex: number
    readonly registrationKind: ProviderIdentityRegistrationKind
    readonly privateCollectionOrdinal?: number
    readonly contributionIndex?: number
}): ProviderRegistrationIdentity {
    const key = Object.freeze({
        visibility: 'private' as const,
        moduleId: options.moduleId,
        registrationIndex: options.registrationIndex
    })

    if (options.registrationKind === 'single') {
        return Object.freeze({
            key,
            registrationKind: 'single' as const,
            collection: undefined
        })
    }

    if (options.privateCollectionOrdinal === undefined || options.contributionIndex === undefined) {
        throw new Error('Private multi-provider identity requires collection coordinates')
    }

    return Object.freeze({
        key,
        registrationKind: 'multi' as const,
        collection: Object.freeze({
            visibility: 'private' as const,
            moduleId: options.moduleId,
            privateCollectionOrdinal: options.privateCollectionOrdinal,
            contributionIndex: options.contributionIndex,
            providerKey: key
        })
    })
}

export function providerRegistrationKeysEqual(
    left: ProviderRegistrationKey,
    right: ProviderRegistrationKey
): boolean {
    if (left.visibility !== right.visibility) {
        return false
    }

    if (left.visibility === 'public' && right.visibility === 'public') {
        return left.tokenId === right.tokenId && left.registrationIndex === right.registrationIndex
    }

    if (left.visibility === 'private' && right.visibility === 'private') {
        return (
            left.moduleId === right.moduleId && left.registrationIndex === right.registrationIndex
        )
    }

    return false
}

export function providerCollectionsEqual(
    left: ProviderCollectionIdentity,
    right: ProviderCollectionIdentity
): boolean {
    if (left.visibility !== right.visibility) {
        return false
    }

    if (left.visibility === 'public' && right.visibility === 'public') {
        return left.tokenId === right.tokenId
    }

    if (left.visibility === 'private' && right.visibility === 'private') {
        return (
            left.moduleId === right.moduleId &&
            left.privateCollectionOrdinal === right.privateCollectionOrdinal
        )
    }

    return false
}
