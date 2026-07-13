import { SagifireIocError } from './diagnostics'
import type { Diagnostic } from './diagnostics'
import { providerRegistrationKeysEqual } from './provider-identity'
import type { ProviderRegistrationKey } from './provider-identity'
import type {
    NormalizedProviderDependencySelector,
    NormalizedProviderGraphSnapshot,
    NormalizedProviderNode,
    ProviderDependencyTarget
} from './provider-metadata'

export type LifetimeValidationMode = 'off' | 'report' | 'enforce'

export type LifetimeValidationCoverageMode = 'ignore' | 'summary'

export type LifetimeValidationEvidence = 'proven-unsafe' | 'lifetime-sensitive' | 'unknown'

export interface LifetimeValidationOptions {
    readonly mode?: LifetimeValidationMode
    readonly coverage?: LifetimeValidationCoverageMode
}

export interface LifetimeValidationReport {
    readonly mode: LifetimeValidationMode
    readonly blocked: boolean
    readonly coverage: NormalizedProviderGraphSnapshot['coverage']
    readonly diagnostics: readonly Diagnostic[]
}

export const lifetimeValidationReportBridge = Symbol('sagifire.ioc.lifetime-validation-report')

export interface LifetimeValidationReportAwareRuntime {
    readonly [lifetimeValidationReportBridge]: LifetimeValidationReport
}

export function getLifetimeValidationReport(runtime: unknown): LifetimeValidationReport {
    const awareRuntime = runtime as Partial<LifetimeValidationReportAwareRuntime>
    const report = awareRuntime[lifetimeValidationReportBridge]

    if (report === undefined) {
        throw new Error('Container runtime does not expose a lifetime validation report')
    }

    return report
}

export interface LifetimeValidationErrorDetails {
    readonly report: LifetimeValidationReport
}

export class LifetimeValidationError extends SagifireIocError<LifetimeValidationErrorDetails> {
    override readonly name = 'LifetimeValidationError'
    override readonly code = 'SAGIFIRE_IOC_LIFETIME_VALIDATION_BLOCKED'
    readonly report: LifetimeValidationReport

    constructor(report: LifetimeValidationReport) {
        super({
            code: 'SAGIFIRE_IOC_LIFETIME_VALIDATION_BLOCKED',
            message: 'Provider lifetime validation blocked runtime creation',
            details: {
                report
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.report = report
    }
}

export function validateProviderLifetimes(
    snapshot: NormalizedProviderGraphSnapshot,
    options?: LifetimeValidationOptions
): LifetimeValidationReport {
    const mode = options?.mode ?? 'off'
    const coverageMode = options?.coverage ?? 'ignore'
    const diagnostics: Diagnostic[] = []
    let hasInvalidMetadata = false
    let hasUnsafeCapture = false

    for (const selector of snapshot.selectors) {
        const selectorDiagnostics = validateSelector(selector)

        if (selectorDiagnostics.length > 0) {
            hasInvalidMetadata = true
            diagnostics.push(...selectorDiagnostics)
        }
    }

    if (mode !== 'off') {
        for (const edge of snapshot.dependencyEdges) {
            if (edge.access !== 'instance') {
                continue
            }

            const consumer = findNode(snapshot.nodes, edge.consumer)
            const dependency = findNode(snapshot.nodes, edge.dependency)

            if (consumer === undefined || dependency === undefined) {
                continue
            }

            const evidence = classifyLifetimeEvidence(consumer, dependency)

            if (evidence === undefined) {
                continue
            }

            if (evidence === 'proven-unsafe') {
                hasUnsafeCapture = true
            }

            diagnostics.push(
                createCaptureDiagnostic(
                    evidence,
                    consumer,
                    dependency,
                    findOwner(snapshot, dependency.key)
                )
            )
        }

        if (coverageMode === 'summary' && snapshot.coverage !== 'complete') {
            diagnostics.push(
                Object.freeze({
                    code: 'SAGIFIRE_IOC_DEPENDENCY_METADATA_INCOMPLETE',
                    severity: 'warning' as const,
                    message: `Provider dependency metadata coverage is ${snapshot.coverage}`,
                    details: Object.freeze({
                        coverage: snapshot.coverage,
                        evidence: 'unknown' as const
                    })
                })
            )
        }
    }

    return Object.freeze({
        mode,
        blocked: hasInvalidMetadata || (mode === 'enforce' && hasUnsafeCapture),
        coverage: snapshot.coverage,
        diagnostics: Object.freeze(diagnostics)
    })
}

function validateSelector(selector: NormalizedProviderDependencySelector): readonly Diagnostic[] {
    const diagnostics: Diagnostic[] = []

    if (selector.cardinality === 'single') {
        if (selector.targetRegistrationKind === 'missing') {
            diagnostics.push(
                createInvalidMetadataDiagnostic(selector, 'missing-target', selector.target)
            )
        } else if (selector.targetRegistrationKind !== 'single') {
            diagnostics.push(
                createInvalidMetadataDiagnostic(
                    selector,
                    'target-cardinality-mismatch',
                    selector.target
                )
            )
        }
    } else if (selector.targetRegistrationKind === 'single') {
        diagnostics.push(
            createInvalidMetadataDiagnostic(
                selector,
                'target-cardinality-mismatch',
                selector.target
            )
        )
    }

    if (selector.access === 'deferred' && selector.viaRegistrationKind !== 'single') {
        diagnostics.push(
            createInvalidMetadataDiagnostic(
                selector,
                selector.viaRegistrationKind === 'missing'
                    ? 'missing-deferred-handle'
                    : 'deferred-handle-cardinality-mismatch',
                selector.via
            )
        )
    }

    return diagnostics
}

function createInvalidMetadataDiagnostic(
    selector: NormalizedProviderDependencySelector,
    reason:
        | 'missing-target'
        | 'target-cardinality-mismatch'
        | 'missing-deferred-handle'
        | 'deferred-handle-cardinality-mismatch',
    invalidTarget: ProviderDependencyTarget
): Diagnostic {
    return Object.freeze({
        code: 'SAGIFIRE_IOC_DEPENDENCY_METADATA_INVALID',
        severity: 'error' as const,
        message: `Provider dependency metadata is invalid: ${formatInvalidReason(reason)}`,
        details: Object.freeze({
            reason,
            consumer: selector.consumer,
            selectorIndex: selector.selectorIndex,
            target: invalidTarget,
            declaredCardinality: selector.cardinality,
            actualRegistrationKind:
                invalidTarget === selector.target
                    ? selector.targetRegistrationKind
                    : selector.access === 'deferred'
                      ? selector.viaRegistrationKind
                      : 'missing'
        })
    })
}

function formatInvalidReason(
    reason:
        | 'missing-target'
        | 'target-cardinality-mismatch'
        | 'missing-deferred-handle'
        | 'deferred-handle-cardinality-mismatch'
): string {
    switch (reason) {
        case 'missing-target':
            return 'the declared single target is missing'
        case 'target-cardinality-mismatch':
            return 'the declared target cardinality does not match its registration'
        case 'missing-deferred-handle':
            return 'the deferred handle target is missing'
        case 'deferred-handle-cardinality-mismatch':
            return 'the deferred handle must resolve through a single registration'
    }
}

function classifyLifetimeEvidence(
    consumer: NormalizedProviderNode,
    dependency: NormalizedProviderNode
): Exclude<LifetimeValidationEvidence, 'unknown'> | undefined {
    if (consumer.lifetime === undefined || dependency.lifetime === undefined) {
        return undefined
    }

    if (consumer.lifetime === 'singleton' && dependency.lifetime === 'scoped') {
        return 'proven-unsafe'
    }

    if (dependency.lifetime === 'transient') {
        return 'lifetime-sensitive'
    }

    if (consumer.lifetime === 'transient' && dependency.lifetime === 'scoped') {
        return 'lifetime-sensitive'
    }

    return undefined
}

function createCaptureDiagnostic(
    evidence: Exclude<LifetimeValidationEvidence, 'unknown'>,
    consumer: NormalizedProviderNode,
    dependency: NormalizedProviderNode,
    dependencyOwner: 'runtime' | 'scope' | undefined
): Diagnostic {
    const unsafe = evidence === 'proven-unsafe'

    return Object.freeze({
        code: unsafe
            ? 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE'
            : 'SAGIFIRE_IOC_LIFETIME_CAPTURE_SENSITIVE',
        severity: unsafe ? ('error' as const) : ('warning' as const),
        message: unsafe
            ? 'A longer-lived provider directly captures a scoped dependency'
            : 'A direct provider dependency has lifetime-sensitive retention semantics',
        details: Object.freeze({
            consumer: consumer.key,
            dependency: dependency.key,
            access: 'instance' as const,
            consumerLifetime: consumer.lifetime,
            dependencyLifetime: dependency.lifetime,
            dependencyOwner,
            evidence
        })
    })
}

function findNode(
    nodes: readonly NormalizedProviderNode[],
    key: ProviderRegistrationKey
): NormalizedProviderNode | undefined {
    return nodes.find((node) => providerRegistrationKeysEqual(node.key, key))
}

function findOwner(
    snapshot: NormalizedProviderGraphSnapshot,
    key: ProviderRegistrationKey
): 'runtime' | 'scope' | undefined {
    return snapshot.ownershipEdges.find((edge) => {
        return providerRegistrationKeysEqual(edge.provider, key)
    })?.owner
}
