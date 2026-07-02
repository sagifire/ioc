import { createContainer, namespace } from '@sagifire/ioc'

interface Logger {
    readonly entries: readonly string[]
    info(message: string): void
}

interface Clock {
    now(): Date
}

interface Greeter {
    greet(name: string): string
}

interface Plugin {
    readonly name: string
    decorate(message: string): string
}

interface RequestSummary {
    render(): string
}

const tokens = namespace('examples.basic-node')

const LOGGER = tokens.token<Logger>('logger')
const CLOCK = tokens.token<Clock>('clock')
const GREETER = tokens.token<Greeter>('greeter')
const PLUGINS = tokens.token<Plugin>('plugins')
const REQUEST_ID = tokens.token<string>('request-id')
const REQUEST_SUMMARY = tokens.token<RequestSummary>('request-summary')

async function main(): Promise<void> {
    const runtime = await createRuntime()

    try {
        const greeter = runtime.get(GREETER)
        const greeting = greeter.greet('Ada')
        const plugins = runtime.getAll(PLUGINS)
        const scopedSummary = await runtime.withScope(
            {
                values: [[REQUEST_ID, 'request-42']]
            },
            (scope) => {
                return scope.get(REQUEST_SUMMARY).render()
            }
        )

        assertEqual(
            greeting,
            'Hello, Ada at 2026-07-02T10:15:00.000Z [trimmed] [audited]',
            'greeting'
        )
        assertEqual(plugins.length, 2, 'plugin count')
        assertEqual(scopedSummary, 'request-42 handled by 2 plugins', 'scoped summary')
        assertEqual(runtime.get(LOGGER).entries.length, 1, 'logger entry count')
    } finally {
        await runtime.dispose()
    }
}

async function createRuntime() {
    const container = createContainer()
    const logger = createMemoryLogger()

    container.bind(LOGGER).toValue(logger)
    container.bind(CLOCK).toValue({
        now(): Date {
            return new Date('2026-07-02T10:15:00.000Z')
        }
    })
    container.add(PLUGINS).toValue({
        name: 'trim',
        decorate(message): string {
            return message.trim()
        }
    })
    container.add(PLUGINS).toFactory(() => {
        return {
            name: 'audit',
            decorate(message): string {
                return `${message} [audited]`
            }
        }
    })
    container.bind(GREETER).toFactory(({ get, getAll }) => {
        const clock = get(CLOCK)
        const currentLogger = get(LOGGER)
        const plugins = getAll(PLUGINS)

        return {
            greet(name): string {
                const base = ` Hello, ${name} at ${clock.now().toISOString()} [trimmed] `
                const message = plugins.reduce((current, plugin) => {
                    return plugin.decorate(current)
                }, base)

                currentLogger.info(message)

                return message
            }
        }
    })
    container.bind(REQUEST_SUMMARY).toFactory(({ get, getAll }) => {
        return {
            render(): string {
                return `${get(REQUEST_ID)} handled by ${getAll(PLUGINS).length} plugins`
            }
        }
    })

    return container.freeze()
}

function createMemoryLogger(): Logger {
    const entries: string[] = []

    return {
        entries,
        info(message): void {
            entries.push(message)
        }
    }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
    if (actual !== expected) {
        throw new Error(`${label}: expected ${String(expected)}, received ${String(actual)}`)
    }
}

await main()
