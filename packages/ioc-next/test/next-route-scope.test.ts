import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    ScopeDisposedError,
    createContainer,
    token,
    type ContainerRuntime,
    type CreateScopeOptions,
    type Scope
} from '@sagifire/ioc'
import {
    createNextRequestContext,
    createNextRuntime,
    nextRequestValue,
    withRouteScope,
    type NextRequestContext,
    type NextRuntimeHelper,
    type RouteHandlerScopeCallback,
    type RouteHandlerScopeOptions
} from '../src/index.js'

interface RequestLike {
    readonly method: string
    readonly url: string
}

interface RouteContext {
    readonly params: {
        readonly id: string
    }
}

interface ResponseLike {
    readonly status: number
    readonly body: string
}

interface RouteService {
    readonly requestId: string
    readonly requestMethod: string
    readonly requestUrl: string
}

interface ScopedResourceState {
    readonly requestId: string
}

interface CountingRuntime extends ContainerRuntime {
    getCreatedScopeCount(): number
}

const REQUEST_ID = token<string>('next.route-scope.request-id')
const REQUEST = token<RequestLike>('next.route-scope.request')
const ROUTE_SERVICE = token<RouteService>('next.route-scope.service')
const SCOPED_RESOURCE = token<ScopedResourceState>('next.route-scope.resource')
const SCOPED_COUNTER = token<number>('next.route-scope.counter')

describe('Next route handler scope', () => {
    test('runs a route callback with explicit runtime, scope, request and route context', async () => {
        const disposalLog: string[] = []
        const runtime = createCountingRuntime(await createRouteRuntime(disposalLog))
        const runtimeHelper = createNextRuntime(async () => runtime)
        const request = createRequestLike('GET', 'https://example.test/api/contact/42')
        const context = createRouteContext('42')
        const requestContext = createNextRequestContext({
            values: [nextRequestValue(REQUEST_ID, 'route-1'), nextRequestValue(REQUEST, request)]
        })
        let capturedScope: Scope | undefined

        const response = await withRouteScope(
            runtimeHelper,
            {
                request,
                context,
                requestContext
            },
            async (route) => {
                capturedScope = route.scope

                expect(route.runtime).toBe(runtime)
                expect(route.request).toBe(request)
                expect(route.context).toBe(context)
                expect(route.requestContext).toBe(requestContext)

                const service = route.scope.get(ROUTE_SERVICE)
                const resource = await route.scope.getAsync(SCOPED_RESOURCE)

                return createResponse(
                    200,
                    `${service.requestMethod}:${service.requestUrl}:${resource.requestId}:` +
                        route.context.params.id
                )
            }
        )

        expect(response).toEqual(
            createResponse(200, 'GET:https://example.test/api/contact/42:route-1:42')
        )
        expect(runtime.getCreatedScopeCount()).toBe(1)
        expect(disposalLog).toEqual(['route-1'])
        const disposedScope = capturedScope

        assertCapturedScope(disposedScope)
        expect(() => disposedScope.get(ROUTE_SERVICE)).toThrow(ScopeDisposedError)

        await runtime.dispose()
    })

    test('disposes the route scope when the callback throws', async () => {
        const disposalLog: string[] = []
        const runtime = createCountingRuntime(await createRouteRuntime(disposalLog))
        const runtimeHelper = createNextRuntime(async () => runtime)
        const request = createRequestLike('POST', 'https://example.test/api/contact/fail')
        const context = createRouteContext('fail')
        const requestContext = createNextRequestContext({
            values: [
                nextRequestValue(REQUEST_ID, 'failed-route'),
                nextRequestValue(REQUEST, request)
            ]
        })
        let capturedScope: Scope | undefined

        await expect(
            withRouteScope(
                runtimeHelper,
                {
                    request,
                    context,
                    requestContext
                },
                async (route) => {
                    capturedScope = route.scope
                    await route.scope.getAsync(SCOPED_RESOURCE)

                    throw new Error('route handler failed')
                }
            )
        ).rejects.toThrow('route handler failed')

        expect(runtime.getCreatedScopeCount()).toBe(1)
        expect(disposalLog).toEqual(['failed-route'])
        const disposedScope = capturedScope

        assertCapturedScope(disposedScope)
        expect(() => disposedScope.get(ROUTE_SERVICE)).toThrow(ScopeDisposedError)

        await runtime.dispose()
    })

    test('uses the cached runtime helper while creating a fresh scope per invocation', async () => {
        const runtime = createCountingRuntime(await createRouteRuntime([]))
        let factoryCalls = 0
        const runtimeHelper = createNextRuntime(async () => {
            factoryCalls += 1

            return runtime
        })

        const firstValue = await withRouteScope(
            runtimeHelper,
            createRouteScopeOptions('first'),
            async (route) => {
                await Promise.resolve()

                return route.scope.get(SCOPED_COUNTER)
            }
        )
        const secondValue = await withRouteScope(
            runtimeHelper,
            createRouteScopeOptions('second'),
            async (route) => {
                await Promise.resolve()

                return route.scope.get(SCOPED_COUNTER)
            }
        )

        expect(firstValue).toBe(1)
        expect(secondValue).toBe(2)
        expect(factoryCalls).toBe(1)
        expect(runtime.getCreatedScopeCount()).toBe(2)

        await runtime.dispose()
    })

    test('preserves route callback type inference', async () => {
        const runtime = await createRouteRuntime([])
        const runtimeHelper: NextRuntimeHelper<ContainerRuntime> = createNextRuntime(async () => {
            return runtime
        })
        const request = createRequestLike('PATCH', 'https://example.test/api/contact/typed')
        const context = createRouteContext('typed')
        const requestContext = createNextRequestContext({
            values: [
                nextRequestValue(REQUEST_ID, 'typed-route'),
                nextRequestValue(REQUEST, request)
            ]
        })
        const routeOptions: RouteHandlerScopeOptions<RequestLike, RouteContext> = {
            request,
            context,
            requestContext
        }
        const routeCallback: RouteHandlerScopeCallback<
            ContainerRuntime,
            RequestLike,
            RouteContext,
            ResponseLike
        > = ({ scope }) => {
            return createResponse(204, scope.get(REQUEST_ID))
        }
        const responsePromise = withRouteScope(runtimeHelper, routeOptions, (route) => {
            expectTypeOf(route.runtime).toEqualTypeOf<ContainerRuntime>()
            expectTypeOf(route.scope).toEqualTypeOf<Scope>()
            expectTypeOf(route.request).toEqualTypeOf<RequestLike>()
            expectTypeOf(route.context).toEqualTypeOf<RouteContext>()
            expectTypeOf(route.requestContext).toEqualTypeOf<NextRequestContext | undefined>()
            expectTypeOf(route.scope.get(REQUEST_ID)).toEqualTypeOf<string>()

            return routeCallback(route)
        })

        expectTypeOf(routeOptions).toEqualTypeOf<
            RouteHandlerScopeOptions<RequestLike, RouteContext>
        >()
        expectTypeOf(routeCallback).toEqualTypeOf<
            RouteHandlerScopeCallback<ContainerRuntime, RequestLike, RouteContext, ResponseLike>
        >()
        expectTypeOf(responsePromise).toEqualTypeOf<Promise<ResponseLike>>()
        await expect(responsePromise).resolves.toEqual(createResponse(204, 'typed-route'))

        await runtime.dispose()
    })
})

async function createRouteRuntime(disposalLog: string[]): Promise<ContainerRuntime> {
    const container = createContainer()
    let scopedCounter = 0

    container.bind(ROUTE_SERVICE).toFactory((context) => {
        const request = context.get(REQUEST)

        return {
            requestId: context.get(REQUEST_ID),
            requestMethod: request.method,
            requestUrl: request.url
        }
    })
    container
        .bind(SCOPED_RESOURCE)
        .toAsyncResource((context) => {
            const requestId = context.get(REQUEST_ID)

            return {
                value: {
                    requestId
                },
                dispose(): void {
                    disposalLog.push(requestId)
                }
            }
        })
        .scoped()
    container
        .bind(SCOPED_COUNTER)
        .toFactory(() => {
            scopedCounter += 1

            return scopedCounter
        })
        .scoped()

    return container.freeze()
}

function createCountingRuntime(runtime: ContainerRuntime): CountingRuntime {
    let createdScopes = 0

    return Object.freeze({
        get: runtime.get,
        tryGet: runtime.tryGet,
        getAll: runtime.getAll,
        createScope(options?: CreateScopeOptions): Scope {
            createdScopes += 1

            return runtime.createScope(options)
        },
        withScope: runtime.withScope,
        getAsync: runtime.getAsync,
        tryGetAsync: runtime.tryGetAsync,
        dispose: runtime.dispose,
        getCreatedScopeCount(): number {
            return createdScopes
        }
    })
}

function createRouteScopeOptions(id: string): RouteHandlerScopeOptions<RequestLike, RouteContext> {
    const request = createRequestLike('GET', `https://example.test/api/contact/${id}`)

    return {
        request,
        context: createRouteContext(id),
        requestContext: createNextRequestContext({
            values: [nextRequestValue(REQUEST_ID, id), nextRequestValue(REQUEST, request)]
        })
    }
}

function createRequestLike(method: string, url: string): RequestLike {
    return {
        method,
        url
    }
}

function createRouteContext(id: string): RouteContext {
    return {
        params: {
            id
        }
    }
}

function createResponse(status: number, body: string): ResponseLike {
    return {
        status,
        body
    }
}

function assertCapturedScope(scope: Scope | undefined): asserts scope is Scope {
    if (scope === undefined) {
        throw new Error('Expected route callback to capture scope')
    }
}
