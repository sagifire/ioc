'use server'

import { withServerActionScope } from '@sagifire/ioc-next'

import {
    CONTACT_REQUESTS_PUBLIC_API,
    type SubmitContactInput,
    type SubmitContactResult
} from '../../src/contact-requests.js'
import { appRuntime } from '../../src/app-runtime.js'
import { createRequestContext } from '../../src/request-context.js'

export const submitContact = withServerActionScope(
    appRuntime,
    (input: SubmitContactInput) => {
        return {
            context: {
                actionName: 'submit-contact'
            },
            actionContext: createRequestContext(input.requestId)
        }
    },
    async ({ scope }, input): Promise<SubmitContactResult> => {
        const contactRequests = scope.get(CONTACT_REQUESTS_PUBLIC_API)

        return contactRequests.submitContact(input)
    }
)
