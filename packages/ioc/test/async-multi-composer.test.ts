import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    AsyncMultiProviderAccessError,
    AsyncMultiProviderResolutionError,
    AsyncResourceCleanupError,
    GetAllUsedForSingleTokenError,
    GetUsedForMultiTokenError,
    ProviderCycleError,
    ResourceDisposalError,
    createComposer,
    createGraphExportDocument,
    defineModule,
    renderGraphExportDot,
    renderGraphExportMermaid,
    serializeGraphExport,
    token,
    type AsyncFactoryBinding,
    type AsyncResourceBinding,
    type ComposerMultiBindingBuilder,
    type ContainerMultiBindingBuilder
} from '../src/index.js'

describe('async multi composer integration', () => {
    test('preserves module, root and scope-local order through one async collection operation', async () => {
        const sources = token<string>('async-multi-composer.order.sources')
        const outputs = token<string>('async-multi-composer.order.outputs')
        const sourceModule = defineModule({
            id: 'async-multi-order-source',
            provides: [{ token: sources, kind: 'custom', cardinality: 'multi' }],
            setup(context): void {
                const builder = context.add(sources)

                expectTypeOf(builder).toEqualTypeOf<ContainerMultiBindingBuilder<string>>()
                builder.toValue('source-sync')
                expectTypeOf(
                    builder.toAsyncFactory(async () => 'source-async')
                ).toEqualTypeOf<AsyncFactoryBinding>()
            }
        })
        const outputModule = defineModule({
            id: 'async-multi-order-output',
            requires: [{ token: sources, cardinality: 'multi' }],
            provides: [{ token: outputs, kind: 'custom', cardinality: 'multi' }],
            setup(context): void {
                context.add(outputs).toValue('module-sync')
                context
                    .add(outputs)
                    .toAsyncFactory(async (providerContext) => {
                        expectTypeOf(providerContext.getAllAsync(sources)).toEqualTypeOf<
                            Promise<string[]>
                        >()

                        return `module:${(await providerContext.getAllAsync(sources)).join('+')}`
                    })
                    .singleton()
            }
        })
        const composer = createComposer().use(sourceModule).use(outputModule)
        const rootBuilder = composer.add(outputs)

        expectTypeOf(rootBuilder).toEqualTypeOf<ComposerMultiBindingBuilder<string>>()
        rootBuilder.toValue('root-sync')
        expectTypeOf(
            rootBuilder.toAsyncFactory(async (context) => {
                expectTypeOf(context.getAllAsync(sources)).toEqualTypeOf<Promise<string[]>>()

                return `root:${(await context.getAllAsync(sources)).join('+')}`
            })
        ).toEqualTypeOf<AsyncFactoryBinding>()

        const runtime = await composer.compose()
        const expectedRuntimeValues = [
            'module-sync',
            'module:source-sync+source-async',
            'root-sync',
            'root:source-sync+source-async'
        ]

        expectTypeOf(runtime.getAllAsync(outputs)).toEqualTypeOf<Promise<string[]>>()
        expect(() => runtime.getAll(outputs)).toThrow(AsyncMultiProviderAccessError)
        await expect(runtime.getAllAsync(outputs)).resolves.toEqual(expectedRuntimeValues)

        const parent = runtime.createScope({
            multiValues: [[outputs, 'parent-local']]
        })
        const child = parent.createChildScope({
            multiValues: [[outputs, 'child-local']]
        })

        expectTypeOf(child.getAllAsync(outputs)).toEqualTypeOf<Promise<string[]>>()
        await expect(child.getAllAsync(outputs)).resolves.toEqual([
            ...expectedRuntimeValues,
            'parent-local',
            'child-local'
        ])

        await child.dispose()
        await parent.dispose()
        await runtime.dispose()
    })

    test('applies eager singleton options and exposes declarative provider summaries only', async () => {
        const values = token<string>('async-multi-composer.inspection.values')
        let moduleCalls = 0
        let rootCalls = 0
        const module = defineModule({
            id: 'async-multi-inspection-module',
            provides: [{ token: values, kind: 'custom', cardinality: 'multi' }],
            setup(context): void {
                context
                    .add(values)
                    .toAsyncFactory(async () => `module-${(moduleCalls += 1)}`)
                    .singleton()
                    .eager()
            }
        })
        const composer = createComposer().use(module)

        composer
            .add(values)
            .toAsyncFactory(async () => `root-${(rootCalls += 1)}`)
            .singleton()
            .eager()

        expect(moduleCalls).toBe(0)
        expect(rootCalls).toBe(0)

        const runtime = await composer.compose()
        const inspection = runtime.inspect()

        expect(moduleCalls).toBe(1)
        expect(rootCalls).toBe(1)
        expect(runtime.getAll(values)).toEqual(['module-1', 'root-1'])
        expect(inspection.providerRegistrations).toEqual([
            {
                source: 'module',
                moduleId: 'async-multi-inspection-module',
                tokenId: 'async-multi-composer.inspection.values',
                capabilityKind: 'custom',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'async-factory',
                        registrationIndex: 0,
                        lifetime: 'singleton',
                        initialization: 'eager'
                    }
                ]
            },
            {
                source: 'composition-root',
                tokenId: 'async-multi-composer.inspection.values',
                capabilityKind: 'custom',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'async-factory',
                        registrationIndex: 1,
                        lifetime: 'singleton',
                        initialization: 'eager'
                    }
                ]
            }
        ])

        const serializedInspection = JSON.stringify(inspection)
        const exportDocument = createGraphExportDocument(inspection)
        const exportedProviders = exportDocument.graph.capabilities[0]?.providers

        expect(serializedInspection).not.toMatch(/"(?:cache|inFlight|pending|ready|failed)"/u)
        expect(exportedProviders).toEqual([
            {
                source: 'module',
                moduleId: 'async-multi-inspection-module',
                registrationKind: 'add',
                registrationIndex: 0
            },
            {
                source: 'composition-root',
                registrationKind: 'add',
                registrationIndex: 1
            }
        ])
        expect(serializeGraphExport(exportDocument)).not.toContain('providerRegistrations')
        await runtime.dispose()
    })

    test('keeps async cardinality mismatches typed on composed runtimes and scopes', async () => {
        const single = token<string>('async-multi-composer.cardinality.single')
        const multi = token<string>('async-multi-composer.cardinality.multi')
        const module = defineModule({
            id: 'async-multi-cardinality-module',
            provides: [
                { token: single, kind: 'custom' },
                { token: multi, kind: 'custom', cardinality: 'multi' }
            ],
            setup(context): void {
                context.bind(single).toValue('single')
                context.add(multi).toAsyncFactory(async () => 'multi')
            }
        })
        const runtime = await createComposer().use(module).compose()
        const scope = runtime.createScope()

        await expect(runtime.getAllAsync(single)).rejects.toMatchObject({
            code: 'SAGIFIRE_IOC_GET_ALL_USED_FOR_SINGLE_TOKEN',
            details: {
                tokenId: 'async-multi-composer.cardinality.single',
                accessMethod: 'getAllAsync',
                cardinality: 'single'
            }
        })
        await expect(scope.getAllAsync(single)).rejects.toBeInstanceOf(
            GetAllUsedForSingleTokenError
        )
        expect(() => runtime.getAsync(multi)).toThrow(GetUsedForMultiTokenError)

        try {
            runtime.getAsync(multi)
        } catch (error) {
            expect(error).toBeInstanceOf(GetUsedForMultiTokenError)
            expect((error as Error).message).toContain('use getAllAsync() instead')
        }

        await scope.dispose()
        await runtime.dispose()
    })

    test('routes dependency options through the shared provider graph for module and root factories', async () => {
        const scoped = token<string>('async-multi-composer.metadata.scoped')
        const values = token<string>('async-multi-composer.metadata.values')
        let executions = 0
        const module = defineModule({
            id: 'async-multi-metadata-module',
            provides: [
                { token: scoped, kind: 'custom' },
                { token: values, kind: 'custom', cardinality: 'multi' }
            ],
            setup(context): void {
                context
                    .bind(scoped)
                    .toFactory(() => 'scoped')
                    .scoped()
                context
                    .add(values)
                    .toAsyncFactory(
                        async (providerContext) => {
                            executions += 1

                            return providerContext.get(scoped)
                        },
                        { dependencies: [{ token: scoped, access: 'instance' }] }
                    )
                    .singleton()
            }
        })
        const composer = createComposer({ lifetimeValidation: { mode: 'report' } }).use(module)

        composer
            .add(values)
            .toAsyncFactory(
                async (context) => {
                    executions += 1

                    return context.get(scoped)
                },
                { dependencies: [{ token: scoped, access: 'instance' }] }
            )
            .singleton()

        const runtime = await composer.compose()
        const diagnostics = runtime.inspect().lifetimeValidation?.diagnostics ?? []

        expect(executions).toBe(0)
        expect(
            diagnostics.filter((diagnostic) => {
                return diagnostic.code === 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE'
            })
        ).toHaveLength(2)

        await runtime.dispose()
    })

    test('sanitizes failures from module-private async multi contributions at registration', async () => {
        const rawPrivateTokenId = 'async-multi-composer.raw-private-failure-sentinel'
        const privateValues = token<string>(rawPrivateTokenId)
        const publicValue = token<string>('async-multi-composer.private.public')
        const module = defineModule({
            id: 'async-multi-private-failure-module',
            provides: [{ token: publicValue, kind: 'custom' }],
            setup(context): void {
                context.add(privateValues).toAsyncFactory(async () => {
                    throw new Error(rawPrivateTokenId)
                })
                context.bind(publicValue).toAsyncFactory(async (providerContext) => {
                    return (await providerContext.getAllAsync(privateValues)).join(',')
                })
            }
        })
        const runtime = await createComposer().use(module).compose()
        let error: unknown

        try {
            await runtime.getAsync(publicValue)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(AsyncMultiProviderResolutionError)
        expect(JSON.stringify(error)).not.toContain(rawPrivateTokenId)
        expect(JSON.stringify(runtime.inspect())).not.toContain(rawPrivateTokenId)

        if (error instanceof AsyncMultiProviderResolutionError) {
            expect(error.message).not.toContain(rawPrivateTokenId)
            expect(error.cause).toBeUndefined()
            expect(error.details?.collection).toEqual({
                kind: 'collection',
                visibility: 'private',
                moduleId: 'async-multi-private-failure-module',
                privateCollectionOrdinal: 0
            })
        }

        await runtime.dispose()
    })

    test('reuses private collection and provider cycle frames without leaking raw token IDs', async () => {
        const rawPrivateTokenId = 'async-multi-composer.raw-private-cycle-sentinel'
        const privateValues = token<string>(rawPrivateTokenId)
        const publicValue = token<string>('async-multi-composer.private-cycle.public')
        const module = defineModule({
            id: 'async-multi-private-cycle-module',
            provides: [{ token: publicValue, kind: 'custom' }],
            setup(context): void {
                context.add(privateValues).toAsyncFactory(async ({ getAllAsync }) => {
                    return (await getAllAsync(privateValues)).join(',')
                })
                context.bind(publicValue).toAsyncFactory(async (providerContext) => {
                    return (await providerContext.getAllAsync(privateValues)).join(',')
                })
            }
        })
        const runtime = await createComposer().use(module).compose()
        let error: unknown

        try {
            await runtime.getAsync(publicValue)
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(ProviderCycleError)
        expect(JSON.stringify(error)).not.toContain(rawPrivateTokenId)

        if (error instanceof ProviderCycleError) {
            expect(error.cause).toBeUndefined()
            expect((error.frames ?? []).map((frame) => frame.kind)).toEqual([
                'collection',
                'provider',
                'collection'
            ])
        }

        await runtime.dispose()
    })

    test('projects async root contribution metadata through existing graph export v1 fields', () => {
        const source = token<string>('async-multi-composer.graph.source')
        const target = token<string>('async-multi-composer.graph.target')
        let factoryCalls = 0
        const sourceModule = defineModule({
            id: 'async-multi-graph-source',
            provides: [{ token: source, kind: 'custom', cardinality: 'multi' }],
            setup(context): void {
                context.add(source).toValue('module')
            }
        })
        const consumerModule = defineModule({
            id: 'async-multi-graph-consumer',
            requires: [{ token: target }],
            setup(): void {}
        })
        const composer = createComposer().use(sourceModule).use(consumerModule)

        composer.add(source).toAsyncFactory(async () => `root-${(factoryCalls += 1)}`)
        composer
            .add(source)
            .toAsyncResource(async () => {
                factoryCalls += 1

                return { value: 'root-resource' }
            })
            .singleton()
        composer
            .adapt(target)
            .from(source)
            .using((value) => value)

        const document = createGraphExportDocument(composer.getGraph())
        const asyncSourceEdge = document.graph.edges.find((edge) => {
            return (
                edge.edgeKind === 'adapter-source' &&
                edge.sourceProvider?.providerKind === 'multi-binding'
            )
        })
        const resourceSourceEdge = document.graph.edges.find((edge) => {
            return (
                edge.edgeKind === 'adapter-source' &&
                edge.sourceProvider?.providerKind === 'multi-binding' &&
                edge.sourceProvider.bindingKind === 'async-resource'
            )
        })
        const json = serializeGraphExport(document)
        const dot = renderGraphExportDot(document)
        const mermaid = renderGraphExportMermaid(document)

        expect(factoryCalls).toBe(0)
        expect(asyncSourceEdge).toMatchObject({
            edgeKind: 'adapter-source',
            sourceProvider: {
                source: 'composition-root',
                providerKind: 'multi-binding',
                bindingKind: 'async-factory',
                cardinality: 'multi',
                registrationIndex: 1
            }
        })
        expect(resourceSourceEdge).toMatchObject({
            edgeKind: 'adapter-source',
            sourceProvider: {
                source: 'composition-root',
                providerKind: 'multi-binding',
                bindingKind: 'async-resource',
                cardinality: 'multi',
                registrationIndex: 2
            }
        })
        expect(json).toContain('"bindingKind": "async-factory"')
        expect(json).toContain('"bindingKind": "async-resource"')
        expect(json).not.toContain('providerRegistrations')
        expect(json).not.toMatch(/"(?:cache|inFlight|pending|ready|failed)"/u)
        expect(serializeGraphExport(document)).toBe(json)
        expect(renderGraphExportDot(document)).toBe(dot)
        expect(renderGraphExportMermaid(document)).toBe(mermaid)
    })

    test('supports module and composition-root resources with declarative inspection', async () => {
        const values = token<string>('async-multi-composer.resource.values')
        const disposed: string[] = []
        const module = defineModule({
            id: 'async-multi-resource-module',
            provides: [{ token: values, kind: 'custom', cardinality: 'multi' }],
            setup(context): void {
                const binding = context.add(values).toAsyncResource(async () => ({
                    value: 'module',
                    dispose(): void {
                        disposed.push('module')
                    }
                }))

                expectTypeOf(binding).toEqualTypeOf<AsyncResourceBinding>()
                binding.singleton()
            }
        })
        const composer = createComposer().use(module)
        const rootBinding = composer.add(values).toAsyncResource(async () => ({
            value: 'root',
            dispose(): void {
                disposed.push('root')
            }
        }))

        expectTypeOf(rootBinding).toEqualTypeOf<AsyncResourceBinding>()
        rootBinding.singleton()

        const runtime = await composer.compose()

        await expect(runtime.getAllAsync(values)).resolves.toEqual(['module', 'root'])
        expect(runtime.inspect().providerRegistrations).toEqual([
            {
                source: 'module',
                moduleId: 'async-multi-resource-module',
                tokenId: values.id,
                capabilityKind: 'custom',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'async-resource',
                        registrationIndex: 0,
                        lifetime: 'singleton',
                        initialization: 'lazy'
                    }
                ]
            },
            {
                source: 'composition-root',
                tokenId: values.id,
                capabilityKind: 'custom',
                cardinality: 'multi',
                visibility: 'exported',
                registrationKind: 'multi',
                providers: [
                    {
                        providerKind: 'async-resource',
                        registrationIndex: 1,
                        lifetime: 'singleton',
                        initialization: 'lazy'
                    }
                ]
            }
        ])
        const exportJson = serializeGraphExport(createGraphExportDocument(composer.getGraph()))

        expect(exportJson).toContain('"source": "composition-root"')
        expect(exportJson).not.toContain('providerRegistrations')
        expect(exportJson).not.toMatch(/"(?:cache|inFlight|pending|ready|failed)"/u)

        await runtime.dispose()
        expect(disposed).toEqual(['root', 'module'])
    })

    test('keeps private multi resource disposer failures private-safe', async () => {
        const privateValues = token<string>('PRIVATE_RESOURCE_SENTINEL_TOKEN')
        const output = token<string>('async-multi-composer.resource.private-output')
        const privateCause = new Error('PRIVATE_RESOURCE_SENTINEL_CAUSE')
        const module = defineModule({
            id: 'async-multi-resource-private-module',
            provides: [{ token: output, kind: 'custom' }],
            setup(context): void {
                context
                    .add(privateValues)
                    .toAsyncResource(async () => ({
                        value: 'private',
                        dispose(): void {
                            throw privateCause
                        }
                    }))
                    .singleton()
                context
                    .bind(output)
                    .toAsyncFactory(async ({ getAllAsync }) => {
                        return (await getAllAsync(privateValues)).join(',')
                    })
                    .singleton()
            }
        })
        const runtime = await createComposer().use(module).compose()

        await expect(runtime.getAsync(output)).resolves.toBe('private')

        let error: unknown

        try {
            await runtime.dispose()
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(ResourceDisposalError)

        if (error instanceof ResourceDisposalError) {
            expect(error.failures).toHaveLength(1)
            expect(error.failures[0]?.provider).toMatchObject({
                kind: 'provider',
                visibility: 'private',
                moduleId: 'async-multi-resource-private-module',
                registrationKind: 'multi'
            })
            expect(error.failures[0]?.cause).toBeUndefined()
            expect(error.cause).toBeUndefined()
            expect(JSON.stringify(error)).not.toContain(privateValues.id)
            expect(JSON.stringify(error)).not.toContain(privateCause.message)
            expect(error.message).not.toContain(privateValues.id)
        }
    })

    test('sanitizes private eager primary and cleanup failures together', async () => {
        const privateValues = token<string>('PRIVATE_EAGER_RESOURCE_TOKEN')
        const primaryFailure = new Error('PRIVATE_EAGER_PRIMARY_CAUSE')
        const cleanupFailure = new Error('PRIVATE_EAGER_CLEANUP_CAUSE')
        const module = defineModule({
            id: 'async-multi-resource-private-eager-module',
            provides: [],
            setup(context): void {
                context
                    .add(privateValues)
                    .toAsyncResource(async () => ({
                        value: 'acquired',
                        dispose(): void {
                            throw cleanupFailure
                        }
                    }))
                    .singleton()
                    .eager()
                context
                    .add(privateValues)
                    .toAsyncResource(async () => {
                        throw primaryFailure
                    })
                    .singleton()
                    .eager()
            }
        })

        let error: unknown

        try {
            await createComposer().use(module).compose()
        } catch (caught) {
            error = caught
        }

        expect(error).toBeInstanceOf(AsyncResourceCleanupError)

        if (error instanceof AsyncResourceCleanupError) {
            expect(error.cause).toBeInstanceOf(AsyncMultiProviderResolutionError)
            expect((error.cause as AsyncMultiProviderResolutionError).cause).toBeUndefined()
            expect(error.cleanupError.cause).toBeUndefined()
            expect(error.cleanupError.failures[0]?.cause).toBeUndefined()

            const serialized = JSON.stringify(error)

            expect(serialized).not.toContain(privateValues.id)
            expect(serialized).not.toContain(primaryFailure.message)
            expect(serialized).not.toContain(cleanupFailure.message)
        }
    })
})
