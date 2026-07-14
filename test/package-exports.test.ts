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

    test('ioc-testing export exposes final Stage 12 testing API', async () => {
        const testing = await import('@sagifire/ioc-testing')
        const core = await import('@sagifire/ioc')
        const value = core.token<string>('exports.testing.value')
        const reader = core.token<{
            read(): string
        }>('exports.testing.reader')
        const publicApi = core.token<{
            submit(): string
        }>('exports.testing.public-api')
        const testModule = core.defineModule({
            id: 'exports-testing-module',
            requires: [
                {
                    token: reader
                }
            ],
            provides: [
                {
                    token: publicApi,
                    kind: 'public-api'
                }
            ],
            setup(context): void {
                context.bind(publicApi).toFactory((resolutionContext) => {
                    const resolvedReader = resolutionContext.get(reader)

                    return {
                        submit(): string {
                            return resolvedReader.read()
                        }
                    }
                })
            }
        })

        const runtime = await testing.createTestRuntime((container) => {
            container.bind(value).toValue('testing-export')
        })
        const testComposer = testing.createTestComposer({
            modules: [testModule],
            overrides: [
                testing.override(reader).toValue({
                    read(): string {
                        return 'testing-composer-export'
                    }
                })
            ]
        })
        const fakeReaderModule = testing.fakeModule('exports-testing-fake-reader', {
            provides: [
                {
                    token: reader,
                    useValue: {
                        read(): string {
                            return 'testing-harness-export'
                        }
                    }
                }
            ]
        })
        const harness = testing.createModuleHarness({
            module: testModule,
            fakeModules: [fakeReaderModule]
        })
        const composedRuntime = await testComposer.compose()
        const harnessRuntime = await harness.compose()

        expect(testing.createTestRuntime).toBeTypeOf('function')
        expect(testing.createTestComposer).toBeTypeOf('function')
        expect(testing.override).toBeTypeOf('function')
        expect(testing.fakeModule).toBeTypeOf('function')
        expect(testing.createModuleHarness).toBeTypeOf('function')
        expect(testing.assertGraphHasModule).toBeTypeOf('function')
        expect(testing.assertGraphHasCapability).toBeTypeOf('function')
        expect(testing.assertGraphHasRequiredPort).toBeTypeOf('function')
        expect(testing.assertGraphHasBinding).toBeTypeOf('function')
        expect(testing.assertGraphHasEdge).toBeTypeOf('function')
        expect(testing.assertGraphExportSnapshot).toBeTypeOf('function')
        expect(testing.assertProviderGraphHasNode).toBeTypeOf('function')
        expect(testing.assertProviderGraphHasDependencyEdge).toBeTypeOf('function')
        expect(testing.assertProviderGraphHasOwnershipEdge).toBeTypeOf('function')
        expect(testing.assertProviderGraphHasCoverage).toBeTypeOf('function')
        expect(testing.assertProviderGraphCoverage).toBeTypeOf('function')
        expect(testing.assertLifetimeValidationReportOk).toBeTypeOf('function')
        expect(testing.assertLifetimeValidationReportHasDiagnostic).toBeTypeOf('function')
        expect(testing.assertScopeInspectionHasProviderNode).toBeTypeOf('function')
        expect(testing.assertScopeInspectionHasDependencyEdge).toBeTypeOf('function')
        expect(testing.assertDiagnosticReportOk).toBeTypeOf('function')
        expect(testing.assertDiagnosticReportHasDiagnostic).toBeTypeOf('function')
        expect(testing.assertErrorDiagnostic).toBeTypeOf('function')
        expect(testing.GraphAssertionError).toBeTypeOf('function')
        expect(testing.GraphExportSnapshotAssertionError).toBeTypeOf('function')
        expect(testing.DiagnosticAssertionError).toBeTypeOf('function')
        expect(testing.DuplicateTestOverrideError).toBeTypeOf('function')
        expect(core.getLifetimeValidationReport).toBeTypeOf('function')
        expect(Object.keys(testing).filter((exportName) => exportName.includes('Next'))).toEqual([])
        testing.assertGraphHasModule(harness.getGraph(), 'exports-testing-module')
        testing.assertGraphHasCapability(harness.getGraph(), {
            tokenId: publicApi.id,
            moduleId: 'exports-testing-module'
        })
        testing.assertDiagnosticReportOk(harness.validate())
        testing.assertProviderGraphHasNode(runtime.inspect(), {
            key: {
                visibility: 'public',
                tokenId: value.id
            },
            providerKind: 'value'
        })
        testing.assertProviderGraphHasCoverage(runtime.inspect(), {
            provider: {
                visibility: 'public',
                tokenId: value.id
            },
            coverage: 'not-applicable'
        })
        testing.assertProviderGraphCoverage(runtime.inspect(), 'complete')
        testing.assertLifetimeValidationReportOk(core.getLifetimeValidationReport(runtime))
        expect(runtime.get(value)).toBe('testing-export')
        expect(composedRuntime.get(publicApi).submit()).toBe('testing-composer-export')
        expect(harnessRuntime.get(publicApi).submit()).toBe('testing-harness-export')
        expect(harness.getGraph().modules.map((moduleDefinition) => moduleDefinition.id)).toEqual([
            'exports-testing-module',
            'exports-testing-fake-reader'
        ])

        await harnessRuntime.dispose()
        await composedRuntime.dispose()
        await runtime.dispose()
    })

    test('ioc-next export exposes implemented Stage 13 adapter API', async () => {
        const nextAdapter = await import('@sagifire/ioc-next')
        const core = await import('@sagifire/ioc')
        const value = core.token<string>('exports.next.value')
        const requestId = core.token<string>('exports.next.request-id')
        const requestPlugin = core.token<{
            readonly name: string
        }>('exports.next.request-plugin')
        let factoryCalls = 0
        const runtimeHelper = nextAdapter.createNextRuntime(async () => {
            factoryCalls += 1

            const container = core.createContainer()

            container.bind(value).toValue(`next-export-${factoryCalls}`)

            return container.freeze()
        })

        const firstRuntime = await runtimeHelper.getRuntime()
        const secondRuntime = await runtimeHelper.getRuntime()
        const requestContext = nextAdapter.createNextRequestContext({
            values: [nextAdapter.nextRequestValue(requestId, 'export-request')],
            multiValues: [
                nextAdapter.nextRequestMultiValue(requestPlugin, {
                    name: 'export-plugin'
                })
            ]
        })
        const routeResponse = await nextAdapter.withRouteScope(
            runtimeHelper,
            {
                request: {
                    method: 'GET',
                    url: 'https://example.test/api/export'
                },
                context: {
                    params: {
                        id: 'export'
                    }
                },
                requestContext
            },
            ({ runtime, scope, context }) => {
                return {
                    value: runtime.get(value),
                    requestId: scope.get(requestId),
                    pluginNames: scope.getAll(requestPlugin).map((plugin) => plugin.name),
                    routeId: context.params.id
                }
            }
        )
        const submitExport = nextAdapter.withServerActionScope(
            runtimeHelper,
            (input: { readonly id: string }) => {
                return {
                    context: {
                        actionName: 'submit-export',
                        actionId: input.id
                    },
                    actionContext: nextAdapter.createNextRequestContext({
                        values: [nextAdapter.nextRequestValue(requestId, `action-${input.id}`)],
                        multiValues: [
                            nextAdapter.nextRequestMultiValue(requestPlugin, {
                                name: 'action-plugin'
                            })
                        ]
                    })
                }
            },
            ({ runtime, scope, context }, input) => {
                return {
                    value: runtime.get(value),
                    requestId: scope.get(requestId),
                    pluginNames: scope.getAll(requestPlugin).map((plugin) => plugin.name),
                    actionName: context.actionName,
                    actionId: context.actionId,
                    inputId: input.id
                }
            }
        )
        const actionResponse = await submitExport({
            id: 'export-action'
        })

        expect(nextAdapter.createNextRequestContext).toBeTypeOf('function')
        expect(nextAdapter.createNextRuntime).toBeTypeOf('function')
        expect(nextAdapter.nextRequestMultiValue).toBeTypeOf('function')
        expect(nextAdapter.nextRequestValue).toBeTypeOf('function')
        expect(nextAdapter.withRouteScope).toBeTypeOf('function')
        expect(nextAdapter.withServerActionScope).toBeTypeOf('function')
        expect(runtimeHelper.getRuntime).toBeTypeOf('function')
        expect(runtimeHelper.reset).toBeTypeOf('function')
        expect(firstRuntime).toBe(secondRuntime)
        expect(firstRuntime.get(value)).toBe('next-export-1')
        expect(routeResponse).toEqual({
            value: 'next-export-1',
            requestId: 'export-request',
            pluginNames: ['export-plugin'],
            routeId: 'export'
        })
        expect(actionResponse).toEqual({
            value: 'next-export-1',
            requestId: 'action-export-action',
            pluginNames: ['action-plugin'],
            actionName: 'submit-export',
            actionId: 'export-action',
            inputId: 'export-action'
        })
        expect(factoryCalls).toBe(1)

        runtimeHelper.reset()

        const resetRuntime = await runtimeHelper.getRuntime()

        expect(resetRuntime).not.toBe(firstRuntime)
        expect(resetRuntime.get(value)).toBe('next-export-2')
        expect(factoryCalls).toBe(2)

        await resetRuntime.dispose()
        await firstRuntime.dispose()
    })

    test('root export exposes token API', async () => {
        const module = await import('@sagifire/ioc')
        const composer = module.createComposer()

        expect(module.token).toBeTypeOf('function')
        expect(module.multiToken).toBeTypeOf('function')
        expect(module.contributionToken).toBeTypeOf('function')
        expect(module.namespace).toBeTypeOf('function')
        expect(module.InvalidTokenIdError).toBeTypeOf('function')
        expect(module.SagifireIocError).toBeTypeOf('function')
        expect(module.isSagifireIocError).toBeTypeOf('function')
        expect(module.diagnosticFromError).toBeTypeOf('function')
        expect(module.formatDiagnostics).toBeTypeOf('function')
        expect(module.createComposer).toBeTypeOf('function')
        expect(module.defineModule).toBeTypeOf('function')
        expect(module.module).toBeTypeOf('function')
        expect(module.defineApp).toBeTypeOf('function')
        expect(module.bind).toBeTypeOf('function')
        expect(module.add).toBeTypeOf('function')
        expect(module.adapt).toBeTypeOf('function')
        expect(module.adapter).toBeTypeOf('function')
        expect(module.InvalidModuleDefinitionError).toBeTypeOf('function')
        expect(module.DuplicateModuleDependencyError).toBeTypeOf('function')
        expect(module.DuplicateModuleCapabilityError).toBeTypeOf('function')
        expect(module.DuplicateSingleCapabilityError).toBeTypeOf('function')
        expect(module.DuplicateModuleIdError).toBeTypeOf('function')
        expect(module.MissingRequiredPortError).toBeTypeOf('function')
        expect(module.RequiredMultiCapabilityMissingError).toBeTypeOf('function')
        expect(module.RequiredPortCardinalityMismatchError).toBeTypeOf('function')
        expect(module.DuplicateComposerBindingError).toBeTypeOf('function')
        expect(module.InvalidComposerBindingError).toBeTypeOf('function')
        expect(module.InvalidComposerMultiBindingError).toBeTypeOf('function')
        expect(module.ComposerBindingCardinalityConflictError).toBeTypeOf('function')
        expect(module.ComposerValidationError).toBeTypeOf('function')
        expect(module.ModuleCycleError).toBeTypeOf('function')
        expect(module.PrivateProviderAccessError).toBeTypeOf('function')
        expect(module.MissingModuleProviderError).toBeTypeOf('function')
        expect(module.CapabilityCardinalityConflictError).toBeTypeOf('function')
        expect(module.CapabilityRegistrationCardinalityMismatchError).toBeTypeOf('function')
        expect(module.GetUsedForMultiTokenError).toBeTypeOf('function')
        expect(module.GetAllUsedForSingleTokenError).toBeTypeOf('function')
        expect(module.AdapterSourceMissingError).toBeTypeOf('function')
        expect(module.AdapterSourcePrivateError).toBeTypeOf('function')
        expect(module.AdapterSourceCardinalityMismatchError).toBeTypeOf('function')
        expect(module.AdapterTargetInvalidError).toBeTypeOf('function')
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
        expect(module.SyncFactoryPromiseError).toBeTypeOf('function')
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
        expect(module.multiToken).toBeTypeOf('function')
        expect(module.contributionToken).toBeTypeOf('function')
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
        expect(module.SyncFactoryPromiseError).toBeTypeOf('function')
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
        expect(module.DuplicateSingleCapabilityError).toBeTypeOf('function')
        expect(module.DuplicateModuleIdError).toBeTypeOf('function')
        expect(module.MissingRequiredPortError).toBeTypeOf('function')
        expect(module.RequiredMultiCapabilityMissingError).toBeTypeOf('function')
        expect(module.RequiredPortCardinalityMismatchError).toBeTypeOf('function')
        expect(module.DuplicateComposerBindingError).toBeTypeOf('function')
        expect(module.InvalidComposerBindingError).toBeTypeOf('function')
        expect(module.InvalidComposerMultiBindingError).toBeTypeOf('function')
        expect(module.ComposerBindingCardinalityConflictError).toBeTypeOf('function')
        expect(module.ComposerValidationError).toBeTypeOf('function')
        expect(module.ModuleCycleError).toBeTypeOf('function')
        expect(module.PrivateProviderAccessError).toBeTypeOf('function')
        expect(module.MissingModuleProviderError).toBeTypeOf('function')
        expect(module.CapabilityCardinalityConflictError).toBeTypeOf('function')
        expect(module.CapabilityRegistrationCardinalityMismatchError).toBeTypeOf('function')
        expect(module.GetUsedForMultiTokenError).toBeTypeOf('function')
        expect(module.GetAllUsedForSingleTokenError).toBeTypeOf('function')
        expect(module.AdapterSourceMissingError).toBeTypeOf('function')
        expect(module.AdapterSourcePrivateError).toBeTypeOf('function')
        expect(module.AdapterSourceCardinalityMismatchError).toBeTypeOf('function')
        expect(module.AdapterTargetInvalidError).toBeTypeOf('function')
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

    test('dsl subpath exposes module and app DSL API', async () => {
        const dsl = await import('@sagifire/ioc/dsl')
        const tokens = await import('@sagifire/ioc/tokens')
        const publicApi = tokens.token<{
            ok(): boolean
        }>('exports.dsl.public-api')
        const reader = tokens.token<{
            read(): boolean
        }>('exports.dsl.reader')
        const dslModule = dsl.module({
            id: 'exports-dsl-module',
            requires: [
                {
                    token: reader
                }
            ],
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
        const app = dsl.defineApp({
            modules: [dslModule],
            bindings: [
                dsl.bind(reader).toValue({
                    read(): boolean {
                        return true
                    }
                })
            ]
        })
        const adapterApp = dsl.defineApp({
            modules: [dslModule],
            bindings: [
                dsl.adapt(reader, () => {
                    return {
                        read(): boolean {
                            return true
                        }
                    }
                })
            ]
        })
        const runtime = await app.compose()

        expect(dsl.module).toBeTypeOf('function')
        expect(dsl.defineApp).toBeTypeOf('function')
        expect(dsl.bind).toBeTypeOf('function')
        expect(dsl.add).toBeTypeOf('function')
        expect(dsl.adapt).toBeTypeOf('function')
        expect(dsl.adapter).toBeTypeOf('function')
        expect(runtime.get(publicApi).ok()).toBe(true)
        expect(app.inspect().edges).toEqual([
            {
                edgeKind: 'binding',
                consumerModuleId: 'exports-dsl-module',
                requiredTokenId: 'exports.dsl.reader',
                dependencyKind: 'external',
                bindingTokenId: 'exports.dsl.reader',
                bindingKind: 'value'
            }
        ])
        expect(adapterApp.getGraph().bindings[0]?.kind).toBe('factory')

        await runtime.dispose()
    })

    test('root and dsl subpath expose coherent final DSL helpers', async () => {
        const root = await import('@sagifire/ioc')
        const dsl = await import('@sagifire/ioc/dsl')
        const reader = root.token<{
            read(): string
        }>('exports.dsl.coherent-reader')
        const publicApi = root.token<{
            value(): string
        }>('exports.dsl.coherent-public-api')
        const createModule = (moduleFactory: typeof root.module) => {
            return moduleFactory('exports-dsl-coherent-module', {
                requires: [
                    {
                        token: reader
                    }
                ],
                provides: [
                    {
                        token: publicApi,
                        kind: 'public-api'
                    }
                ],
                setup(context): void {
                    context.bind(publicApi).toFactory((resolutionContext) => {
                        const dependency = resolutionContext.get(reader)

                        return {
                            value(): string {
                                return dependency.read()
                            }
                        }
                    })
                }
            })
        }
        const rootApp = root.defineApp({
            modules: [createModule(root.module)],
            bindings: [
                root.adapt(reader, () => {
                    return {
                        read(): string {
                            return 'root-dsl'
                        }
                    }
                })
            ]
        })
        const subpathApp = dsl.defineApp({
            modules: [createModule(dsl.module)],
            bindings: [
                dsl.bind(reader).toFactory(() => {
                    return {
                        read(): string {
                            return 'subpath-dsl'
                        }
                    }
                })
            ]
        })
        const rootRuntime = await rootApp.compose()
        const subpathRuntime = await subpathApp.compose()

        expect(root.module).toBeTypeOf('function')
        expect(root.defineApp).toBeTypeOf('function')
        expect(root.bind).toBeTypeOf('function')
        expect(root.add).toBeTypeOf('function')
        expect(root.adapt).toBeTypeOf('function')
        expect(root.adapter).toBeTypeOf('function')
        expect(dsl.module).toBeTypeOf('function')
        expect(dsl.defineApp).toBeTypeOf('function')
        expect(dsl.bind).toBeTypeOf('function')
        expect(dsl.add).toBeTypeOf('function')
        expect(dsl.adapt).toBeTypeOf('function')
        expect(dsl.adapter).toBeTypeOf('function')
        expect(rootApp.getGraph()).toEqual(subpathApp.getGraph())
        expect(rootRuntime.inspect().graph).toEqual(subpathRuntime.inspect().graph)
        expect(rootRuntime.get(publicApi).value()).toBe('root-dsl')
        expect(subpathRuntime.get(publicApi).value()).toBe('subpath-dsl')

        await rootRuntime.dispose()
        await subpathRuntime.dispose()
    })
})
