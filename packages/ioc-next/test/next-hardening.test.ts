import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    createComposer,
    defineModule,
    token,
    type ComposedRuntime,
    type ContainerRuntime,
    type ScopeLocalValue
} from '@sagifire/ioc'
import {
    createNextRequestContext,
    createNextRuntime,
    nextRequestValue,
    withRouteScope,
    withServerActionScope,
    type NextRequestContext,
    type NextRuntimeHelper,
    type RouteHandlerScopeOptions,
    type ServerActionScopeOptionsFactory
} from '../src/index.js'

interface RouteRequest {
    readonly method: string
    readonly url: string
}

interface RouteContext {
    readonly params: {
        readonly id: string
    }
}

interface ContactSummary {
    readonly id: string
    readonly requestId: string
}

interface SubmitContactInput {
    readonly requestId: string
    readonly email: string
    readonly message: string
}

interface SubmitContactResult {
    readonly requestId: string
    readonly accepted: boolean
    readonly summary: string
}

interface ContactRequestsPublicApi {
    getContact(id: string): Promise<ContactSummary>
    submitContact(input: SubmitContactInput): Promise<SubmitContactResult>
}

interface ActionContext {
    readonly actionName: string
}

const REQUEST_ID = token<string>('next.hardening.request-id')
const CONTACT_REQUESTS_PUBLIC_API = token<ContactRequestsPublicApi>(
    'next.hardening.contact-requests.public-api'
)

describe('Next adapter final hardening', () => {
    test('keeps runtime helper cache ownership instance-local', async () => {
        let factoryCalls = 0
        const createRuntime = async (): Promise<ContainerRuntime> => {
            factoryCalls += 1

            return createAppRuntime()
        }
        const firstHelper = createNextRuntime(createRuntime)
        const secondHelper = createNextRuntime(createRuntime)

        const firstRuntime = await firstHelper.getRuntime()
        const secondRuntime = await secondHelper.getRuntime()
        const firstCachedRuntime = await firstHelper.getRuntime()
        const secondCachedRuntime = await secondHelper.getRuntime()

        expect(firstRuntime).toBe(firstCachedRuntime)
        expect(secondRuntime).toBe(secondCachedRuntime)
        expect(firstRuntime).not.toBe(secondRuntime)
        expect(factoryCalls).toBe(2)

        await firstRuntime.dispose()
        await secondRuntime.dispose()
    })

    test('runs App Router boundary callbacks through module public APIs', async () => {
        let composeCalls = 0
        const runtimeHelper = createNextRuntime(async () => {
            composeCalls += 1

            return createAppRuntime()
        })
        const request = {
            method: 'GET',
            url: 'https://example.test/api/contacts/contact-1'
        }
        const routeOptions: RouteHandlerScopeOptions<RouteRequest, RouteContext> = {
            request,
            context: {
                params: {
                    id: 'contact-1'
                }
            },
            requestContext: createRequestContext('route-request-1')
        }

        const routeResult = await withRouteScope(runtimeHelper, routeOptions, async ({ scope }) => {
            const contactRequests = scope.get(CONTACT_REQUESTS_PUBLIC_API)

            return contactRequests.getContact(routeOptions.context.params.id)
        })
        const submitContact = withServerActionScope(
            runtimeHelper,
            createActionOptions,
            async ({ scope }, input: SubmitContactInput) => {
                const contactRequests = scope.get(CONTACT_REQUESTS_PUBLIC_API)

                return contactRequests.submitContact(input)
            }
        )
        const actionResult = await submitContact({
            requestId: 'action-request-1',
            email: 'contact@example.test',
            message: 'hello'
        })

        expectTypeOf(runtimeHelper).toEqualTypeOf<NextRuntimeHelper<ComposedRuntime>>()
        expectTypeOf(routeOptions).toEqualTypeOf<
            RouteHandlerScopeOptions<RouteRequest, RouteContext>
        >()
        expectTypeOf(createActionOptions).toEqualTypeOf<
            ServerActionScopeOptionsFactory<[SubmitContactInput], ActionContext>
        >()
        expectTypeOf(routeResult).toEqualTypeOf<ContactSummary>()
        expectTypeOf(actionResult).toEqualTypeOf<SubmitContactResult>()
        expect(routeResult).toEqual({
            id: 'contact-1',
            requestId: 'route-request-1'
        })
        expect(actionResult).toEqual({
            requestId: 'action-request-1',
            accepted: true,
            summary: 'contact@example.test:hello'
        })
        expect(composeCalls).toBe(1)

        const runtime = await runtimeHelper.getRuntime()

        await runtime.dispose()
    })

    test('exposes explicit context data without hidden current request or action access', () => {
        const requestContext = createRequestContext('typed-request')

        expectTypeOf(requestContext).toEqualTypeOf<NextRequestContext>()
        expectTypeOf(requestContext.toScopeOptions().values).toEqualTypeOf<
            readonly ScopeLocalValue[] | undefined
        >()
        expect(Object.keys(requestContext).sort()).toEqual([
            'multiValues',
            'toScopeOptions',
            'values'
        ])
    })
})

const createActionOptions: ServerActionScopeOptionsFactory<[SubmitContactInput], ActionContext> = (
    input
) => {
    return {
        context: {
            actionName: 'submit-contact'
        },
        actionContext: createRequestContext(input.requestId)
    }
}

function createRequestContext(requestId: string): NextRequestContext {
    return createNextRequestContext({
        values: [nextRequestValue(REQUEST_ID, requestId)]
    })
}

async function createAppRuntime(): Promise<ComposedRuntime> {
    return createComposer().use(requestContextModule).use(contactRequestsModule).compose()
}

const requestContextModule = defineModule({
    id: 'next-hardening-request-context',
    provides: [
        {
            token: REQUEST_ID,
            kind: 'shared-service'
        }
    ],
    setup(context): void {
        context.bind(REQUEST_ID).toFactory(() => {
            throw new Error('REQUEST_ID must be provided as explicit scope-local context')
        })
    }
})

const contactRequestsModule = defineModule({
    id: 'next-hardening-contact-requests',
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
