import { createComposer, defineModule, formatDiagnostics, namespace } from '@sagifire/ioc'

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

const authTokens = namespace('examples.module-composition.auth')
const contactTokens = namespace('examples.module-composition.contact-requests')

const AUTH_PUBLIC_API = authTokens.token<AuthPublicApi>('public-api')
const CONTACT_REQUESTS_AUTH_READER = contactTokens.token<ContactRequestsAuthReader>('auth-reader')
const CONTACT_REQUESTS_PUBLIC_API = contactTokens.token<ContactRequestsPublicApi>('public-api')
const CONTACT_REQUESTS_REPOSITORY = contactTokens.token<ContactRequestsRepository>('repository')
const CONTACT_REQUEST_EVENTS = contactTokens.token<AuditEvent>('events')

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
            description: 'Contact request audit events'
        }
    ],
    setup(context): void {
        context.bind(CONTACT_REQUESTS_REPOSITORY).toValue({
            save(input): string {
                return `contact-request:${input.userId}:${input.subject}`
            }
        })
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory(({ get }) => {
            const auth = get(CONTACT_REQUESTS_AUTH_READER)
            const repository = get(CONTACT_REQUESTS_REPOSITORY)

            return {
                submit(subject): string {
                    if (!auth.canSubmitContactRequest()) {
                        throw new Error('Current user cannot submit contact requests')
                    }

                    return repository.save({
                        subject,
                        userId: auth.currentUserId()
                    })
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
    }
})

async function main(): Promise<void> {
    const composer = createComposer().use(authModule).use(contactRequestsModule)

    composer.bind(CONTACT_REQUESTS_AUTH_READER).toFactory(({ get }) => {
        const auth = get(AUTH_PUBLIC_API)

        return {
            currentUserId(): string {
                return auth.requireUser().id
            },
            canSubmitContactRequest(): boolean {
                return auth.requireUser().roles.includes('contact-request:submit')
            }
        }
    })

    const validation = composer.validate()

    if (!validation.ok) {
        throw new Error(formatDiagnostics(validation))
    }

    const inspection = composer.inspect()
    const bindingEdge = inspection.edges.find((edge) => {
        return (
            edge.edgeKind === 'binding' &&
            edge.consumerModuleId === 'contact-requests' &&
            edge.requiredTokenId === CONTACT_REQUESTS_AUTH_READER.id
        )
    })

    assert(bindingEdge !== undefined, 'expected required port to be satisfied by a binding edge')
    assertEqual(inspection.requiredPorts[0]?.satisfiedBy, 'binding', 'required port satisfaction')
    assertEqual(inspection.bindings[0]?.tokenId, CONTACT_REQUESTS_AUTH_READER.id, 'binding token')

    const runtime = await composer.compose()

    try {
        const contactRequests = runtime.get(CONTACT_REQUESTS_PUBLIC_API)
        const savedId = contactRequests.submit('demo')
        const auditEvents = runtime.getAll(CONTACT_REQUEST_EVENTS)

        assertEqual(savedId, 'contact-request:user-1:demo', 'saved contact request id')
        assertEqual(auditEvents.length, 1, 'audit event count')
        assertEqual(auditEvents[0]?.subject, 'user-1', 'audit event subject')
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
