import { describe, expect, test } from 'vitest'

import {
    add,
    bind,
    defineModule,
    defineApp,
    getLifetimeValidationReport,
    token,
    type ProviderDependencyOptions
} from '@sagifire/ioc'
import {
    GraphAssertionError,
    assertLifetimeValidationReportHasDiagnostic,
    assertLifetimeValidationReportOk,
    assertProviderGraphCoverage,
    assertProviderGraphHasCoverage,
    assertProviderGraphHasDependencyEdge,
    assertProviderGraphHasNode,
    assertScopeInspectionHasProviderNode,
    createTestComposer,
    createTestRuntime,
    fakeModule,
    multiOverride,
    override,
    type ProviderDependencyEdgeExpectation
} from '../src/index.js'

interface ScopedDependency {
    readonly id: string
}

interface SingletonConsumer {
    readonly dependency: ScopedDependency
}

const SCOPED = token<ScopedDependency>('testing.lifetime.scoped')
const CONSUMER = token<SingletonConsumer>('testing.lifetime.consumer')
const MULTI_CONSUMER = token<SingletonConsumer>('testing.lifetime.multi-consumer')
const OPTION: ProviderDependencyOptions = {
    dependencies: [
        {
            token: SCOPED,
            access: 'instance'
        }
    ]
}
const EMPTY_OPTION: ProviderDependencyOptions = {
    dependencies: []
}

describe('lifetime validation testing helpers', () => {
    test('asserts public provider graph, coverage and diagnostics without executing factories', async () => {
        let factoryExecutions = 0
        const runtime = await createTestRuntime({
            lifetimeValidation: {
                mode: 'report',
                coverage: 'summary'
            },
            configure(container) {
                container
                    .bind(SCOPED)
                    .toFactory(() => {
                        factoryExecutions += 1

                        return {
                            id: 'scoped'
                        }
                    }, EMPTY_OPTION)
                    .scoped()
                container
                    .bind(CONSUMER)
                    .toFactory((context) => {
                        factoryExecutions += 1

                        return {
                            dependency: context.get(SCOPED)
                        }
                    }, OPTION)
                    .singleton()
            }
        })

        const inspection = runtime.inspect()
        expect(factoryExecutions).toBe(0)
        assertProviderGraphCoverage(inspection, 'complete')
        assertProviderGraphHasNode(inspection, {
            key: {
                visibility: 'public',
                tokenId: SCOPED.id,
                registrationIndex: 0
            },
            providerKind: 'factory',
            lifetime: 'scoped'
        })
        assertProviderGraphHasDependencyEdge(inspection, {
            consumer: {
                visibility: 'public',
                tokenId: CONSUMER.id
            },
            dependency: {
                visibility: 'public',
                tokenId: SCOPED.id
            },
            access: 'instance'
        })
        assertProviderGraphHasCoverage(inspection, {
            provider: {
                visibility: 'public',
                tokenId: CONSUMER.id
            },
            coverage: 'declared'
        })
        expect(inspection.lifetimeValidation).toBeDefined()
        assertLifetimeValidationReportHasDiagnostic(inspection.lifetimeValidation!, {
            code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE',
            severity: 'error'
        })
        assertLifetimeValidationReportHasDiagnostic(getLifetimeValidationReport(runtime), {
            code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE'
        })

        const scope = runtime.createScope()
        assertScopeInspectionHasProviderNode(scope, {
            key: {
                visibility: 'public',
                tokenId: SCOPED.id
            },
            lifetime: 'scoped'
        })
        await scope.dispose()
        await runtime.dispose()
    })

    test('keeps a clean report assertion useful for explicit complete coverage', async () => {
        const valueToken = token<number>('testing.lifetime.value')
        const runtime = await createTestRuntime({
            lifetimeValidation: {
                mode: 'report',
                coverage: 'summary'
            },
            configure(container) {
                container.bind(valueToken).toValue(1)
            }
        })

        const report = getLifetimeValidationReport(runtime)
        assertLifetimeValidationReportOk(report)
        await runtime.dispose()
    })

    test('preserves dependency metadata through overrides, multi overrides and fake modules', async () => {
        const overrideRuntime = await createTestRuntime({
            lifetimeValidation: {
                mode: 'report'
            },
            configure(container) {
                container.bind(SCOPED).toValue({ id: 'override-dependency' })
            },
            overrides: [
                override(CONSUMER).toFactory(
                    (context) => ({
                        dependency: context.get(SCOPED)
                    }),
                    OPTION
                )
            ],
            multiOverrides: [
                multiOverride(MULTI_CONSUMER).appendFactory(
                    (context) => ({
                        dependency: context.get(SCOPED)
                    }),
                    OPTION
                )
            ]
        })

        assertProviderGraphHasDependencyEdge(overrideRuntime.inspect(), {
            consumer: {
                visibility: 'public',
                tokenId: CONSUMER.id
            },
            dependency: {
                visibility: 'public',
                tokenId: SCOPED.id
            }
        })
        assertProviderGraphHasDependencyEdge(overrideRuntime.inspect(), {
            consumer: {
                visibility: 'public',
                tokenId: MULTI_CONSUMER.id
            },
            dependency: {
                visibility: 'public',
                tokenId: SCOPED.id
            }
        })
        await overrideRuntime.dispose()

        const fake = fakeModule({
            id: 'testing-lifetime-fake',
            provides: [
                {
                    token: SCOPED,
                    useValue: {
                        id: 'fake-dependency'
                    }
                },
                {
                    token: CONSUMER,
                    useFactory: (context) => ({
                        dependency: context.get(SCOPED)
                    }),
                    options: OPTION
                }
            ]
        })
        const fakeRuntime = await createTestComposer({
            modules: [fake],
            lifetimeValidation: {
                mode: 'report'
            }
        }).compose()

        assertProviderGraphHasDependencyEdge(fakeRuntime.inspect(), {
            consumer: {
                visibility: 'public',
                tokenId: CONSUMER.id
            },
            dependency: {
                visibility: 'public',
                tokenId: SCOPED.id
            }
        })
        await fakeRuntime.dispose()
    })

    test('projects options for every dependency-capable DSL registration', () => {
        const syncBinding = bind(CONSUMER).toFactory(
            (context) => ({ dependency: context.get(SCOPED) }),
            OPTION
        )
        const asyncBinding = bind(CONSUMER).toAsyncFactory(
            async (context) => ({ dependency: context.get(SCOPED) }),
            OPTION
        )
        const syncContribution = add(CONSUMER).toFactory(
            (context) => ({ dependency: context.get(SCOPED) }),
            OPTION
        )
        const asyncContribution = add(CONSUMER).toAsyncFactory(
            async (context) => ({ dependency: context.get(SCOPED) }),
            OPTION
        )
        const resourceContribution = add(CONSUMER).toAsyncResource(
            async (context) => ({
                value: {
                    dependency: context.get(SCOPED)
                },
                dispose(): void {}
            }),
            OPTION
        )

        expect(syncBinding.options).toBe(OPTION)
        expect(asyncBinding.options).toBe(OPTION)
        expect(syncContribution.options).toBe(OPTION)
        expect(asyncContribution.options).toBe(OPTION)
        expect(resourceContribution.options).toBe(OPTION)
    })

    test('keeps private provider identities sentinel-free in inspection and assertion output', async () => {
        const privateDependency = token<ScopedDependency>(
            'testing.lifetime.PRIVATE-DEPENDENCY-SENTINEL'
        )
        const privateConsumer = token<SingletonConsumer>(
            'testing.lifetime.PRIVATE-CONSUMER-SENTINEL'
        )
        const publicCapability = token<string>('testing.lifetime.public-capability')
        const privateModule = defineModule({
            id: 'testing-lifetime-private-module',
            provides: [
                {
                    token: publicCapability,
                    kind: 'public-api'
                }
            ],
            setup(context) {
                context
                    .bind(privateDependency)
                    .toFactory(() => ({ id: 'private' }), EMPTY_OPTION)
                    .scoped()
                context
                    .bind(privateConsumer)
                    .toFactory(
                        (resolutionContext) => ({
                            dependency: resolutionContext.get(privateDependency)
                        }),
                        {
                            dependencies: [
                                {
                                    token: privateDependency,
                                    access: 'instance'
                                }
                            ]
                        }
                    )
                    .singleton()
                context.bind(publicCapability).toValue('public')
            }
        })
        const runtime = await createTestComposer({
            modules: [privateModule],
            lifetimeValidation: {
                mode: 'report'
            }
        }).compose()
        const inspection = runtime.inspect()

        assertProviderGraphHasNode(inspection, {
            key: {
                visibility: 'private',
                moduleId: privateModule.id
            },
            providerKind: 'factory'
        })
        expect(() => {
            assertProviderGraphHasNode(inspection, {
                key: {
                    moduleId: 'missing-private-module'
                },
                providerKind: 'value'
            })
        }).toThrow(GraphAssertionError)
        expect(() => {
            assertProviderGraphHasNode(inspection, {
                key: {
                    tokenId: publicCapability.id
                },
                providerKind: 'factory'
            })
        }).toThrow(GraphAssertionError)
        expect(JSON.stringify(inspection)).not.toContain(privateDependency.id)
        expect(JSON.stringify(inspection)).not.toContain(privateConsumer.id)

        let assertionError: GraphAssertionError | undefined

        try {
            assertProviderGraphHasNode(inspection, {
                key: {
                    visibility: 'private',
                    moduleId: 'missing-private-module'
                }
            })
        } catch (error) {
            if (error instanceof GraphAssertionError) {
                assertionError = error
            } else {
                throw error
            }
        }

        expect(assertionError).toBeDefined()
        expect(assertionError?.message).not.toContain(privateDependency.id)
        expect(assertionError?.message).not.toContain(privateConsumer.id)
        await runtime.dispose()
    })

    test('projects dependency options through the DSL and app lifetime options', async () => {
        const contractModule = defineModule({
            id: 'testing-lifetime-dsl-contract',
            requires: [
                {
                    token: SCOPED
                }
            ],
            provides: [
                {
                    token: CONSUMER,
                    kind: 'public-api',
                    cardinality: 'multi'
                }
            ],
            setup(context) {
                context.add(CONSUMER).toValue({
                    dependency: {
                        id: 'module-contribution'
                    }
                })
            }
        })
        const edgeExpectation: ProviderDependencyEdgeExpectation = {
            consumer: {
                visibility: 'public',
                tokenId: CONSUMER.id
            },
            dependency: {
                visibility: 'public',
                tokenId: SCOPED.id
            },
            access: 'instance'
        }
        const binding = add(CONSUMER)
            .toFactory(
                (context) => ({
                    dependency: context.get(SCOPED)
                }),
                OPTION
            )
            .transient()
        const app = defineApp({
            modules: [contractModule],
            options: {
                lifetimeValidation: {
                    mode: 'report'
                }
            },
            bindings: [bind(SCOPED).toValue({ id: 'scoped' }), binding]
        })

        expect(binding.options).toBe(OPTION)
        expect(app.options?.lifetimeValidation?.mode).toBe('report')

        expect(app.validate().diagnostics).toEqual([])
        const runtime = await app.compose()
        assertProviderGraphHasDependencyEdge(runtime.inspect(), edgeExpectation)
        await runtime.dispose()
    })
})
