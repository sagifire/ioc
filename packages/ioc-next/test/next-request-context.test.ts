import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    DuplicateScopeLocalValueError,
    ProviderKindMismatchError,
    createContainer,
    scopeMultiValue,
    scopeValue,
    token,
    type CreateScopeOptions,
    type ScopeLocalValue
} from '@sagifire/ioc'
import {
    createNextRequestContext,
    nextRequestMultiValue,
    nextRequestValue,
    type NextRequestContext,
    type NextRequestContextOptions,
    type NextRequestContextValue
} from '../src/index.js'

interface RequestLike {
    readonly method: string
    readonly url: string
}

interface Plugin {
    readonly name: string
}

interface RequestService {
    readonly requestId: string
    readonly requestMethod: string
    readonly requestUrl: string
    readonly pluginNames: readonly string[]
}

const REQUEST_ID = token<string>('next.request-context.request-id')
const REQUEST = token<RequestLike>('next.request-context.request')
const PLUGINS = token<Plugin>('next.request-context.plugins')
const REQUEST_SERVICE = token<RequestService>('next.request-context.service')

describe('Next request context', () => {
    test('converts explicit request context declarations to core scope options', async () => {
        const container = createContainer()
        const runtimePlugin = createPlugin('runtime')
        const localPlugin = createPlugin('local')
        const tuplePlugin = createPlugin('tuple-local')
        const request = createRequestLike('POST', 'https://example.test/api/contact')

        container.add(PLUGINS).toValue(runtimePlugin)
        container.bind(REQUEST_SERVICE).toFactory((context) => {
            return {
                requestId: context.get(REQUEST_ID),
                requestMethod: context.get(REQUEST).method,
                requestUrl: context.get(REQUEST).url,
                pluginNames: context.getAll(PLUGINS).map((plugin) => plugin.name)
            }
        })

        const runtime = await container.freeze()
        const requestContext = createNextRequestContext({
            values: [nextRequestValue(REQUEST_ID, 'request-1'), scopeValue(REQUEST, request)],
            multiValues: [nextRequestMultiValue(PLUGINS, localPlugin), [PLUGINS, tuplePlugin]]
        })
        const scope = runtime.createScope(requestContext.toScopeOptions())
        const service = scope.get(REQUEST_SERVICE)

        expect(service).toEqual({
            requestId: 'request-1',
            requestMethod: 'POST',
            requestUrl: 'https://example.test/api/contact',
            pluginNames: ['runtime', 'local', 'tuple-local']
        })
        expect(scope.get(REQUEST)).toBe(request)
        expect(runtime.getAll(PLUGINS)).toEqual([runtimePlugin])

        await scope.dispose()
        await runtime.dispose()
    })

    test('keeps request context immutable from public adapter APIs', () => {
        const values: ScopeLocalValue[] = [nextRequestValue(REQUEST_ID, 'initial')]
        const multiValues: ScopeLocalValue[] = [nextRequestMultiValue(PLUGINS, createPlugin('one'))]
        const requestContext = createNextRequestContext({
            values,
            multiValues
        })
        const scopeOptions = requestContext.toScopeOptions()

        values.push(nextRequestValue(REQUEST_ID, 'mutated'))
        multiValues.push(nextRequestMultiValue(PLUGINS, createPlugin('mutated')))

        expect(Object.isFrozen(requestContext)).toBe(true)
        expect(Object.isFrozen(requestContext.values)).toBe(true)
        expect(Object.isFrozen(requestContext.multiValues)).toBe(true)
        expect(Object.isFrozen(requestContext.values[0])).toBe(true)
        expect(Object.isFrozen(requestContext.multiValues[0])).toBe(true)
        expect(Object.isFrozen(scopeOptions)).toBe(true)
        expect(Object.isFrozen(scopeOptions.values)).toBe(true)
        expect(Object.isFrozen(scopeOptions.multiValues)).toBe(true)
        expect(scopeOptions.values).toEqual([scopeValue(REQUEST_ID, 'initial')])
        expect(scopeOptions.multiValues).toEqual([
            scopeMultiValue(PLUGINS, {
                name: 'one'
            })
        ])
    })

    test('delegates duplicate and conflict behavior to core scope validation', async () => {
        const duplicateAlias = token<string>('next.request-context.duplicate')
        const duplicateOriginal = token<string>('next.request-context.duplicate')
        const duplicateContext = createNextRequestContext({
            values: [
                nextRequestValue(duplicateOriginal, 'first'),
                nextRequestValue(duplicateAlias, 'second')
            ]
        })
        const localConflictContext = createNextRequestContext({
            values: [nextRequestValue(REQUEST_ID, 'single')],
            multiValues: [nextRequestMultiValue(REQUEST_ID, 'multi')]
        })
        const runtimeConflictContext = createNextRequestContext({
            values: [nextRequestValue(PLUGINS, createPlugin('invalid-single'))]
        })
        const container = createContainer()

        container.add(PLUGINS).toValue(createPlugin('runtime'))

        const runtime = await container.freeze()

        expect(() => runtime.createScope(duplicateContext.toScopeOptions())).toThrow(
            DuplicateScopeLocalValueError
        )
        expect(() => runtime.createScope(localConflictContext.toScopeOptions())).toThrow(
            ProviderKindMismatchError
        )
        expect(() => runtime.createScope(runtimeConflictContext.toScopeOptions())).toThrow(
            ProviderKindMismatchError
        )

        await runtime.dispose()
    })

    test('preserves request context helper type inference', () => {
        const singleValue = nextRequestValue(REQUEST_ID, 'typed-request')
        const requestValue = nextRequestValue(
            REQUEST,
            createRequestLike('GET', 'https://example.test/api/typed')
        )
        const multiValue = nextRequestMultiValue(PLUGINS, createPlugin('typed-plugin'))
        const options: NextRequestContextOptions = {
            values: [singleValue, requestValue],
            multiValues: [multiValue]
        }
        const requestContext = createNextRequestContext(options)

        expectTypeOf(singleValue).toEqualTypeOf<NextRequestContextValue<string>>()
        expectTypeOf(singleValue.value).toEqualTypeOf<string>()
        expectTypeOf(requestValue.value).toEqualTypeOf<RequestLike>()
        expectTypeOf(multiValue.value).toEqualTypeOf<Plugin>()
        expectTypeOf(requestContext).toEqualTypeOf<NextRequestContext>()
        expectTypeOf(requestContext.values).toEqualTypeOf<readonly NextRequestContextValue[]>()
        expectTypeOf(requestContext.multiValues).toEqualTypeOf<readonly NextRequestContextValue[]>()
        expectTypeOf(requestContext.toScopeOptions()).toEqualTypeOf<CreateScopeOptions>()
    })
})

function createPlugin(name: string): Plugin {
    return {
        name
    }
}

function createRequestLike(method: string, url: string): RequestLike {
    return {
        method,
        url
    }
}
