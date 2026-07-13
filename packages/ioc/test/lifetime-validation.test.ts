import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    DependencyMetadataInvalidError,
    LifetimeValidationError,
    createComposer,
    createContainer,
    defineModule,
    token,
    type LifetimeBinding,
    type LifetimeValidationOptions,
    type LifetimeValidationReport,
    type ProviderDependencyOptions,
    type ProviderLifetime
} from '../src/index.js'

describe('static lifetime validation', () => {
    test.each([
        ['singleton', 'singleton', undefined],
        ['singleton', 'scoped', 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE'],
        ['singleton', 'transient', 'SAGIFIRE_IOC_LIFETIME_CAPTURE_SENSITIVE'],
        ['scoped', 'singleton', undefined],
        ['scoped', 'scoped', undefined],
        ['scoped', 'transient', 'SAGIFIRE_IOC_LIFETIME_CAPTURE_SENSITIVE'],
        ['transient', 'singleton', undefined],
        ['transient', 'scoped', 'SAGIFIRE_IOC_LIFETIME_CAPTURE_SENSITIVE'],
        ['transient', 'transient', 'SAGIFIRE_IOC_LIFETIME_CAPTURE_SENSITIVE']
    ] satisfies readonly [ProviderLifetime, ProviderLifetime, string | undefined][])(
        '%s consumer to %s dependency follows the approved matrix',
        async (consumerLifetime, dependencyLifetime, expectedCode) => {
            const report = createMatrixReport(consumerLifetime, dependencyLifetime)

            expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
                expectedCode === undefined ? [] : [expectedCode]
            )
            expect(report.blocked).toBe(false)
        }
    )

    test.each([
        ['singleton', 'singleton'],
        ['singleton', 'scoped'],
        ['singleton', 'transient'],
        ['scoped', 'singleton'],
        ['scoped', 'scoped'],
        ['scoped', 'transient'],
        ['transient', 'singleton'],
        ['transient', 'scoped'],
        ['transient', 'transient']
    ] satisfies readonly [ProviderLifetime, ProviderLifetime][])(
        '%s consumer to %s dependency remains safe through a caller-scope deferred handle',
        (consumerLifetime, dependencyLifetime) => {
            expect(createDeferredMatrixReport(consumerLifetime, dependencyLifetime)).toMatchObject({
                blocked: false,
                diagnostics: []
            })
        }
    )

    test('classifies singleton to value as a safe direct borrow', () => {
        const dependency = token<string>('lifetime.value.dependency')
        const consumer = token<string>('lifetime.value.consumer')
        const container = createContainer({ lifetimeValidation: { mode: 'report' } })

        container.bind(dependency).toValue('value')
        container
            .bind(consumer)
            .toFactory(() => 'consumer', {
                dependencies: [{ token: dependency, access: 'instance' }]
            })
            .singleton()

        expect(container.validateLifetime()).toMatchObject({ blocked: false, diagnostics: [] })
    })

    test('uses managed-resource owner facts without executing resource factories', () => {
        const runtimeResource = token<string>('lifetime.resource.runtime')
        const scopeResource = token<string>('lifetime.resource.scope')
        const runtimeConsumer = token<string>('lifetime.resource.runtime-consumer')
        const scopeConsumer = token<string>('lifetime.resource.scope-consumer')
        const scopedBorrower = token<string>('lifetime.resource.scoped-borrower')
        const transientRuntimeBorrower = token<string>(
            'lifetime.resource.transient-runtime-borrower'
        )
        const transientScopeBorrower = token<string>('lifetime.resource.transient-scope-borrower')
        const container = createContainer({ lifetimeValidation: { mode: 'report' } })
        let executions = 0
        const resourceFactory = async () => {
            executions += 1

            return { value: 'resource', dispose(): void {} }
        }

        container
            .bind(runtimeResource)
            .toAsyncResource(resourceFactory, { dependencies: [] })
            .singleton()
        container
            .bind(scopeResource)
            .toAsyncResource(resourceFactory, { dependencies: [] })
            .scoped()
        container
            .bind(runtimeConsumer)
            .toFactory(() => 'runtime', {
                dependencies: [{ token: runtimeResource, access: 'instance' }]
            })
            .singleton()
        container
            .bind(scopeConsumer)
            .toFactory(() => 'scope', {
                dependencies: [{ token: scopeResource, access: 'instance' }]
            })
            .singleton()
        container
            .bind(scopedBorrower)
            .toFactory(() => 'scoped-borrower', {
                dependencies: [{ token: runtimeResource, access: 'instance' }]
            })
            .scoped()
        container.bind(transientRuntimeBorrower).toFactory(() => 'transient-runtime', {
            dependencies: [{ token: runtimeResource, access: 'instance' }]
        })
        container.bind(transientScopeBorrower).toFactory(() => 'transient-scope', {
            dependencies: [{ token: scopeResource, access: 'instance' }]
        })

        const report = container.validateLifetime()

        expect(executions).toBe(0)
        expect(report.diagnostics).toMatchObject([
            {
                code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE',
                severity: 'error',
                details: {
                    dependencyOwner: 'scope',
                    evidence: 'proven-unsafe'
                }
            },
            {
                code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_SENSITIVE',
                severity: 'warning',
                details: {
                    dependencyOwner: 'scope',
                    evidence: 'lifetime-sensitive'
                }
            }
        ])
    })

    test('treats deferred caller-scope access as safe and validates its handle', () => {
        const scoped = token<string>('lifetime.deferred.scoped')
        const handle = token<() => string>('lifetime.deferred.handle')
        const consumer = token<string>('lifetime.deferred.consumer')
        const container = createContainer({ lifetimeValidation: { mode: 'enforce' } })

        container
            .bind(scoped)
            .toFactory(() => 'scoped')
            .scoped()
        container.bind(handle).toValue(() => 'value')
        container
            .bind(consumer)
            .toFactory(() => 'consumer', {
                dependencies: [
                    {
                        token: scoped,
                        access: 'deferred',
                        via: handle,
                        scope: 'caller'
                    }
                ]
            })
            .singleton()

        expect(container.validateLifetime()).toMatchObject({ blocked: false, diagnostics: [] })
    })

    test('keeps unsafe severity stable while policy controls blocking only', async () => {
        const off = createUnsafeContainer('off')
        const report = createUnsafeContainer('report')
        const enforce = createUnsafeContainer('enforce')

        expect(off.container.validateLifetime()).toMatchObject({ blocked: false, diagnostics: [] })
        expect(report.container.validateLifetime()).toMatchObject({
            blocked: false,
            diagnostics: [
                {
                    code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE',
                    severity: 'error'
                }
            ]
        })
        expect(enforce.container.validateLifetime()).toMatchObject({
            blocked: true,
            diagnostics: [
                {
                    code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE',
                    severity: 'error'
                }
            ]
        })
        await expect(off.container.freeze()).resolves.toBeDefined()
        await expect(report.container.freeze()).resolves.toBeDefined()
        await expect(enforce.container.freeze()).rejects.toBeInstanceOf(LifetimeValidationError)
        expect(off.executions()).toBe(0)
        expect(report.executions()).toBe(0)
        expect(enforce.executions()).toBe(0)
    })

    test.each(['off', 'report', 'enforce'] satisfies readonly LifetimeValidationOptions['mode'][])(
        'blocks invalid explicit metadata in %s mode',
        async (mode) => {
            const missing = token<string>(`lifetime.invalid.${mode}.missing`)
            const consumer = token<string>(`lifetime.invalid.${mode}.consumer`)
            const container = createContainer({ lifetimeValidation: { mode } })
            let executions = 0

            container.bind(consumer).toFactory(
                () => {
                    executions += 1

                    return 'consumer'
                },
                { dependencies: [{ token: missing, access: 'instance' }] }
            )

            const report = container.validateLifetime()

            expect(report.blocked).toBe(true)
            expect(report.diagnostics).toMatchObject([
                {
                    code: 'SAGIFIRE_IOC_DEPENDENCY_METADATA_INVALID',
                    severity: 'error',
                    details: { reason: 'missing-target' }
                }
            ])
            await expect(container.freeze()).rejects.toBeInstanceOf(LifetimeValidationError)
            expect(executions).toBe(0)
        }
    )

    test('reports target cardinality and deferred handle contract violations', () => {
        const single = token<string>('lifetime.invalid.single')
        const multi = token<string>('lifetime.invalid.multi')
        const missingHandle = token<string>('lifetime.invalid.missing-handle')
        const firstConsumer = token<string>('lifetime.invalid.first-consumer')
        const secondConsumer = token<string>('lifetime.invalid.second-consumer')
        const thirdConsumer = token<string>('lifetime.invalid.third-consumer')
        const container = createContainer({ lifetimeValidation: { mode: 'report' } })

        container.bind(single).toValue('single')
        container.add(multi).toValue('multi')
        container.bind(firstConsumer).toFactory(() => 'first', {
            dependencies: [{ token: single, access: 'instance', cardinality: 'multi' }]
        })
        container.bind(secondConsumer).toFactory(() => 'second', {
            dependencies: [{ token: multi, access: 'instance' }]
        })
        container.bind(thirdConsumer).toFactory(() => 'third', {
            dependencies: [
                {
                    token: single,
                    access: 'deferred',
                    via: missingHandle,
                    scope: 'caller'
                }
            ]
        })

        expect(
            container.validateLifetime().diagnostics.map((diagnostic) => diagnostic.details)
        ).toMatchObject([
            { reason: 'target-cardinality-mismatch' },
            { reason: 'target-cardinality-mismatch' },
            { reason: 'missing-deferred-handle' }
        ])
    })

    test('allows an explicitly declared empty multi target', () => {
        const emptyMulti = token<string>('lifetime.empty-multi')
        const consumer = token<string>('lifetime.empty-multi.consumer')
        const container = createContainer({ lifetimeValidation: { mode: 'enforce' } })

        container.bind(consumer).toFactory(() => 'consumer', {
            dependencies: [{ token: emptyMulti, access: 'instance', cardinality: 'multi' }]
        })

        expect(container.validateLifetime()).toMatchObject({ blocked: false, diagnostics: [] })
    })

    test('aggregates unknown coverage without classifying it as unsafe', () => {
        const declared = token<string>('lifetime.coverage.declared')
        const undeclared = token<string>('lifetime.coverage.undeclared')
        const container = createContainer({
            lifetimeValidation: { mode: 'report', coverage: 'summary' }
        })

        container.bind(declared).toFactory(() => 'declared', { dependencies: [] })
        container.bind(undeclared).toFactory(() => 'undeclared')

        const report = container.validateLifetime()

        expect(report.coverage).toBe('partial')
        expect(report.blocked).toBe(false)
        expect(report.diagnostics).toEqual([
            {
                code: 'SAGIFIRE_IOC_DEPENDENCY_METADATA_INCOMPLETE',
                severity: 'warning',
                message: 'Provider dependency metadata coverage is partial',
                details: { coverage: 'partial', evidence: 'unknown' }
            }
        ])
    })

    test.each(['off', 'report', 'enforce'] satisfies readonly LifetimeValidationOptions['mode'][])(
        'rejects structurally invalid metadata with a typed sanitized error in %s mode',
        (mode) => {
            const consumer = token<string>(`lifetime.structure.${mode}.consumer`)
            const container = createContainer({ lifetimeValidation: { mode } })
            const invalidOptions = {
                dependencies: [{ access: 'instance' }]
            } as unknown as ProviderDependencyOptions

            let structuralError: unknown

            try {
                container.bind(consumer).toFactory(() => 'consumer', invalidOptions)
            } catch (error) {
                structuralError = error
            }

            expect(structuralError).toBeInstanceOf(DependencyMetadataInvalidError)
            expect(structuralError).toMatchObject({
                code: 'SAGIFIRE_IOC_DEPENDENCY_METADATA_INVALID',
                cause: undefined,
                details: { dependencyIndex: 0, field: 'token' }
            })
        }
    )

    test('carries private-safe post-setup report into runtime inspection without changing .ok', async () => {
        const privateScoped = token<string>('lifetime.raw.private.scoped-sentinel')
        const publicService = token<string>('lifetime.public.service')
        let executions = 0
        const feature = defineModule({
            id: 'lifetime-feature',
            provides: [{ token: publicService, kind: 'custom' }],
            setup(context) {
                context
                    .bind(privateScoped)
                    .toFactory(() => 'private')
                    .scoped()
                context
                    .bind(publicService)
                    .toFactory(
                        () => {
                            executions += 1

                            return 'public'
                        },
                        { dependencies: [{ token: privateScoped, access: 'instance' }] }
                    )
                    .singleton()
            }
        })
        const composer = createComposer({ lifetimeValidation: { mode: 'report' } }).use(feature)

        expect(composer.validate()).toEqual({ ok: true, diagnostics: [] })

        const runtime = await composer.compose()
        const inspection = runtime.inspect()
        const serialized = JSON.stringify(inspection.lifetimeValidation)

        expect(executions).toBe(0)
        expect(inspection.validation).toEqual({ ok: true, diagnostics: [] })
        expect(inspection.lifetimeValidation).toMatchObject({
            mode: 'report',
            blocked: false,
            diagnostics: [
                {
                    code: 'SAGIFIRE_IOC_LIFETIME_CAPTURE_UNSAFE',
                    severity: 'error'
                }
            ]
        })
        expect(serialized).not.toContain('lifetime.raw.private.scoped-sentinel')

        let enforcementError: unknown

        try {
            await createComposer({ lifetimeValidation: { mode: 'enforce' } })
                .use(feature)
                .compose()
        } catch (error) {
            enforcementError = error
        }

        expect(enforcementError).toBeInstanceOf(LifetimeValidationError)
        expect(enforcementError).toMatchObject({ cause: undefined })
        expect(
            JSON.stringify({
                message: (enforcementError as Error).message,
                details: (enforcementError as LifetimeValidationError).details,
                cause: (enforcementError as LifetimeValidationError).cause
            })
        ).not.toContain('lifetime.raw.private.scoped-sentinel')
    })

    test('keeps default off metadata-free applications diagnostic-free and typed', async () => {
        const service = token<string>('lifetime.default.service')
        const container = createContainer()

        container.bind(service).toFactory(() => 'service')

        const preflight = container.validateLifetime()
        const runtime = await container.freeze()
        const composedRuntime = await createComposer().compose()

        expect(preflight).toEqual({
            mode: 'off',
            blocked: false,
            coverage: 'none',
            diagnostics: []
        })
        expect(runtime.get(service)).toBe('service')
        expect(composedRuntime.inspect()).not.toHaveProperty('lifetimeValidation')
        expectTypeOf(preflight).toEqualTypeOf<LifetimeValidationReport>()
    })
})

function createMatrixReport(
    consumerLifetime: ProviderLifetime,
    dependencyLifetime: ProviderLifetime
): LifetimeValidationReport {
    const dependency = token<string>(
        `lifetime.matrix.${consumerLifetime}.${dependencyLifetime}.dependency`
    )
    const consumer = token<string>(
        `lifetime.matrix.${consumerLifetime}.${dependencyLifetime}.consumer`
    )
    const container = createContainer({ lifetimeValidation: { mode: 'report' } })

    setLifetime(
        container.bind(dependency).toFactory(() => 'dependency'),
        dependencyLifetime
    )
    setLifetime(
        container.bind(consumer).toFactory(() => 'consumer', {
            dependencies: [{ token: dependency, access: 'instance' }]
        }),
        consumerLifetime
    )

    return container.validateLifetime()
}

function createDeferredMatrixReport(
    consumerLifetime: ProviderLifetime,
    dependencyLifetime: ProviderLifetime
): LifetimeValidationReport {
    const dependency = token<string>(
        `lifetime.deferred-matrix.${consumerLifetime}.${dependencyLifetime}.dependency`
    )
    const handle = token<() => string>(
        `lifetime.deferred-matrix.${consumerLifetime}.${dependencyLifetime}.handle`
    )
    const consumer = token<string>(
        `lifetime.deferred-matrix.${consumerLifetime}.${dependencyLifetime}.consumer`
    )
    const container = createContainer({ lifetimeValidation: { mode: 'enforce' } })

    setLifetime(
        container.bind(dependency).toFactory(() => 'dependency'),
        dependencyLifetime
    )
    container.bind(handle).toValue(() => 'dependency')
    setLifetime(
        container.bind(consumer).toFactory(() => 'consumer', {
            dependencies: [
                {
                    token: dependency,
                    access: 'deferred',
                    via: handle,
                    scope: 'caller'
                }
            ]
        }),
        consumerLifetime
    )

    return container.validateLifetime()
}

function setLifetime(binding: LifetimeBinding, lifetime: ProviderLifetime): void {
    if (lifetime === 'singleton') {
        binding.singleton()
    } else if (lifetime === 'scoped') {
        binding.scoped()
    } else {
        binding.transient()
    }
}

function createUnsafeContainer(mode: NonNullable<LifetimeValidationOptions['mode']>) {
    const scoped = token<string>(`lifetime.policy.${mode}.scoped`)
    const consumer = token<string>(`lifetime.policy.${mode}.consumer`)
    const container = createContainer({ lifetimeValidation: { mode } })
    let executionCount = 0

    container
        .bind(scoped)
        .toFactory(() => 'scoped')
        .scoped()
    container
        .bind(consumer)
        .toFactory(
            () => {
                executionCount += 1

                return 'consumer'
            },
            { dependencies: [{ token: scoped, access: 'instance' }] }
        )
        .singleton()

    return {
        container,
        executions: () => executionCount
    }
}
