import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    ScopeDisposedError,
    createContainer,
    token,
    type ContainerRuntime,
    type CreateScopeOptions,
    type Scope
} from '@sagifire/ioc'
import {
    createNextRequestContext,
    createNextRuntime,
    nextRequestValue,
    withServerActionScope,
    type NextRequestContext,
    type NextRuntimeHelper,
    type ServerActionScopeCallback,
    type ServerActionScopeOptions,
    type ServerActionScopeOptionsFactory
} from '../src/index.js'

interface ActionContext {
    readonly actionName: string
    readonly userId: string
}

interface SubmitContactInput {
    readonly email: string
    readonly message: string
}

interface ActionResult {
    readonly ok: boolean
    readonly summary: string
}

interface ActionService {
    submit(input: SubmitContactInput, context: ActionContext): ActionResult
}

interface ScopedResourceState {
    readonly actionId: string
}

interface CountingRuntime extends ContainerRuntime {
    getCreatedScopeCount(): number
}

const ACTION_ID = token<string>('next.server-action-scope.action-id')
const ACTION_SERVICE = token<ActionService>('next.server-action-scope.service')
const SCOPED_RESOURCE = token<ScopedResourceState>('next.server-action-scope.resource')
const SCOPED_COUNTER = token<number>('next.server-action-scope.counter')

describe('Next server action scope', () => {
    test('runs an action callback with explicit runtime, scope and action context', async () => {
        const disposalLog: string[] = []
        const runtime = createCountingRuntime(await createActionRuntime(disposalLog))
        const runtimeHelper = createNextRuntime(async () => runtime)
        const context = createActionContext('submit-contact', 'user-1')
        const actionContext = createNextRequestContext({
            values: [nextRequestValue(ACTION_ID, 'action-1')]
        })
        let capturedScope: Scope | undefined

        const submitContact = withServerActionScope(
            runtimeHelper,
            {
                context,
                actionContext
            },
            async (action, input: SubmitContactInput) => {
                capturedScope = action.scope

                expect(Object.keys(action).sort()).toEqual([
                    'actionContext',
                    'context',
                    'runtime',
                    'scope'
                ])
                expect(action.runtime).toBe(runtime)
                expect(action.context).toBe(context)
                expect(action.actionContext).toBe(actionContext)

                const service = action.scope.get(ACTION_SERVICE)
                const resource = await action.scope.getAsync(SCOPED_RESOURCE)
                const result = service.submit(input, action.context)

                return {
                    ok: result.ok,
                    summary: `${result.summary}:${resource.actionId}`
                }
            }
        )

        const result = await submitContact(createSubmitInput('a@example.test', 'hello'))

        expect(result).toEqual({
            ok: true,
            summary: 'action-1:submit-contact:user-1:a@example.test:hello:action-1'
        })
        expect(runtime.getCreatedScopeCount()).toBe(1)
        expect(disposalLog).toEqual(['action-1'])
        const disposedScope = capturedScope

        assertCapturedScope(disposedScope)
        expect(() => disposedScope.get(ACTION_SERVICE)).toThrow(ScopeDisposedError)

        await runtime.dispose()
    })

    test('disposes the action scope when the callback throws', async () => {
        const disposalLog: string[] = []
        const runtime = createCountingRuntime(await createActionRuntime(disposalLog))
        const runtimeHelper = createNextRuntime(async () => runtime)
        const actionContext = createNextRequestContext({
            values: [nextRequestValue(ACTION_ID, 'failed-action')]
        })
        let capturedScope: Scope | undefined

        const failingAction = withServerActionScope(
            runtimeHelper,
            {
                context: createActionContext('failing-action', 'user-fail'),
                actionContext
            },
            async (action, input: SubmitContactInput) => {
                capturedScope = action.scope
                await action.scope.getAsync(SCOPED_RESOURCE)

                throw new Error(`action failed for ${input.email}`)
            }
        )

        await expect(failingAction(createSubmitInput('fail@example.test', 'fail'))).rejects.toThrow(
            'action failed for fail@example.test'
        )

        expect(runtime.getCreatedScopeCount()).toBe(1)
        expect(disposalLog).toEqual(['failed-action'])
        const disposedScope = capturedScope

        assertCapturedScope(disposedScope)
        expect(() => disposedScope.get(ACTION_SERVICE)).toThrow(ScopeDisposedError)

        await runtime.dispose()
    })

    test('uses cached runtime while creating a fresh scope per action invocation', async () => {
        const runtime = createCountingRuntime(await createActionRuntime([]))
        let factoryCalls = 0
        const runtimeHelper = createNextRuntime(async () => {
            factoryCalls += 1

            return runtime
        })
        const optionsFactory: ServerActionScopeOptionsFactory<
            [SubmitContactInput],
            ActionContext
        > = (input) => {
            return {
                context: createActionContext('submit-contact', input.email),
                actionContext: createNextRequestContext({
                    values: [nextRequestValue(ACTION_ID, input.email)]
                })
            }
        }
        const submitContact = withServerActionScope(
            runtimeHelper,
            optionsFactory,
            async (action, input: SubmitContactInput) => {
                await Promise.resolve()

                return [
                    action.context.userId,
                    action.scope.get(ACTION_ID),
                    action.scope.get(SCOPED_COUNTER),
                    input.message
                ].join(':')
            }
        )

        const firstValue = await submitContact(createSubmitInput('first@example.test', 'one'))
        const secondValue = await submitContact(createSubmitInput('second@example.test', 'two'))

        expectTypeOf(optionsFactory).toEqualTypeOf<
            ServerActionScopeOptionsFactory<[SubmitContactInput], ActionContext>
        >()
        expect(firstValue).toBe('first@example.test:first@example.test:1:one')
        expect(secondValue).toBe('second@example.test:second@example.test:2:two')
        expect(factoryCalls).toBe(1)
        expect(runtime.getCreatedScopeCount()).toBe(2)

        await runtime.dispose()
    })

    test('preserves action argument and return type inference', async () => {
        const runtime = await createActionRuntime([])
        const runtimeHelper: NextRuntimeHelper<ContainerRuntime> = createNextRuntime(async () => {
            return runtime
        })
        const actionOptions: ServerActionScopeOptions<ActionContext> = {
            context: createActionContext('typed-action', 'typed-user'),
            actionContext: createNextRequestContext({
                values: [nextRequestValue(ACTION_ID, 'typed-action-id')]
            })
        }
        const actionCallback: ServerActionScopeCallback<
            ContainerRuntime,
            ActionContext,
            [SubmitContactInput, number],
            ActionResult
        > = (action, input, retryCount) => {
            expectTypeOf(action.runtime).toEqualTypeOf<ContainerRuntime>()
            expectTypeOf(action.scope).toEqualTypeOf<Scope>()
            expectTypeOf(action.context).toEqualTypeOf<ActionContext>()
            expectTypeOf(action.actionContext).toEqualTypeOf<NextRequestContext | undefined>()
            expectTypeOf(input).toEqualTypeOf<SubmitContactInput>()
            expectTypeOf(retryCount).toEqualTypeOf<number>()
            expectTypeOf(action.scope.get(ACTION_ID)).toEqualTypeOf<string>()

            return {
                ok: retryCount > 0,
                summary: `${action.scope.get(ACTION_ID)}:${input.email}:${retryCount}`
            }
        }
        const submitContact = withServerActionScope(
            runtimeHelper,
            actionOptions,
            (action, input: SubmitContactInput, retryCount: number) => {
                return actionCallback(action, input, retryCount)
            }
        )
        const resultPromise = submitContact(createSubmitInput('typed@example.test', 'typed'), 2)

        expectTypeOf(actionOptions).toEqualTypeOf<ServerActionScopeOptions<ActionContext>>()
        expectTypeOf(actionCallback).toEqualTypeOf<
            ServerActionScopeCallback<
                ContainerRuntime,
                ActionContext,
                [SubmitContactInput, number],
                ActionResult
            >
        >()
        expectTypeOf(submitContact).toEqualTypeOf<
            (input: SubmitContactInput, retryCount: number) => Promise<ActionResult>
        >()
        expectTypeOf(resultPromise).toEqualTypeOf<Promise<ActionResult>>()
        await expect(resultPromise).resolves.toEqual({
            ok: true,
            summary: 'typed-action-id:typed@example.test:2'
        })

        await runtime.dispose()
    })
})

async function createActionRuntime(disposalLog: string[]): Promise<ContainerRuntime> {
    const container = createContainer()
    let scopedCounter = 0

    container.bind(ACTION_SERVICE).toFactory((context) => {
        const actionId = context.get(ACTION_ID)

        return {
            submit(input, actionContext): ActionResult {
                return {
                    ok: true,
                    summary:
                        `${actionId}:${actionContext.actionName}:${actionContext.userId}:` +
                        `${input.email}:${input.message}`
                }
            }
        }
    })
    container
        .bind(SCOPED_RESOURCE)
        .toAsyncResource((context) => {
            const actionId = context.get(ACTION_ID)

            return {
                value: {
                    actionId
                },
                dispose(): void {
                    disposalLog.push(actionId)
                }
            }
        })
        .scoped()
    container
        .bind(SCOPED_COUNTER)
        .toFactory(() => {
            scopedCounter += 1

            return scopedCounter
        })
        .scoped()

    return container.freeze()
}

function createCountingRuntime(runtime: ContainerRuntime): CountingRuntime {
    let createdScopes = 0

    return Object.freeze({
        get: runtime.get,
        tryGet: runtime.tryGet,
        getAll: runtime.getAll,
        getAllAsync: runtime.getAllAsync,
        createScope(options?: CreateScopeOptions): Scope {
            createdScopes += 1

            return runtime.createScope(options)
        },
        withScope: runtime.withScope,
        getAsync: runtime.getAsync,
        tryGetAsync: runtime.tryGetAsync,
        dispose: runtime.dispose,
        getCreatedScopeCount(): number {
            return createdScopes
        }
    })
}

function createActionContext(actionName: string, userId: string): ActionContext {
    return {
        actionName,
        userId
    }
}

function createSubmitInput(email: string, message: string): SubmitContactInput {
    return {
        email,
        message
    }
}

function assertCapturedScope(scope: Scope | undefined): asserts scope is Scope {
    if (scope === undefined) {
        throw new Error('Expected action callback to capture scope')
    }
}
