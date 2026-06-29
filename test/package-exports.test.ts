import { describe, expect, test } from 'vitest'

const exportSpecifiers = [
    '@sagifire/ioc',
    '@sagifire/ioc/tokens',
    '@sagifire/ioc/container',
    '@sagifire/ioc/context',
    '@sagifire/ioc/composer',
    '@sagifire/ioc/dsl',
    '@sagifire/ioc/diagnostics',
    '@sagifire/ioc/lifecycle',
    '@sagifire/ioc-next',
    '@sagifire/ioc-testing'
]

describe('package export placeholders', () => {
    test.each(exportSpecifiers)('%s resolves as an ESM module', async (specifier) => {
        const module = await import(specifier)

        expect(module).toBeTypeOf('object')
    })

    test('root export exposes token API', async () => {
        const module = await import('@sagifire/ioc')

        expect(module.token).toBeTypeOf('function')
        expect(module.namespace).toBeTypeOf('function')
        expect(module.InvalidTokenIdError).toBeTypeOf('function')
        expect(module.SagifireIocError).toBeTypeOf('function')
        expect(module.isSagifireIocError).toBeTypeOf('function')
        expect(module.diagnosticFromError).toBeTypeOf('function')
        expect(module.formatDiagnostics).toBeTypeOf('function')
        expect(module.createContainer).toBeTypeOf('function')
        expect(module.ProviderNotFoundError).toBeTypeOf('function')
        expect(module.DuplicateProviderError).toBeTypeOf('function')
        expect(module.ProviderKindMismatchError).toBeTypeOf('function')
        expect(module.ProviderCycleError).toBeTypeOf('function')
        expect(module.ContainerFrozenError).toBeTypeOf('function')
        expect(module.AsyncProviderAccessError).toBeTypeOf('function')
        expect(module.RuntimeDisposedError).toBeTypeOf('function')
        expect(module.InvalidProviderLifecycleError).toBeTypeOf('function')
        expect(module.InvalidScopeError).toBeTypeOf('function')
        expect(module.ScopeDisposedError).toBeTypeOf('function')
        expect(module.DuplicateScopeLocalValueError).toBeTypeOf('function')
        expect(module.scopeValue).toBeTypeOf('function')
        expect(module.scopeMultiValue).toBeTypeOf('function')
    })

    test('tokens subpath exposes token API', async () => {
        const module = await import('@sagifire/ioc/tokens')

        expect(module.token).toBeTypeOf('function')
        expect(module.namespace).toBeTypeOf('function')
        expect(module.InvalidTokenIdError).toBeTypeOf('function')
    })

    test('container subpath exposes container API', async () => {
        const module = await import('@sagifire/ioc/container')

        expect(module.createContainer).toBeTypeOf('function')
        expect(module.ProviderNotFoundError).toBeTypeOf('function')
        expect(module.DuplicateProviderError).toBeTypeOf('function')
        expect(module.ProviderKindMismatchError).toBeTypeOf('function')
        expect(module.ProviderCycleError).toBeTypeOf('function')
        expect(module.ContainerFrozenError).toBeTypeOf('function')
        expect(module.AsyncProviderAccessError).toBeTypeOf('function')
        expect(module.RuntimeDisposedError).toBeTypeOf('function')
        expect(module.InvalidProviderLifecycleError).toBeTypeOf('function')
        expect(module.InvalidScopeError).toBeTypeOf('function')
        expect(module.ScopeDisposedError).toBeTypeOf('function')
        expect(module.DuplicateScopeLocalValueError).toBeTypeOf('function')
        expect(module.scopeValue).toBeTypeOf('function')
        expect(module.scopeMultiValue).toBeTypeOf('function')
    })

    test('context subpath exposes scope API', async () => {
        const module = await import('@sagifire/ioc/context')

        expect(module.InvalidScopeError).toBeTypeOf('function')
        expect(module.ScopeDisposedError).toBeTypeOf('function')
        expect(module.DuplicateScopeLocalValueError).toBeTypeOf('function')
        expect(module.scopeValue).toBeTypeOf('function')
        expect(module.scopeMultiValue).toBeTypeOf('function')
    })

    test('diagnostics subpath exposes diagnostics foundation API', async () => {
        const module = await import('@sagifire/ioc/diagnostics')

        expect(module.SagifireIocError).toBeTypeOf('function')
        expect(module.isSagifireIocError).toBeTypeOf('function')
        expect(module.diagnosticFromError).toBeTypeOf('function')
        expect(module.formatDiagnostics).toBeTypeOf('function')
    })
})
