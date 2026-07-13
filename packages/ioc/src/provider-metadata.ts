import type { Token } from './tokens'
import { SagifireIocError } from './diagnostics'
import type { ProviderRegistrationIdentity, ProviderRegistrationKey } from './provider-identity'

export type ProviderDependencyCardinality = 'single' | 'multi'

export type ProviderTargetRegistrationKind = 'single' | 'multi' | 'missing'

export type ProviderDependency =
    | {
          readonly token: Token<unknown>
          readonly access: 'instance'
          readonly cardinality?: ProviderDependencyCardinality
      }
    | {
          readonly token: Token<unknown>
          readonly access: 'deferred'
          readonly via: Token<unknown>
          readonly scope: 'caller'
          readonly cardinality?: ProviderDependencyCardinality
      }

export interface ProviderDependencyOptions {
    readonly dependencies: readonly ProviderDependency[]
}

export type ProviderDependencyTarget =
    | {
          readonly visibility: 'public'
          readonly tokenId: string
      }
    | {
          readonly visibility: 'private'
          readonly moduleId: string
          readonly selectorIndex: number
      }

export type ProviderNodeKind = 'value' | 'factory' | 'class' | 'async-factory' | 'async-resource'

export interface NormalizedProviderNode {
    readonly key: ProviderRegistrationKey
    readonly registrationKind: 'single' | 'multi'
    readonly providerKind: ProviderNodeKind
    readonly lifetime: 'singleton' | 'transient' | 'scoped' | undefined
    readonly initialization: 'lazy' | 'eager'
}

export type NormalizedProviderDependencySelector =
    | {
          readonly selectorIndex: number
          readonly consumer: ProviderRegistrationKey
          readonly target: ProviderDependencyTarget
          readonly access: 'instance'
          readonly cardinality: ProviderDependencyCardinality
          readonly targetRegistrationKind: ProviderTargetRegistrationKind
      }
    | {
          readonly selectorIndex: number
          readonly consumer: ProviderRegistrationKey
          readonly target: ProviderDependencyTarget
          readonly access: 'deferred'
          readonly cardinality: ProviderDependencyCardinality
          readonly targetRegistrationKind: ProviderTargetRegistrationKind
          readonly via: ProviderDependencyTarget
          readonly viaRegistrationKind: ProviderTargetRegistrationKind
          readonly scope: 'caller'
      }

export interface NormalizedProviderDependencyEdge {
    readonly selectorIndex: number
    readonly consumer: ProviderRegistrationKey
    readonly dependency: ProviderRegistrationKey
    readonly access: 'instance' | 'deferred'
}

export interface NormalizedProviderOwnershipEdge {
    readonly provider: ProviderRegistrationKey
    readonly owner: 'runtime' | 'scope'
}

export type ProviderDependencyCoverage = 'not-applicable' | 'declared' | 'undeclared'

export interface NormalizedProviderCoverage {
    readonly provider: ProviderRegistrationKey
    readonly coverage: ProviderDependencyCoverage
}

export interface NormalizedProviderGraphSnapshot {
    readonly nodes: readonly NormalizedProviderNode[]
    readonly selectors: readonly NormalizedProviderDependencySelector[]
    readonly dependencyEdges: readonly NormalizedProviderDependencyEdge[]
    readonly ownershipEdges: readonly NormalizedProviderOwnershipEdge[]
    readonly providerCoverage: readonly NormalizedProviderCoverage[]
    readonly coverage: 'complete' | 'partial' | 'none'
}

interface ProviderDependencyReference {
    readonly lookupTokenId: string
    readonly target: ProviderDependencyTarget
}

export interface DependencyMetadataInvalidErrorDetails {
    readonly reason: string
    readonly dependencyIndex?: number
    readonly field?: string
}

export class DependencyMetadataInvalidError extends SagifireIocError<DependencyMetadataInvalidErrorDetails> {
    override readonly name = 'DependencyMetadataInvalidError'
    override readonly code = 'SAGIFIRE_IOC_DEPENDENCY_METADATA_INVALID'

    constructor(details: DependencyMetadataInvalidErrorDetails) {
        super({
            code: 'SAGIFIRE_IOC_DEPENDENCY_METADATA_INVALID',
            message: 'Provider dependency metadata is structurally invalid',
            details
        })

        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export type ProviderDependencyDeclaration =
    | {
          readonly access: 'instance'
          readonly cardinality: ProviderDependencyCardinality
          readonly target: ProviderDependencyReference
      }
    | {
          readonly access: 'deferred'
          readonly cardinality: ProviderDependencyCardinality
          readonly target: ProviderDependencyReference
          readonly via: ProviderDependencyReference
          readonly scope: 'caller'
      }

const providerDependencyReferencesBridge = Symbol('sagifire.ioc.provider-dependency-references')

interface ProviderDependencyOptionsWithReferences extends ProviderDependencyOptions {
    readonly [providerDependencyReferencesBridge]: readonly {
        readonly target: ProviderDependencyReference
        readonly via: ProviderDependencyReference | undefined
    }[]
}

export interface ProviderDependencyTokenMapping {
    readonly token: Token<unknown>
    readonly target: ProviderDependencyTarget
}

export function mapProviderDependencyOptions(
    options: ProviderDependencyOptions | undefined,
    mapToken: (token: Token<unknown>) => ProviderDependencyTokenMapping
): ProviderDependencyOptions | undefined {
    if (options === undefined) {
        return undefined
    }

    assertProviderDependencyOptions(options)

    const references: {
        readonly target: ProviderDependencyReference
        readonly via: ProviderDependencyReference | undefined
    }[] = []
    const dependencies = options.dependencies.map((dependency) => {
        const target = mapToken(dependency.token)
        const targetReference = Object.freeze({
            lookupTokenId: target.token.id,
            target: target.target
        })

        if (dependency.access === 'instance') {
            references.push(Object.freeze({ target: targetReference, via: undefined }))

            return Object.freeze({
                token: target.token,
                access: 'instance' as const,
                ...(dependency.cardinality === undefined
                    ? {}
                    : { cardinality: dependency.cardinality })
            })
        }

        const via = mapToken(dependency.via)
        const viaReference = Object.freeze({
            lookupTokenId: via.token.id,
            target: via.target
        })

        references.push(Object.freeze({ target: targetReference, via: viaReference }))

        return Object.freeze({
            token: target.token,
            access: 'deferred' as const,
            via: via.token,
            scope: 'caller' as const,
            ...(dependency.cardinality === undefined ? {} : { cardinality: dependency.cardinality })
        })
    })

    return Object.freeze({
        dependencies: Object.freeze(dependencies),
        [providerDependencyReferencesBridge]: Object.freeze(references)
    })
}

export function createProviderDependencyDeclarations(
    options: ProviderDependencyOptions | undefined
): readonly ProviderDependencyDeclaration[] | undefined {
    if (options === undefined) {
        return undefined
    }

    assertProviderDependencyOptions(options)

    const bridged = options as Partial<ProviderDependencyOptionsWithReferences>
    const references = bridged[providerDependencyReferencesBridge]

    return Object.freeze(
        options.dependencies.map((dependency, index) => {
            const bridgedReference = references?.[index]
            const target =
                bridgedReference?.target ??
                Object.freeze({
                    lookupTokenId: dependency.token.id,
                    target: Object.freeze({
                        visibility: 'public' as const,
                        tokenId: dependency.token.id
                    })
                })
            const cardinality = dependency.cardinality ?? 'single'

            if (dependency.access === 'instance') {
                return Object.freeze({
                    access: 'instance' as const,
                    cardinality,
                    target
                })
            }

            const via =
                bridgedReference?.via ??
                Object.freeze({
                    lookupTokenId: dependency.via.id,
                    target: Object.freeze({
                        visibility: 'public' as const,
                        tokenId: dependency.via.id
                    })
                })

            return Object.freeze({
                access: 'deferred' as const,
                cardinality,
                target,
                via,
                scope: 'caller' as const
            })
        })
    )
}

export const providerGraphSnapshotBridge = Symbol('sagifire.ioc.provider-graph-snapshot')

export interface ProviderGraphSnapshotAwareRuntime {
    readonly [providerGraphSnapshotBridge]: NormalizedProviderGraphSnapshot
}

export function getProviderGraphSnapshot(runtime: unknown): NormalizedProviderGraphSnapshot {
    const awareRuntime = runtime as Partial<ProviderGraphSnapshotAwareRuntime>
    const snapshot = awareRuntime[providerGraphSnapshotBridge]

    if (snapshot === undefined) {
        throw new Error('Container runtime does not expose a provider graph snapshot')
    }

    return snapshot
}

export interface ProviderGraphRegistrationDescriptor {
    readonly identity: ProviderRegistrationIdentity
    readonly providerKind: ProviderNodeKind
    readonly lifetime: 'singleton' | 'transient' | 'scoped' | undefined
    readonly initialization: 'lazy' | 'eager'
    readonly dependencies: readonly ProviderDependencyDeclaration[] | undefined
}

export function createNormalizedProviderGraphSnapshot(
    registrations: ReadonlyMap<
        string,
        | {
              readonly kind: 'single'
              readonly provider: ProviderGraphRegistrationDescriptor
          }
        | {
              readonly kind: 'multi'
              readonly providers: readonly ProviderGraphRegistrationDescriptor[]
          }
    >
): NormalizedProviderGraphSnapshot {
    const nodes: NormalizedProviderNode[] = []
    const selectors: NormalizedProviderDependencySelector[] = []
    const dependencyEdges: NormalizedProviderDependencyEdge[] = []
    const ownershipEdges: NormalizedProviderOwnershipEdge[] = []
    const providerCoverage: NormalizedProviderCoverage[] = []
    let dependencyCapableCount = 0
    let declaredCount = 0

    for (const registration of registrations.values()) {
        const providers =
            registration.kind === 'single' ? [registration.provider] : registration.providers

        for (const provider of providers) {
            const key = provider.identity.key

            nodes.push(
                Object.freeze({
                    key,
                    registrationKind: provider.identity.registrationKind,
                    providerKind: provider.providerKind,
                    lifetime: provider.lifetime,
                    initialization: provider.initialization
                })
            )

            const dependencyCapable =
                provider.providerKind === 'factory' ||
                provider.providerKind === 'async-factory' ||
                provider.providerKind === 'async-resource'
            const coverage: ProviderDependencyCoverage = dependencyCapable
                ? provider.dependencies === undefined
                    ? 'undeclared'
                    : 'declared'
                : 'not-applicable'

            if (dependencyCapable) {
                dependencyCapableCount += 1

                if (coverage === 'declared') {
                    declaredCount += 1
                }
            }

            providerCoverage.push(Object.freeze({ provider: key, coverage }))

            for (const [selectorIndex, declaration] of (provider.dependencies ?? []).entries()) {
                const targetRegistration = registrations.get(declaration.target.lookupTokenId)
                const viaRegistration =
                    declaration.access === 'deferred'
                        ? registrations.get(declaration.via.lookupTokenId)
                        : undefined

                selectors.push(
                    createSelector(
                        key,
                        selectorIndex,
                        declaration,
                        getTargetRegistrationKind(targetRegistration),
                        getTargetRegistrationKind(viaRegistration)
                    )
                )

                const targets = selectTargetProviders(targetRegistration, declaration.cardinality)

                for (const target of targets) {
                    dependencyEdges.push(
                        Object.freeze({
                            selectorIndex,
                            consumer: key,
                            dependency: target.identity.key,
                            access: declaration.access
                        })
                    )
                }
            }

            if (provider.providerKind === 'async-resource') {
                if (provider.lifetime === 'singleton') {
                    ownershipEdges.push(Object.freeze({ provider: key, owner: 'runtime' }))
                } else if (provider.lifetime === 'scoped') {
                    ownershipEdges.push(Object.freeze({ provider: key, owner: 'scope' }))
                }
            }
        }
    }

    const coverage =
        dependencyCapableCount === 0 || declaredCount === dependencyCapableCount
            ? 'complete'
            : declaredCount === 0
              ? 'none'
              : 'partial'

    return Object.freeze({
        nodes: Object.freeze(nodes),
        selectors: Object.freeze(selectors),
        dependencyEdges: Object.freeze(dependencyEdges),
        ownershipEdges: Object.freeze(ownershipEdges),
        providerCoverage: Object.freeze(providerCoverage),
        coverage
    })
}

function createSelector(
    consumer: ProviderRegistrationKey,
    selectorIndex: number,
    declaration: ProviderDependencyDeclaration,
    targetRegistrationKind: ProviderTargetRegistrationKind,
    viaRegistrationKind: ProviderTargetRegistrationKind
): NormalizedProviderDependencySelector {
    if (declaration.access === 'instance') {
        return Object.freeze({
            selectorIndex,
            consumer,
            target: declaration.target.target,
            access: declaration.access,
            cardinality: declaration.cardinality,
            targetRegistrationKind
        })
    }

    return Object.freeze({
        selectorIndex,
        consumer,
        target: declaration.target.target,
        access: declaration.access,
        cardinality: declaration.cardinality,
        targetRegistrationKind,
        via: declaration.via.target,
        viaRegistrationKind,
        scope: declaration.scope
    })
}

function getTargetRegistrationKind(
    registration:
        | {
              readonly kind: 'single' | 'multi'
          }
        | undefined
): ProviderTargetRegistrationKind {
    return registration?.kind ?? 'missing'
}

function assertProviderDependencyOptions(options: ProviderDependencyOptions): void {
    if (!isRecord(options) || !Array.isArray(options.dependencies)) {
        throw new DependencyMetadataInvalidError({
            reason: 'dependencies must be an array',
            field: 'dependencies'
        })
    }

    options.dependencies.forEach((dependency, dependencyIndex) => {
        if (!isRecord(dependency)) {
            throw new DependencyMetadataInvalidError({
                reason: 'dependency must be an object',
                dependencyIndex
            })
        }

        assertTokenLike(dependency.token, dependencyIndex, 'token')

        if (dependency.access !== 'instance' && dependency.access !== 'deferred') {
            throw new DependencyMetadataInvalidError({
                reason: 'access must be instance or deferred',
                dependencyIndex,
                field: 'access'
            })
        }

        if (
            dependency.cardinality !== undefined &&
            dependency.cardinality !== 'single' &&
            dependency.cardinality !== 'multi'
        ) {
            throw new DependencyMetadataInvalidError({
                reason: 'cardinality must be single or multi',
                dependencyIndex,
                field: 'cardinality'
            })
        }

        if (dependency.access === 'deferred') {
            assertTokenLike(dependency.via, dependencyIndex, 'via')

            if (dependency.scope !== 'caller') {
                throw new DependencyMetadataInvalidError({
                    reason: 'deferred dependency scope must be caller',
                    dependencyIndex,
                    field: 'scope'
                })
            }
        }
    })
}

function assertTokenLike(value: unknown, dependencyIndex: number, field: string): void {
    if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0) {
        throw new DependencyMetadataInvalidError({
            reason: `${field} must be a token`,
            dependencyIndex,
            field
        })
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function selectTargetProviders(
    registration:
        | {
              readonly kind: 'single'
              readonly provider: ProviderGraphRegistrationDescriptor
          }
        | {
              readonly kind: 'multi'
              readonly providers: readonly ProviderGraphRegistrationDescriptor[]
          }
        | undefined,
    cardinality: ProviderDependencyCardinality
): readonly ProviderGraphRegistrationDescriptor[] {
    if (registration === undefined) {
        return []
    }

    if (cardinality === 'single') {
        return registration.kind === 'single' ? [registration.provider] : []
    }

    return registration.kind === 'multi' ? registration.providers : []
}
