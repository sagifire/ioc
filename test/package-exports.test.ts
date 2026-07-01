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

describe('package exports', () => {
    test.each(exportSpecifiers)('%s resolves as an ESM module', async (specifier) => {
        const module = await import(specifier)

        expect(module).toBeTypeOf('object')
    })

    test('root export exposes token API', async () => {
        const module = await import('@sagifire/ioc')
        const composer = module.createComposer()

        expect(module.token).toBeTypeOf('function')
        expect(module.namespace).toBeTypeOf('function')
        expect(module.InvalidTokenIdError).toBeTypeOf('function')
        expect(module.SagifireIocError).toBeTypeOf('function')
        expect(module.isSagifireIocError).toBeTypeOf('function')
        expect(module.diagnosticFromError).toBeTypeOf('function')
        expect(module.formatDiagnostics).toBeTypeOf('function')
        expect(module.createComposer).toBeTypeOf('function')
        expect(module.defineModule).toBeTypeOf('function')
        expect(module.module).toBeTypeOf('function')
        expect(module.InvalidModuleDefinitionError).toBeTypeOf('function')
        expect(module.DuplicateModuleDependencyError).toBeTypeOf('function')
        expect(module.DuplicateModuleCapabilityError).toBeTypeOf('function')
        expect(module.DuplicateModuleIdError).toBeTypeOf('function')
        expect(module.MissingRequiredPortError).toBeTypeOf('function')
        expect(module.InvalidComposerBindingError).toBeTypeOf('function')
        expect(module.ComposerValidationError).toBeTypeOf('function')
        expect(module.ModuleCycleError).toBeTypeOf('function')
        expect(module.PrivateProviderAccessError).toBeTypeOf('function')
        expect(module.MissingModuleProviderError).toBeTypeOf('function')
        expect(composer.inspect).toBeTypeOf('function')
        expect(composer.getGraph).toBeTypeOf('function')
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

    test('root export exposes Stage 10 runtime inspection and cycle diagnostics', async () => {
        const module = await import('@sagifire/ioc')
        const authApi = module.token<{
            readonly value: string
        }>('exports.root.auth-api')
        const authReader = module.token<{
            read(): string
        }>('exports.root.auth-reader')
        const provider = module.defineModule({
            id: 'exports-root-provider',
            provides: [
                {
                    token: authApi,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(authApi).toValue({
                    value: 'exported'
                })
            }
        })
        const consumer = module.defineModule({
            id: 'exports-root-consumer',
            requires: [
                {
                    token: authApi
                },
                {
                    token: authReader
                }
            ],
            setup(): void {}
        })
        const composer = module.createComposer().use(provider).use(consumer)

        composer.bind(authReader).toFactory((context) => {
            const api = context.get(authApi)

            return {
                read(): string {
                    return api.value
                }
            }
        })

        const graph = composer.getGraph()
        const runtime = await composer.compose()
        const cycleError = new module.ModuleCycleError({
            moduleIdPath: ['exports-root-a', 'exports-root-b', 'exports-root-a'],
            tokenIdPath: ['exports-root.b', 'exports-root.a'],
            edgeKinds: ['capability', 'capability']
        })

        expect(graph.edges).toEqual([
            {
                edgeKind: 'capability',
                consumerModuleId: 'exports-root-consumer',
                requiredTokenId: 'exports.root.auth-api',
                dependencyKind: 'external',
                providerModuleId: 'exports-root-provider',
                capabilityTokenId: 'exports.root.auth-api',
                capabilityKind: 'public-api'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'exports-root-consumer',
                requiredTokenId: 'exports.root.auth-reader',
                dependencyKind: 'external',
                bindingTokenId: 'exports.root.auth-reader',
                bindingKind: 'factory'
            }
        ])
        expect(runtime.inspect().edges).toEqual(graph.edges)
        expect(cycleError.code).toBe('SAGIFIRE_IOC_MODULE_CYCLE')
        expect(cycleError.details?.moduleIdPath).toEqual([
            'exports-root-a',
            'exports-root-b',
            'exports-root-a'
        ])

        await runtime.dispose()
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

    test('composer subpath exposes module definition foundation API', async () => {
        const module = await import('@sagifire/ioc/composer')
        const composer = module.createComposer()

        expect(module.createComposer).toBeTypeOf('function')
        expect(module.defineModule).toBeTypeOf('function')
        expect(module.InvalidModuleDefinitionError).toBeTypeOf('function')
        expect(module.DuplicateModuleDependencyError).toBeTypeOf('function')
        expect(module.DuplicateModuleCapabilityError).toBeTypeOf('function')
        expect(module.DuplicateModuleIdError).toBeTypeOf('function')
        expect(module.MissingRequiredPortError).toBeTypeOf('function')
        expect(module.InvalidComposerBindingError).toBeTypeOf('function')
        expect(module.ComposerValidationError).toBeTypeOf('function')
        expect(module.ModuleCycleError).toBeTypeOf('function')
        expect(module.PrivateProviderAccessError).toBeTypeOf('function')
        expect(module.MissingModuleProviderError).toBeTypeOf('function')
        expect(composer.inspect).toBeTypeOf('function')
        expect(composer.getGraph).toBeTypeOf('function')
    })

    test('composer subpath exposes Stage 10 graph metadata and cycle errors', async () => {
        const module = await import('@sagifire/ioc/composer')
        const tokens = await import('@sagifire/ioc/tokens')
        const publicApi = tokens.token<{
            ok(): boolean
        }>('exports.composer.public-api')
        const reader = tokens.token<{
            read(): boolean
        }>('exports.composer.reader')
        const provider = module.defineModule({
            id: 'exports-composer-provider',
            provides: [
                {
                    token: publicApi,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(publicApi).toValue({
                    ok(): boolean {
                        return true
                    }
                })
            }
        })
        const consumer = module.defineModule({
            id: 'exports-composer-consumer',
            requires: [
                {
                    token: publicApi
                },
                {
                    token: reader
                }
            ],
            setup(): void {}
        })
        const composer = module.createComposer().use(provider).use(consumer)

        composer.bind(reader).toValue({
            read(): boolean {
                return true
            }
        })

        const runtime = await composer.compose()
        const cycleError = new module.ModuleCycleError({
            moduleIdPath: ['exports-composer-a', 'exports-composer-b', 'exports-composer-a'],
            tokenIdPath: ['exports-composer.b', 'exports-composer.a'],
            edgeKinds: ['capability', 'capability']
        })

        expect(runtime.inspect().edges).toEqual([
            {
                edgeKind: 'capability',
                consumerModuleId: 'exports-composer-consumer',
                requiredTokenId: 'exports.composer.public-api',
                dependencyKind: 'external',
                providerModuleId: 'exports-composer-provider',
                capabilityTokenId: 'exports.composer.public-api',
                capabilityKind: 'public-api'
            },
            {
                edgeKind: 'binding',
                consumerModuleId: 'exports-composer-consumer',
                requiredTokenId: 'exports.composer.reader',
                dependencyKind: 'external',
                bindingTokenId: 'exports.composer.reader',
                bindingKind: 'value'
            }
        ])
        expect(cycleError.code).toBe('SAGIFIRE_IOC_MODULE_CYCLE')

        await runtime.dispose()
    })

    test('dsl subpath exposes module DSL API', async () => {
        const dsl = await import('@sagifire/ioc/dsl')
        const composerApi = await import('@sagifire/ioc/composer')
        const tokens = await import('@sagifire/ioc/tokens')
        const publicApi = tokens.token<{
            ok(): boolean
        }>('exports.dsl.public-api')
        const dslModule = dsl.module({
            id: 'exports-dsl-module',
            provides: [
                {
                    token: publicApi,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(publicApi).toValue({
                    ok(): boolean {
                        return true
                    }
                })
            }
        })
        const runtime = await composerApi.createComposer().use(dslModule).compose()

        expect(dsl.module).toBeTypeOf('function')
        expect(runtime.get(publicApi).ok()).toBe(true)

        await runtime.dispose()
    })
})
