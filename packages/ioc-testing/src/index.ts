import {
    SagifireIocError,
    createComposer,
    createContainer,
    type AsyncProviderFactory,
    type ClassConstructor,
    type Composer,
    type ContainerBuilder,
    type ContainerRuntime,
    type ModuleDefinition,
    type SyncProviderFactory,
    type Token
} from '@sagifire/ioc'

type Awaitable<TValue> = TValue | Promise<TValue>

export type TestRuntimeConfigurator = (container: ContainerBuilder) => Awaitable<void>
export type TestComposerConfigurator = (composer: Composer) => void

export type TestOverrideKind = 'value' | 'factory' | 'class' | 'async-factory'

export interface TestValueOverride<TValue = unknown> {
    readonly kind: 'value'
    readonly token: Token<TValue>
    readonly value: TValue
}

export interface TestFactoryOverride<TValue = unknown> {
    readonly kind: 'factory'
    readonly token: Token<TValue>
    readonly factory: SyncProviderFactory<TValue>
}

export interface TestClassOverride<TValue = unknown> {
    readonly kind: 'class'
    readonly token: Token<TValue>
    readonly classConstructor: ClassConstructor<TValue>
}

export interface TestAsyncFactoryOverride<TValue = unknown> {
    readonly kind: 'async-factory'
    readonly token: Token<TValue>
    readonly factory: AsyncProviderFactory<TValue>
}

export type TestOverride<TValue = unknown> =
    | TestValueOverride<TValue>
    | TestFactoryOverride<TValue>
    | TestClassOverride<TValue>
    | TestAsyncFactoryOverride<TValue>

export interface TestOverrideBuilder<TValue> {
    toValue(value: TValue): TestValueOverride<TValue>
    toFactory(factory: SyncProviderFactory<TValue>): TestFactoryOverride<TValue>
    toClass(classConstructor: ClassConstructor<TValue>): TestClassOverride<TValue>
    toAsyncFactory(factory: AsyncProviderFactory<TValue>): TestAsyncFactoryOverride<TValue>
}

export interface DuplicateTestOverrideErrorDetails {
    readonly tokenId: string
}

export class DuplicateTestOverrideError extends SagifireIocError<DuplicateTestOverrideErrorDetails> {
    override readonly name = 'DuplicateTestOverrideError'
    override readonly code = 'SAGIFIRE_IOC_TESTING_DUPLICATE_OVERRIDE'
    readonly tokenId: string

    constructor(tokenId: string) {
        super({
            code: 'SAGIFIRE_IOC_TESTING_DUPLICATE_OVERRIDE',
            message: `Duplicate test override for token "${tokenId}"`,
            details: {
                tokenId
            }
        })

        Object.setPrototypeOf(this, new.target.prototype)

        this.tokenId = tokenId
    }
}

export interface CreateTestRuntimeOptions {
    readonly configure?: TestRuntimeConfigurator
    readonly overrides?: readonly TestOverride[]
}

export interface CreateTestComposerOptions {
    readonly modules?: readonly ModuleDefinition[]
    readonly configure?: TestComposerConfigurator
    readonly overrides?: readonly TestOverride[]
}

export function createTestRuntime(
    configure?: TestRuntimeConfigurator
): Promise<ContainerRuntime>
export function createTestRuntime(options?: CreateTestRuntimeOptions): Promise<ContainerRuntime>
export async function createTestRuntime(
    input?: TestRuntimeConfigurator | CreateTestRuntimeOptions
): Promise<ContainerRuntime> {
    const configure = getTestRuntimeConfigurator(input)
    const overrides = getTestRuntimeOverrides(input)

    assertNoDuplicateTestOverrides(overrides)

    const container = createContainer()

    if (configure !== undefined) {
        await configure(container)
    }

    applyTestOverridesToContainer(container, overrides)

    return container.freeze()
}

export function createTestComposer(configure?: TestComposerConfigurator): Composer
export function createTestComposer(options?: CreateTestComposerOptions): Composer
export function createTestComposer(
    input?: TestComposerConfigurator | CreateTestComposerOptions
): Composer {
    const modules = getTestComposerModules(input)
    const configure = getTestComposerConfigurator(input)
    const overrides = getTestComposerOverrides(input)

    assertNoDuplicateTestOverrides(overrides)

    const composer = createComposer()

    for (const moduleDefinition of modules) {
        composer.use(moduleDefinition)
    }

    if (configure !== undefined) {
        configure(composer)
    }

    applyTestOverridesToComposer(composer, overrides)

    return composer
}

function createTestOverride<TValue>(overrideToken: Token<TValue>): TestOverrideBuilder<TValue> {
    return Object.freeze({
        toValue(value: TValue): TestValueOverride<TValue> {
            return Object.freeze({
                kind: 'value',
                token: overrideToken,
                value
            })
        },

        toFactory(factory: SyncProviderFactory<TValue>): TestFactoryOverride<TValue> {
            return Object.freeze({
                kind: 'factory',
                token: overrideToken,
                factory
            })
        },

        toClass(classConstructor: ClassConstructor<TValue>): TestClassOverride<TValue> {
            return Object.freeze({
                kind: 'class',
                token: overrideToken,
                classConstructor
            })
        },

        toAsyncFactory(factory: AsyncProviderFactory<TValue>): TestAsyncFactoryOverride<TValue> {
            return Object.freeze({
                kind: 'async-factory',
                token: overrideToken,
                factory
            })
        }
    })
}

function getTestRuntimeConfigurator(
    input: TestRuntimeConfigurator | CreateTestRuntimeOptions | undefined
): TestRuntimeConfigurator | undefined {
    if (typeof input === 'function') {
        return input
    }

    return input?.configure
}

function getTestRuntimeOverrides(
    input: TestRuntimeConfigurator | CreateTestRuntimeOptions | undefined
): readonly TestOverride[] {
    if (typeof input === 'function') {
        return []
    }

    return input?.overrides ?? []
}

function getTestComposerModules(
    input: TestComposerConfigurator | CreateTestComposerOptions | undefined
): readonly ModuleDefinition[] {
    if (typeof input === 'function') {
        return []
    }

    return input?.modules ?? []
}

function getTestComposerConfigurator(
    input: TestComposerConfigurator | CreateTestComposerOptions | undefined
): TestComposerConfigurator | undefined {
    if (typeof input === 'function') {
        return input
    }

    return input?.configure
}

function getTestComposerOverrides(
    input: TestComposerConfigurator | CreateTestComposerOptions | undefined
): readonly TestOverride[] {
    if (typeof input === 'function') {
        return []
    }

    return input?.overrides ?? []
}

function assertNoDuplicateTestOverrides(overrides: readonly TestOverride[]): void {
    const tokenIds = new Set<string>()

    for (const testOverride of overrides) {
        const tokenId = testOverride.token.id

        if (tokenIds.has(tokenId)) {
            throw new DuplicateTestOverrideError(tokenId)
        }

        tokenIds.add(tokenId)
    }
}

function applyTestOverridesToContainer(
    container: ContainerBuilder,
    overrides: readonly TestOverride[]
): void {
    for (const testOverride of overrides) {
        const builder = container.bind(testOverride.token)

        if (testOverride.kind === 'value') {
            builder.toValue(testOverride.value)
        } else if (testOverride.kind === 'factory') {
            builder.toFactory(testOverride.factory)
        } else if (testOverride.kind === 'class') {
            builder.toClass(testOverride.classConstructor)
        } else {
            builder.toAsyncFactory(testOverride.factory)
        }
    }
}

function applyTestOverridesToComposer(composer: Composer, overrides: readonly TestOverride[]): void {
    for (const testOverride of overrides) {
        const builder = composer.bind(testOverride.token)

        if (testOverride.kind === 'value') {
            builder.toValue(testOverride.value)
        } else if (testOverride.kind === 'factory') {
            builder.toFactory(testOverride.factory)
        } else if (testOverride.kind === 'class') {
            builder.toClass(testOverride.classConstructor)
        } else {
            builder.toAsyncFactory(testOverride.factory)
        }
    }
}

export { createTestOverride as override }
