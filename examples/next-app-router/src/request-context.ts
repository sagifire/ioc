import {
    createNextRequestContext,
    nextRequestMultiValue,
    nextRequestValue,
    type NextRequestContext
} from '@sagifire/ioc-next'

import { REQUEST_ID, REQUEST_TAGS, type SubmitContactInput } from './contact-requests.js'

export interface RequestLike {
    readonly method: string
    readonly url: string
}

export interface ExampleRequestContextInput {
    readonly requestId: string
    readonly tags?: readonly string[]
}

export function createRequestContext(input: ExampleRequestContextInput): NextRequestContext {
    return createNextRequestContext({
        values: [nextRequestValue(REQUEST_ID, input.requestId)],
        multiValues: (input.tags ?? []).map((tag) => {
            return nextRequestMultiValue(REQUEST_TAGS, tag)
        })
    })
}

export function createRouteRequestContext(
    request: RequestLike,
    contactId: string
): NextRequestContext {
    return createRequestContext({
        requestId: contactId,
        tags: ['route:GET /api/contacts/[id]', `method:${request.method}`, `url:${request.url}`]
    })
}

export function createActionRequestContext(input: SubmitContactInput): NextRequestContext {
    return createRequestContext({
        requestId: input.requestId,
        tags: ['action:submit-contact']
    })
}
