import {
    createComposer,
    createGraphExportDocument,
    defineModule,
    formatDiagnostics,
    namespace,
    renderGraphExportDot,
    renderGraphExportMermaid,
    serializeGraphExport
} from '@sagifire/ioc'

interface AuthUser {
    readonly id: string
    readonly roles: readonly string[]
}

interface AuthPublicApi {
    requireUser(): AuthUser
}

interface ContactRequestsAuthReader {
    currentUserId(): string
    canSubmitContactRequest(): boolean
}

interface ContactRequestsPublicApi {
    submit(subject: string): string
}

interface ContactRequestsRepository {
    save(input: { readonly subject: string; readonly userId: string }): string
}

interface AuditEvent {
    readonly type: string
    readonly subject: string
}

interface AuditSink {
    record(event: AuditEvent): void
}

interface AdminContribution {
    readonly label: string
    render(): string
}

const authTokens = namespace('examples.module-composition.auth')
const contactTokens = namespace('examples.module-composition.contact-requests')

const AUTH_PUBLIC_API = authTokens.token<AuthPublicApi>('public-api')
const CONTACT_REQUESTS_AUTH_READER = contactTokens.token<ContactRequestsAuthReader>('auth-reader')
const CONTACT_REQUESTS_PUBLIC_API = contactTokens.token<ContactRequestsPublicApi>('public-api')
const CONTACT_REQUESTS_REPOSITORY = contactTokens.token<ContactRequestsRepository>('repository')
const CONTACT_REQUEST_EVENTS = contactTokens.multiToken<AuditEvent>('events')
const CONTACT_REQUEST_AUDIT_SINKS = contactTokens.multiToken<AuditSink>('audit-sinks')
const CONTACT_REQUEST_ADMIN_CONTRIBUTIONS =
    contactTokens.multiToken<AdminContribution>('admin-contributions')

const authModule = defineModule({
    id: 'auth',
    provides: [
        {
            token: AUTH_PUBLIC_API,
            kind: 'public-api',
            description: 'Authentication module public API'
        }
    ],
    setup(context): void {
        context.bind(AUTH_PUBLIC_API).toValue({
            requireUser(): AuthUser {
                return {
                    id: 'user-1',
                    roles: ['contact-request:submit']
                }
            }
        })
    }
})

const contactRequestsModule = defineModule({
    id: 'contact-requests',
    requires: [
        {
            token: CONTACT_REQUESTS_AUTH_READER,
            description: 'Consumer-owned auth reader port'
        },
        {
            token: CONTACT_REQUEST_AUDIT_SINKS,
            required: false,
            cardinality: 'multi',
            description: 'Optional audit sinks for contact request events'
        }
    ],
    provides: [
        {
            token: CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api',
            description: 'Contact request use cases'
        },
        {
            token: CONTACT_REQUEST_EVENTS,
            kind: 'event-publisher',
            cardinality: 'multi',
            description: 'Contact request audit events'
        },
        {
            token: CONTACT_REQUEST_ADMIN_CONTRIBUTIONS,
            kind: 'admin-contribution',
            cardinality: 'multi',
            description: 'Contact request admin UI contributions'
        }
    ],
    setup(context): void {
        context.bind(CONTACT_REQUESTS_REPOSITORY).toValue({
            save(input): string {
                return `contact-request:${input.userId}:${input.subject}`
            }
        })
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory(({ get, getAll }) => {
            const auth = get(CONTACT_REQUESTS_AUTH_READER)
            const repository = get(CONTACT_REQUESTS_REPOSITORY)
            const auditSinks = getAll(CONTACT_REQUEST_AUDIT_SINKS)

            return {
                submit(subject): string {
                    if (!auth.canSubmitContactRequest()) {
                        throw new Error('Current user cannot submit contact requests')
                    }

                    const savedId = repository.save({
                        subject,
                        userId: auth.currentUserId()
                    })
                    const event = {
                        type: 'contact-request-submitted',
                        subject: savedId
                    }

                    for (const sink of auditSinks) {
                        sink.record(event)
                    }

                    return `${savedId}:sinks=${auditSinks.length}`
                }
            }
        })
        context.add(CONTACT_REQUEST_EVENTS).toFactory(({ get }) => {
            const auth = get(CONTACT_REQUESTS_AUTH_READER)

            return {
                type: 'contact-request-submitted',
                subject: auth.currentUserId()
            }
        })
        context.add(CONTACT_REQUEST_ADMIN_CONTRIBUTIONS).toValue({
            label: 'Contact requests',
            render(): string {
                return 'admin:contact-requests'
            }
        })
    }
})

async function main(): Promise<void> {
    const composer = createComposer().use(authModule).use(contactRequestsModule)

    composer
        .adapt(CONTACT_REQUESTS_AUTH_READER)
        .from(AUTH_PUBLIC_API)
        .using((auth) => {
            return {
                currentUserId(): string {
                    return auth.requireUser().id
                },
                canSubmitContactRequest(): boolean {
                    return auth.requireUser().roles.includes('contact-request:submit')
                }
            }
        })
    composer.add(CONTACT_REQUEST_ADMIN_CONTRIBUTIONS).toValue({
        label: 'Root shortcut',
        render(): string {
            return 'admin:root-shortcut'
        }
    })

    const validation = composer.validate()

    if (!validation.ok) {
        throw new Error(formatDiagnostics(validation))
    }

    const inspection = composer.inspect()
    const graphDocument = createGraphExportDocument(inspection)
    const graphJson = serializeGraphExport(graphDocument)
    const graphDot = renderGraphExportDot(graphDocument, { direction: 'LR' })
    const graphMermaid = renderGraphExportMermaid(graphDocument, { direction: 'LR' })
    const authBindingEdge = inspection.edges.find((edge) => {
        return (
            edge.edgeKind === 'binding' &&
            edge.bindingKind === 'adapter' &&
            edge.consumerModuleId === 'contact-requests' &&
            edge.requiredTokenId === CONTACT_REQUESTS_AUTH_READER.id
        )
    })
    const authAdapterSourceEdge = inspection.edges.find((edge) => {
        return (
            edge.edgeKind === 'adapter-source' &&
            edge.consumerModuleId === 'contact-requests' &&
            edge.adapterTargetTokenId === CONTACT_REQUESTS_AUTH_READER.id &&
            edge.adapterSourceTokenId === AUTH_PUBLIC_API.id
        )
    })
    const optionalAuditSinks = inspection.requiredPorts.find((port) => {
        return port.tokenId === CONTACT_REQUEST_AUDIT_SINKS.id
    })
    const adminContributions = inspection.capabilities.find((capability) => {
        return (
            capability.tokenId === CONTACT_REQUEST_ADMIN_CONTRIBUTIONS.id &&
            capability.cardinality === 'multi'
        )
    })

    assert(authBindingEdge !== undefined, 'expected adapter binding edge')
    assert(authAdapterSourceEdge !== undefined, 'expected graph-aware adapter source edge')
    assertEqual(inspection.requiredPorts[0]?.satisfiedBy, 'binding', 'required port satisfaction')
    assertEqual(optionalAuditSinks?.satisfiedBy, 'optional', 'optional multi dependency')
    assertEqual(optionalAuditSinks?.providerCount, 0, 'optional multi provider count')
    assertEqual(inspection.bindings[0]?.tokenId, CONTACT_REQUESTS_AUTH_READER.id, 'binding token')
    assertEqual(inspection.bindings[0]?.kind, 'adapter', 'binding kind')
    assertEqual(adminContributions?.providers.length, 2, 'admin contribution provider count')
    assert(graphJson.includes('"schemaVersion": "1"'), 'expected canonical JSON export')
    assert(graphDot.startsWith('digraph "SagifireIocGraph"'), 'expected DOT export')
    assert(graphMermaid.startsWith('flowchart LR'), 'expected Mermaid export')
    assertEqual(adminContributions?.providers[0]?.source, 'module', 'module contribution source')
    assertEqual(
        adminContributions?.providers[1]?.source,
        'composition-root',
        'composition-root contribution source'
    )

    const runtime = await composer.compose()

    try {
        const contactRequests = runtime.get(CONTACT_REQUESTS_PUBLIC_API)
        const savedId = contactRequests.submit('demo')
        const auditEvents = runtime.getAll(CONTACT_REQUEST_EVENTS)
        const adminItems = runtime.getAll(CONTACT_REQUEST_ADMIN_CONTRIBUTIONS)

        assertEqual(savedId, 'contact-request:user-1:demo:sinks=0', 'saved contact request id')
        assertEqual(auditEvents.length, 1, 'audit event count')
        assertEqual(auditEvents[0]?.subject, 'user-1', 'audit event subject')
        assertEqual(adminItems.length, 2, 'admin contribution count')
        assertEqual(adminItems[0]?.render(), 'admin:contact-requests', 'module admin item')
        assertEqual(adminItems[1]?.render(), 'admin:root-shortcut', 'root admin item')
        assertThrows(() => runtime.get(CONTACT_REQUESTS_AUTH_READER), 'required port visibility')
        assertThrows(() => runtime.get(CONTACT_REQUESTS_REPOSITORY), 'private provider visibility')
    } finally {
        await runtime.dispose()
    }
}

function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message)
    }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
    if (actual !== expected) {
        throw new Error(`${label}: expected ${String(expected)}, received ${String(actual)}`)
    }
}

function assertThrows(callback: () => void, label: string): void {
    try {
        callback()
    } catch {
        return
    }

    throw new Error(`${label}: expected callback to throw`)
}

await main()
