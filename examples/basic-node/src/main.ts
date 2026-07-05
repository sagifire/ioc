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

interface RequestSession {
    readonly requestId: string
    readonly sequence: number
}

const tokens = namespace('examples.basic-node')

const LOGGER = tokens.token<Logger>('logger')
const CLOCK = tokens.token<Clock>('clock')
const GREETER = tokens.token<Greeter>('greeter')
const PLUGINS = tokens.token<Plugin>('plugins')
const REQUEST_ID = tokens.token<string>('request-id')
const REQUEST_SUMMARY = tokens.token<RequestSummary>('request-summary')
const REQUEST_SESSION = tokens.token<RequestSession>('request-session')

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
        const previewSummary = await runtime.withScope(
            {
                values: [[REQUEST_ID, 'request-42']]
            },
            async (parentScope) => {
                const parentSession = parentScope.get(REQUEST_SESSION)

                return parentScope.withChildScope(
                    {
                        values: [[REQUEST_ID, 'preview-42']],
                        multiValues: [
                            [
                                PLUGINS,
                                {
                                    name: 'preview',
                                    decorate(message: string): string {
                                        return `${message} [preview]`
                                    }
                                }
                            ]
                        ]
                    },
                    (childScope) => {
                        const childSession = childScope.get(REQUEST_SESSION)

                        assert(
                            parentSession !== childSession,
                            'expected separate child scoped cache'
                        )
                        assertEqual(
                            parentScope.get(REQUEST_ID),
                            'request-42',
                            'parent request id after child override'
                        )
                        assertEqual(
                            childSession.requestId,
                            'preview-42',
                            'child session request id'
                        )

                        return childScope.get(REQUEST_SUMMARY).render()
                    }
                )
            }
        )

        assertEqual(
            greeting,
            'Hello, Ada at 2026-07-02T10:15:00.000Z [trimmed] [audited]',
            'greeting'
        )
        assertEqual(plugins.length, 2, 'plugin count')
        assertEqual(scopedSummary, 'request-42 handled by 2 plugins in session 1', 'scoped summary')
        assertEqual(
            previewSummary,
            'preview-42 handled by 3 plugins in session 3',
            'preview child summary'
        )
        assertEqual(runtime.get(LOGGER).entries.length, 1, 'logger entry count')
    } finally {
        await runtime.dispose()
    }
}

async function createRuntime() {
    const container = createContainer()
    const logger = createMemoryLogger()
    let sessionSequence = 0

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
                const session = get(REQUEST_SESSION)

                return (
                    `${get(REQUEST_ID)} handled by ${getAll(PLUGINS).length} plugins ` +
                    `in session ${session.sequence}`
                )
            }
        }
    })
    container
        .bind(REQUEST_SESSION)
        .toFactory(({ get }) => {
            sessionSequence += 1

            return {
                requestId: get(REQUEST_ID),
                sequence: sessionSequence
            }
        })
        .scoped()

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

function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message)
    }
}

await main()
