import { createContainer, type ContainerBuilder, type ContainerRuntime } from '@sagifire/ioc'

type Awaitable<TValue> = TValue | Promise<TValue>

export type TestRuntimeConfigurator = (container: ContainerBuilder) => Awaitable<void>

export interface CreateTestRuntimeOptions {
    readonly configure?: TestRuntimeConfigurator
}

export function createTestRuntime(
    configure?: TestRuntimeConfigurator
): Promise<ContainerRuntime>
export function createTestRuntime(options?: CreateTestRuntimeOptions): Promise<ContainerRuntime>
export async function createTestRuntime(
    input?: TestRuntimeConfigurator | CreateTestRuntimeOptions
): Promise<ContainerRuntime> {
    const container = createContainer()
    const configure = getTestRuntimeConfigurator(input)

    if (configure !== undefined) {
        await configure(container)
    }

    return container.freeze()
}

function getTestRuntimeConfigurator(
    input: TestRuntimeConfigurator | CreateTestRuntimeOptions | undefined
): TestRuntimeConfigurator | undefined {
    if (typeof input === 'function') {
        return input
    }

    return input?.configure
}
