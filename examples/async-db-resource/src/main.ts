import {
    AsyncProviderAccessError,
    RuntimeDisposedError,
    createContainer,
    namespace,
    type ContainerRuntime
} from '@sagifire/ioc'

interface DatabaseConfig {
    readonly url: string
}

interface UserRow {
    readonly id: string
    readonly name: string
    readonly createdByRequestId: string
}

interface Database {
    readonly events: readonly string[]
    beginUnitOfWork(requestId: string): UnitOfWork
    close(): Promise<void>
}

interface UnitOfWork {
    readonly requestId: string
    createUser(id: string, name: string): Promise<void>
    findUserName(id: string): Promise<string | undefined>
    commit(): Promise<void>
    dispose(): Promise<void>
}

const tokens = namespace('examples.async-db-resource')

const DATABASE_CONFIG = tokens.token<DatabaseConfig>('database-config')
const DATABASE = tokens.token<Database>('database')
const REQUEST_ID = tokens.token<string>('request-id')
const UNIT_OF_WORK = tokens.token<UnitOfWork>('unit-of-work')

async function main(): Promise<void> {
    const { runtime, events, getConnectionAttempts } = await createRuntime()

    try {
        assertEqual(getConnectionAttempts(), 0, 'lazy connection attempts before getAsync')
        assertThrowsInstance(
            () => runtime.get(DATABASE),
            AsyncProviderAccessError,
            'sync access to lazy database resource'
        )

        await assertRejects(
            () => runtime.getAsync(DATABASE),
            'temporary database startup failure',
            'first database connection attempt'
        )

        const database = await runtime.getAsync(DATABASE)
        const sameDatabase = await runtime.getAsync(DATABASE)

        assert(database === sameDatabase, 'singleton database resource should be cached')
        assertEqual(getConnectionAttempts(), 2, 'connection attempts after retry')

        await runtime.withScope(
            {
                values: [[REQUEST_ID, 'request-1']]
            },
            async (scope) => {
                const unitOfWork = await scope.getAsync(UNIT_OF_WORK)

                await unitOfWork.createUser('user-1', 'Ada')
                assertEqual(
                    await unitOfWork.findUserName('user-1'),
                    'Ada',
                    'user visible inside unit of work'
                )
                await unitOfWork.commit()
            }
        )

        assertEqual(
            events.join('|'),
            [
                'connect:memory://example',
                'begin:request-1',
                'insert:user-1:request-1',
                'commit:request-1',
                'release:request-1'
            ].join('|'),
            'events before runtime disposal'
        )
    } finally {
        await runtime.dispose()
    }

    assertEqual(
        events.join('|'),
        [
            'connect:memory://example',
            'begin:request-1',
            'insert:user-1:request-1',
            'commit:request-1',
            'release:request-1',
            'close:memory://example'
        ].join('|'),
        'events after runtime disposal'
    )
    await assertRejectsInstance(
        () => runtime.getAsync(DATABASE),
        RuntimeDisposedError,
        'database access after runtime disposal'
    )
}

async function createRuntime(): Promise<{
    readonly runtime: ContainerRuntime
    readonly events: readonly string[]
    readonly getConnectionAttempts: () => number
}> {
    const container = createContainer()
    const events: string[] = []
    let connectionAttempts = 0

    container.bind(DATABASE_CONFIG).toValue({
        url: 'memory://example'
    })
    container
        .bind(DATABASE)
        .toAsyncResource(async ({ get }) => {
            connectionAttempts += 1

            if (connectionAttempts === 1) {
                throw new Error('temporary database startup failure')
            }

            const config = get(DATABASE_CONFIG)
            const database = createInMemoryDatabase(config, events)

            return {
                value: database,
                dispose(): Promise<void> {
                    return database.close()
                }
            }
        })
        .singleton()
    container
        .bind(UNIT_OF_WORK)
        .toAsyncResource(async ({ getAsync }) => {
            const database = await getAsync(DATABASE)
            const requestId = await getAsync(REQUEST_ID)
            const unitOfWork = database.beginUnitOfWork(requestId)

            return {
                value: unitOfWork,
                dispose(): Promise<void> {
                    return unitOfWork.dispose()
                }
            }
        })
        .scoped()

    return {
        runtime: await container.freeze(),
        events,
        getConnectionAttempts(): number {
            return connectionAttempts
        }
    }
}

function createInMemoryDatabase(config: DatabaseConfig, events: string[]): Database {
    const users = new Map<string, UserRow>()
    let closed = false

    events.push(`connect:${config.url}`)

    return {
        events,

        beginUnitOfWork(requestId): UnitOfWork {
            assertOpen()
            events.push(`begin:${requestId}`)

            let committed = false

            return {
                requestId,

                async createUser(id, name): Promise<void> {
                    assertOpen()
                    users.set(id, {
                        id,
                        name,
                        createdByRequestId: requestId
                    })
                    events.push(`insert:${id}:${requestId}`)
                },

                async findUserName(id): Promise<string | undefined> {
                    assertOpen()

                    return users.get(id)?.name
                },

                async commit(): Promise<void> {
                    assertOpen()

                    if (!committed) {
                        committed = true
                        events.push(`commit:${requestId}`)
                    }
                },

                async dispose(): Promise<void> {
                    if (committed) {
                        events.push(`release:${requestId}`)

                        return
                    }

                    events.push(`rollback:${requestId}`)
                }
            }
        },

        async close(): Promise<void> {
            if (!closed) {
                closed = true
                events.push(`close:${config.url}`)
            }
        }
    }

    function assertOpen(): void {
        if (closed) {
            throw new Error('database is closed')
        }
    }
}

function assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message)
    }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
    if (actual !== expected) {
        throw new Error(`${label}: expected ${String(expected)}, received ${String(actual)}`)
    }
}

function assertThrowsInstance(
    callback: () => void,
    errorConstructor: new (...parameters: never[]) => Error,
    label: string
): void {
    try {
        callback()
    } catch (error) {
        if (error instanceof errorConstructor) {
            return
        }

        throw new Error(`${label}: expected ${errorConstructor.name}, received ${String(error)}`)
    }

    throw new Error(`${label}: expected callback to throw`)
}

async function assertRejects(
    callback: () => Promise<unknown>,
    messageIncludes: string,
    label: string
): Promise<void> {
    try {
        await callback()
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)

        if (message.includes(messageIncludes)) {
            return
        }

        throw new Error(`${label}: expected error message to include "${messageIncludes}"`)
    }

    throw new Error(`${label}: expected promise to reject`)
}

async function assertRejectsInstance(
    callback: () => Promise<unknown>,
    errorConstructor: new (...parameters: never[]) => Error,
    label: string
): Promise<void> {
    try {
        await callback()
    } catch (error) {
        if (error instanceof errorConstructor) {
            return
        }

        throw new Error(`${label}: expected ${errorConstructor.name}, received ${String(error)}`)
    }

    throw new Error(`${label}: expected promise to reject`)
}

await main()
