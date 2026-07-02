import { withRouteScope } from '@sagifire/ioc-next'

import {
    CONTACT_REQUESTS_PUBLIC_API,
    type ContactSummary
} from '../../../../src/contact-requests.js'
import { json, type JsonResponse } from '../../../../src/http.js'
import { appRuntime } from '../../../../src/app-runtime.js'
import { createRouteRequestContext } from '../../../../src/request-context.js'

export interface RouteRequest {
    readonly method: string
    readonly url: string
}

export interface RouteContext {
    readonly params: {
        readonly id: string
    }
}

export function GET(
    request: RouteRequest,
    context: RouteContext
): Promise<JsonResponse<ContactSummary>> {
    return withRouteScope(
        appRuntime,
        {
            request,
            context,
            requestContext: createRouteRequestContext(request, context.params.id)
        },
        async ({ scope }) => {
            const contactRequests = scope.get(CONTACT_REQUESTS_PUBLIC_API)
            const contact = await contactRequests.getContact(context.params.id)

            return json(contact)
        }
    )
}
