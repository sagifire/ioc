import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    createComposer,
    createContainer,
    defineModule,
    token,
    type ProviderDependency,
    type ProviderDependencyOptions
} from '../src/index.js'
import { getProviderGraphSnapshot } from '../src/provider-metadata.js'

describe('provider metadata foundation', () => {
    test('normalizes deterministic single, multi, deferred and empty-multi selectors', async () => {
        const single = token<string>('metadata.single')
        const multi = token<string>('metadata.multi')
        const emptyMulti = token<string>('metadata.empty-multi')
        const handle = token<string>('metadata.handle')
        const consumer = token<string>('metadata.consumer')
        const container = createContainer()
        let factoryExecutions = 0
        const declaredDependencies = [
            { token: single, access: 'instance' as const },
            { token: multi, access: 'instance' as const, cardinality: 'multi' as const },
            {
                token: emptyMulti,
                access: 'deferred' as const,
                cardinality: 'multi' as const,
                via: handle,
                scope: 'caller' as const
            }
        ] satisfies ProviderDependency[]

        container.bind(single).toValue('single')
        container.add(multi).toValue('first')
        container.add(multi).toValue('second')
        container.bind(handle).toValue('handle')
        container.bind(consumer).toFactory(
            () => {
                factoryExecutions += 1

                return 'consumer'
            },
            {
                dependencies: declaredDependencies
            }
        )
        declaredDependencies.push({ token: handle, access: 'instance' })

        const runtime = await container.freeze()
        const snapshot = getProviderGraphSnapshot(runtime)

        expect(factoryExecutions).toBe(0)
        expect(snapshot).toEqual({
            nodes: [
                publicNode('metadata.single', 0, 'single', 'value', 'singleton'),
                publicNode('metadata.multi', 0, 'multi', 'value', 'singleton'),
                publicNode('metadata.multi', 1, 'multi', 'value', 'singleton'),
                publicNode('metadata.handle', 0, 'single', 'value', 'singleton'),
                publicNode('metadata.consumer', 0, 'single', 'factory', 'transient')
            ],
            selectors: [
                {
                    selectorIndex: 0,
                    consumer: publicKey('metadata.consumer', 0),
                    target: { visibility: 'public', tokenId: 'metadata.single' },
                    access: 'instance',
                    cardinality: 'single',
                    targetRegistrationKind: 'single'
                },
                {
                    selectorIndex: 1,
                    consumer: publicKey('metadata.consumer', 0),
                    target: { visibility: 'public', tokenId: 'metadata.multi' },
                    access: 'instance',
                    cardinality: 'multi',
                    targetRegistrationKind: 'multi'
                },
                {
                    selectorIndex: 2,
                    consumer: publicKey('metadata.consumer', 0),
                    target: { visibility: 'public', tokenId: 'metadata.empty-multi' },
                    access: 'deferred',
                    cardinality: 'multi',
                    targetRegistrationKind: 'missing',
                    via: { visibility: 'public', tokenId: 'metadata.handle' },
                    viaRegistrationKind: 'single',
                    scope: 'caller'
                }
            ],
            dependencyEdges: [
                {
                    selectorIndex: 0,
                    consumer: publicKey('metadata.consumer', 0),
                    dependency: publicKey('metadata.single', 0),
                    access: 'instance'
                },
                {
                    selectorIndex: 1,
                    consumer: publicKey('metadata.consumer', 0),
                    dependency: publicKey('metadata.multi', 0),
                    access: 'instance'
                },
                {
                    selectorIndex: 1,
                    consumer: publicKey('metadata.consumer', 0),
                    dependency: publicKey('metadata.multi', 1),
                    access: 'instance'
                }
            ],
            ownershipEdges: [],
            providerCoverage: [
                { provider: publicKey('metadata.single', 0), coverage: 'not-applicable' },
                { provider: publicKey('metadata.multi', 0), coverage: 'not-applicable' },
                { provider: publicKey('metadata.multi', 1), coverage: 'not-applicable' },
                { provider: publicKey('metadata.handle', 0), coverage: 'not-applicable' },
                { provider: publicKey('metadata.consumer', 0), coverage: 'declared' }
            ],
            coverage: 'complete'
        })
        expect(Object.isFrozen(snapshot)).toBe(true)
        expect(Object.isFrozen(snapshot.nodes)).toBe(true)
        expect(Object.isFrozen(snapshot.selectors)).toBe(true)
        expect(Object.isFrozen(snapshot.dependencyEdges)).toBe(true)
    })

    test('derives managed-resource ownership without executing resource factories', async () => {
        const runtimeResource = token<string>('metadata.runtime-resource')
        const scopeResource = token<string>('metadata.scope-resource')
        const container = createContainer()
        let executions = 0
        const createResource = async () => {
            executions += 1

            return {
                value: 'resource',
                dispose(): void {}
            }
        }

        container
            .bind(runtimeResource)
            .toAsyncResource(createResource, { dependencies: [] })
            .singleton()
        container.bind(scopeResource).toAsyncResource(createResource, { dependencies: [] }).scoped()

        const runtime = await container.freeze()
        const snapshot = getProviderGraphSnapshot(runtime)

        expect(executions).toBe(0)
        expect(snapshot.ownershipEdges).toEqual([
            { provider: publicKey('metadata.runtime-resource', 0), owner: 'runtime' },
            { provider: publicKey('metadata.scope-resource', 0), owner: 'scope' }
        ])
        expect(snapshot.coverage).toBe('complete')
    })

    test('aggregates explicit declared and undeclared provider coverage', async () => {
        const declared = token<string>('metadata.coverage.declared')
        const undeclared = token<string>('metadata.coverage.undeclared')
        const partialContainer = createContainer()

        partialContainer.bind(declared).toFactory(() => 'declared', { dependencies: [] })
        partialContainer.bind(undeclared).toFactory(() => 'undeclared')

        const partialRuntime = await partialContainer.freeze()
        const partialSnapshot = getProviderGraphSnapshot(partialRuntime)
        const noneContainer = createContainer()

        noneContainer.bind(undeclared).toFactory(() => 'undeclared')

        const noneRuntime = await noneContainer.freeze()

        expect(partialSnapshot.providerCoverage).toEqual([
            { provider: publicKey('metadata.coverage.declared', 0), coverage: 'declared' },
            { provider: publicKey('metadata.coverage.undeclared', 0), coverage: 'undeclared' }
        ])
        expect(partialSnapshot.coverage).toBe('partial')
        expect(getProviderGraphSnapshot(noneRuntime).coverage).toBe('none')
    })

    test('bridges interleaved private providers to collision-free keys without raw IDs', async () => {
        const firstSingle = token<string>('metadata.raw.private-single-first')
        const firstMulti = token<string>('metadata.raw.private-multi-first')
        const secondSingle = token<string>('metadata.raw.private-single-second')
        const secondMulti = token<string>('metadata.raw.private-multi-second')
        const publicService = token<string>('metadata.public-service')
        let executions = 0

        const module = defineModule({
            id: 'metadata-private-module',
            provides: [{ token: publicService, kind: 'custom' }],
            setup(context) {
                context.bind(firstSingle).toValue('first-single')
                context.add(firstMulti).toValue('first-multi-0')
                context.add(firstMulti).toValue('first-multi-1')
                context.bind(secondSingle).toFactory(
                    () => {
                        executions += 1

                        return 'second-single'
                    },
                    {
                        dependencies: [
                            { token: firstSingle, access: 'instance' },
                            { token: firstMulti, access: 'instance', cardinality: 'multi' }
                        ]
                    }
                )
                context.add(secondMulti).toValue('second-multi-0')
                context.bind(publicService).toFactory(
                    () => {
                        executions += 1

                        return 'public'
                    },
                    {
                        dependencies: [
                            { token: secondSingle, access: 'instance' },
                            { token: secondMulti, access: 'instance', cardinality: 'multi' }
                        ]
                    }
                )
            }
        })
        const runtime = await createComposer().use(module).compose()
        const snapshot = getProviderGraphSnapshot(runtime)
        const serialized = JSON.stringify(snapshot)
        const privateKeys = snapshot.nodes
            .map((node) => node.key)
            .filter((key) => key.visibility === 'private')

        expect(executions).toBe(0)
        expect(privateKeys).toEqual([
            privateKey('metadata-private-module', 0),
            privateKey('metadata-private-module', 1),
            privateKey('metadata-private-module', 2),
            privateKey('metadata-private-module', 3),
            privateKey('metadata-private-module', 4)
        ])
        expect(new Set(privateKeys.map((key) => key.registrationIndex)).size).toBe(5)
        expect(snapshot.dependencyEdges).toHaveLength(5)
        expect(serialized).not.toContain('metadata.raw.private-single-first')
        expect(serialized).not.toContain('metadata.raw.private-multi-first')
        expect(serialized).not.toContain('metadata.raw.private-single-second')
        expect(serialized).not.toContain('metadata.raw.private-multi-second')
        expect(
            snapshot.selectors.filter((selector) => selector.target.visibility === 'private')
        ).toHaveLength(4)
    })

    test('keeps one-argument registrations and typed options source-compatible', async () => {
        const dependency = token<string>('metadata.types.dependency')
        const provider = token<string>('metadata.types.provider')
        const contributions = token<string>('metadata.types.contributions')
        const container = createContainer()
        const options = {
            dependencies: [{ token: dependency, access: 'instance' as const }]
        } satisfies ProviderDependencyOptions

        container.bind(dependency).toValue('dependency')
        const binding = container.bind(provider).toFactory(() => 'provider', options)
        container.add(contributions).toFactory(() => 'provider')

        expectTypeOf(options).toMatchTypeOf<ProviderDependencyOptions>()
        expectTypeOf(binding.singleton).toBeFunction()
        const runtime = await container.freeze()

        expect(runtime.get(provider)).toBe('provider')
        expect(runtime.getAll(contributions)).toEqual(['provider'])
    })
})

function publicKey(tokenId: string, registrationIndex: number) {
    return {
        visibility: 'public' as const,
        tokenId,
        registrationIndex
    }
}

function privateKey(moduleId: string, registrationIndex: number) {
    return {
        visibility: 'private' as const,
        moduleId,
        registrationIndex
    }
}

function publicNode(
    tokenId: string,
    registrationIndex: number,
    registrationKind: 'single' | 'multi',
    providerKind: 'value' | 'factory',
    lifetime: 'singleton' | 'transient'
) {
    return {
        key: publicKey(tokenId, registrationIndex),
        registrationKind,
        providerKind,
        lifetime,
        initialization: 'lazy' as const
    }
}
