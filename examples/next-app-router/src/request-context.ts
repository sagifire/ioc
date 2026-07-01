import { createNextRequestContext, nextRequestValue } from '@sagifire/ioc-next'

import { REQUEST_ID } from './contact-requests.js'

export function createRequestContext(requestId: string) {
    return createNextRequestContext({
        values: [nextRequestValue(REQUEST_ID, requestId)]
    })
}
