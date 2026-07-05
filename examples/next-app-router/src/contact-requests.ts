import { defineModule, namespace } from '@sagifire/ioc'

export interface ContactRequestContext {
    readonly requestId: string
    readonly tags: readonly string[]
}

export interface ContactSummary {
    readonly id: string
    readonly requestId: string
    readonly contextTags: readonly string[]
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
    readonly contextTags: readonly string[]
}

export interface ContactRequestsPublicApi {
    getContact(id: string): Promise<ContactSummary>
    submitContact(input: SubmitContactInput): Promise<SubmitContactResult>
}

const examplesNext = namespace('examples.next')

export const REQUEST_ID = examplesNext.token<string>('request-id')
export const REQUEST_TAGS = examplesNext.multiToken<string>('request-tags')
export const CONTACT_REQUESTS_PUBLIC_API = examplesNext.token<ContactRequestsPublicApi>(
    'contact-requests.public-api'
)

export const requestContextModule = defineModule({
    id: 'examples-next-request-context',
    provides: [
        {
            token: REQUEST_ID,
            kind: 'shared-service'
        },
        {
            token: REQUEST_TAGS,
            kind: 'shared-service',
            cardinality: 'multi'
        }
    ],
    setup(context): void {
        context.bind(REQUEST_ID).toFactory(() => {
            throw new Error('REQUEST_ID must be supplied by the route or action scope')
        })
        context.add(REQUEST_TAGS).toValue('runtime:next-app-router')
    }
})

export const contactRequestsModule = defineModule({
    id: 'examples-next-contact-requests',
    requires: [
        {
            token: REQUEST_ID
        },
        {
            token: REQUEST_TAGS,
            cardinality: 'multi'
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
            const tags = resolutionContext.getAll(REQUEST_TAGS)

            return createContactRequestsPublicApi({
                requestId,
                tags
            })
        })
    }
})

function createContactRequestsPublicApi(context: ContactRequestContext): ContactRequestsPublicApi {
    const contextTags = Object.freeze([...context.tags])

    return {
        async getContact(id: string): Promise<ContactSummary> {
            return {
                id,
                requestId: context.requestId,
                contextTags
            }
        },

        async submitContact(input: SubmitContactInput): Promise<SubmitContactResult> {
            return {
                requestId: context.requestId,
                accepted: true,
                summary: `${input.email}:${input.message}`,
                contextTags
            }
        }
    }
}
