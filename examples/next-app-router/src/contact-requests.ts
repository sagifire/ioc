import { defineModule, token } from '@sagifire/ioc'

export interface ContactSummary {
    readonly id: string
    readonly requestId: string
}

export interface SubmitContactInput {
    readonly requestId: string
    readonly email: string
    readonly message: string
}

export interface SubmitContactResult {
    readonly requestId: string
    readonly accepted: boolean
    readonly summary: string
}

export interface ContactRequestsPublicApi {
    getContact(id: string): Promise<ContactSummary>
    submitContact(input: SubmitContactInput): Promise<SubmitContactResult>
}

export const REQUEST_ID = token<string>('examples.next.request-id')
export const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsPublicApi>(
    'examples.next.contact-requests.public-api'
)

export const requestContextModule = defineModule({
    id: 'examples-next-request-context',
    provides: [
        {
            token: REQUEST_ID,
            kind: 'shared-service'
        }
    ],
    setup(context): void {
        context.bind(REQUEST_ID).toFactory(() => {
            throw new Error('REQUEST_ID must be supplied by the route or action scope')
        })
    }
})

export const contactRequestsModule = defineModule({
    id: 'examples-next-contact-requests',
    requires: [
        {
            token: REQUEST_ID
        }
    ],
    provides: [
        {
            token: CONTACT_REQUESTS_PUBLIC_API,
            kind: 'public-api'
        }
    ],
    setup(context): void {
        context.bind(CONTACT_REQUESTS_PUBLIC_API).toFactory((resolutionContext) => {
            const requestId = resolutionContext.get(REQUEST_ID)

            return createContactRequestsPublicApi(requestId)
        })
    }
})

function createContactRequestsPublicApi(requestId: string): ContactRequestsPublicApi {
    return {
        async getContact(id: string): Promise<ContactSummary> {
            return {
                id,
                requestId
            }
        },

        async submitContact(input: SubmitContactInput): Promise<SubmitContactResult> {
            return {
                requestId,
                accepted: true,
                summary: `${input.email}:${input.message}`
            }
        }
    }
}
