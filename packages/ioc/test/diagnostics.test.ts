import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    AsyncProviderAccessError,
    ContainerFrozenError,
    DuplicateProviderError,
    DuplicateScopeLocalValueError,
    InvalidProviderLifecycleError,
    InvalidScopeError,
    ProviderCycleError,
    ProviderKindMismatchError,
    ProviderNotFoundError,
    RuntimeDisposedError,
    ScopeDisposedError,
    createContainer
} from '../src/container.js'
import {
    diagnosticFromError,
    formatDiagnostics,
    SagifireIocError,
    isSagifireIocError,
    type Diagnostic,
    type DiagnosticReport,
    type DiagnosticSeverity,
    type SagifireIocErrorOptions
} from '../src/diagnostics.js'
import { InvalidTokenIdError, token } from '../src/tokens.js'

interface Logger {
    readonly name: string
}

const LOGGER = token<Logger>('diagnostics.logger')
const MISSING = token<Logger>('diagnostics.missing')

describe('diagnostics error foundation', () => {
    test('creates base errors with code, details, cause and Error instanceof behavior', () => {
        const cause = new Error('root cause')
        const error = new SagifireIocError({
            code: 'SAGIFIRE_IOC_TEST_FAILURE',
            message: 'Test failure',
            details: {
                tokenId: 'diagnostics.logger'
            },
            cause
        })

        expect(error).toBeInstanceOf(Error)
        expect(error).toBeInstanceOf(SagifireIocError)
        expect(error.name).toBe('SagifireIocError')
        expect(error.code).toBe('SAGIFIRE_IOC_TEST_FAILURE')
        expect(error.message).toBe('Test failure')
        expect(error.details).toEqual({
            tokenId: 'diagnostics.logger'
        })
        expect(error.cause).toBe(cause)
        expect(isSagifireIocError(error)).toBe(true)
        expect(isSagifireIocError(new Error('plain'))).toBe(false)
        expect(
            isSagifireIocError({
                code: 'SAGIFIRE_IOC_TEST_FAILURE'
            })
        ).toBe(false)
    })

    test('preserves public diagnostics foundation types', () => {
        const options: SagifireIocErrorOptions<{
            readonly tokenId: string
        }> = {
            code: 'SAGIFIRE_IOC_TYPE_TEST',
            message: 'Type test',
            details: {
                tokenId: 'diagnostics.logger'
            }
        }
        const error = new SagifireIocError(options)
        const unknownError: unknown = error

        expectTypeOf(options.code).toEqualTypeOf<string>()
        expectTypeOf(options.message).toEqualTypeOf<string>()
        expectTypeOf(options.details).toEqualTypeOf<
            | {
                  readonly tokenId: string
              }
            | undefined
        >()
        expectTypeOf(error).toEqualTypeOf<
            SagifireIocError<{
                readonly tokenId: string
            }>
        >()
        expectTypeOf(error.details).toEqualTypeOf<
            | {
                  readonly tokenId: string
              }
            | undefined
        >()

        if (isSagifireIocError(unknownError)) {
            expectTypeOf(unknownError).toEqualTypeOf<SagifireIocError>()
            expect(unknownError.code).toBe('SAGIFIRE_IOC_TYPE_TEST')
        }
    })

    test('migrates token, container and context errors to SagifireIocError', () => {
        const invalidToken = new InvalidTokenIdError('token', 'bad token', 'bad reason')
        const providerNotFound = new ProviderNotFoundError('diagnostics.missing')
        const duplicateProvider = new DuplicateProviderError('diagnostics.logger')
        const kindMismatch = new ProviderKindMismatchError(
            'diagnostics.plugins',
            'single',
            'multi',
            'resolve single provider'
        )
        const providerCycle = new ProviderCycleError([
            'diagnostics.first',
            'diagnostics.second',
            'diagnostics.first'
        ])
        const frozen = new ContainerFrozenError('bind provider for token "diagnostics.logger"')
        const asyncAccess = new AsyncProviderAccessError('diagnostics.lazy', 'get')
        const runtimeDisposed = new RuntimeDisposedError('resolve provider for token "x"')
        const invalidLifecycle = new InvalidProviderLifecycleError(
            'diagnostics.resource',
            'async resources require explicit singleton() or scoped() ownership'
        )
        const invalidScope = new InvalidScopeError(
            'Cannot resolve scoped provider for token "diagnostics.scoped" without an active scope',
            {
                reason: 'scoped-provider-without-scope',
                tokenId: 'diagnostics.scoped'
            }
        )
        const scopeDisposed = new ScopeDisposedError()
        const duplicateLocal = new DuplicateScopeLocalValueError('diagnostics.request-id')

        expect(invalidToken).toBeInstanceOf(SagifireIocError)
        expect(invalidToken).toBeInstanceOf(InvalidTokenIdError)
        expect(invalidToken.code).toBe('SAGIFIRE_IOC_INVALID_TOKEN_ID')
        expect(invalidToken.details).toEqual({
            kind: 'token',
            value: 'bad token',
            reason: 'bad reason'
        })

        expect(providerNotFound).toBeInstanceOf(SagifireIocError)
        expect(providerNotFound).toBeInstanceOf(ProviderNotFoundError)
        expect(providerNotFound.code).toBe('SAGIFIRE_IOC_PROVIDER_NOT_FOUND')
        expect(providerNotFound.details).toEqual({
            tokenId: 'diagnostics.missing'
        })

        expect(duplicateProvider).toBeInstanceOf(SagifireIocError)
        expect(duplicateProvider).toBeInstanceOf(DuplicateProviderError)
        expect(duplicateProvider.code).toBe('SAGIFIRE_IOC_DUPLICATE_PROVIDER')
        expect(duplicateProvider.details).toEqual({
            tokenId: 'diagnostics.logger'
        })

        expect(kindMismatch).toBeInstanceOf(SagifireIocError)
        expect(kindMismatch).toBeInstanceOf(ProviderKindMismatchError)
        expect(kindMismatch.code).toBe('SAGIFIRE_IOC_PROVIDER_KIND_MISMATCH')
        expect(kindMismatch.details).toEqual({
            tokenId: 'diagnostics.plugins',
            expectedKind: 'single',
            actualKind: 'multi',
            action: 'resolve single provider'
        })

        expect(providerCycle).toBeInstanceOf(SagifireIocError)
        expect(providerCycle).toBeInstanceOf(ProviderCycleError)
        expect(providerCycle.code).toBe('SAGIFIRE_IOC_PROVIDER_CYCLE')
        expect(providerCycle.details).toEqual({
            tokenIds: ['diagnostics.first', 'diagnostics.second', 'diagnostics.first']
        })

        expect(frozen).toBeInstanceOf(SagifireIocError)
        expect(frozen).toBeInstanceOf(ContainerFrozenError)
        expect(frozen.code).toBe('SAGIFIRE_IOC_CONTAINER_FROZEN')
        expect(frozen.details).toEqual({
            action: 'bind provider for token "diagnostics.logger"'
        })

        expect(asyncAccess).toBeInstanceOf(SagifireIocError)
        expect(asyncAccess).toBeInstanceOf(AsyncProviderAccessError)
        expect(asyncAccess.code).toBe('SAGIFIRE_IOC_ASYNC_PROVIDER_ACCESS')
        expect(asyncAccess.details).toEqual({
            tokenId: 'diagnostics.lazy',
            accessMethod: 'get'
        })

        expect(runtimeDisposed).toBeInstanceOf(SagifireIocError)
        expect(runtimeDisposed).toBeInstanceOf(RuntimeDisposedError)
        expect(runtimeDisposed.code).toBe('SAGIFIRE_IOC_RUNTIME_DISPOSED')
        expect(runtimeDisposed.details).toEqual({
            action: 'resolve provider for token "x"'
        })

        expect(invalidLifecycle).toBeInstanceOf(SagifireIocError)
        expect(invalidLifecycle).toBeInstanceOf(InvalidProviderLifecycleError)
        expect(invalidLifecycle.code).toBe('SAGIFIRE_IOC_INVALID_PROVIDER_LIFECYCLE')
        expect(invalidLifecycle.details).toEqual({
            tokenId: 'diagnostics.resource',
            reason: 'async resources require explicit singleton() or scoped() ownership'
        })

        expect(invalidScope).toBeInstanceOf(SagifireIocError)
        expect(invalidScope).toBeInstanceOf(InvalidScopeError)
        expect(invalidScope.code).toBe('SAGIFIRE_IOC_INVALID_SCOPE')
        expect(invalidScope.details).toEqual({
            reason: 'scoped-provider-without-scope',
            tokenId: 'diagnostics.scoped'
        })

        expect(scopeDisposed).toBeInstanceOf(SagifireIocError)
        expect(scopeDisposed).toBeInstanceOf(ScopeDisposedError)
        expect(scopeDisposed.code).toBe('SAGIFIRE_IOC_SCOPE_DISPOSED')
        expect(scopeDisposed.details).toEqual({
            reason: 'scope-disposed'
        })

        expect(duplicateLocal).toBeInstanceOf(SagifireIocError)
        expect(duplicateLocal).toBeInstanceOf(DuplicateScopeLocalValueError)
        expect(duplicateLocal.code).toBe('SAGIFIRE_IOC_DUPLICATE_SCOPE_LOCAL_VALUE')
        expect(duplicateLocal.details).toEqual({
            tokenId: 'diagnostics.request-id'
        })
    })

    test('throws migrated errors from existing runtime failure paths', async () => {
        expect(() => token<Logger>('invalid token id')).toThrow(SagifireIocError)

        const missingContainer = createContainer()
        const missingRuntime = await missingContainer.freeze()

        expect(() => missingRuntime.get(MISSING)).toThrow(SagifireIocError)
        expect(() => missingRuntime.get(MISSING)).toThrow(ProviderNotFoundError)

        const lazyContainer = createContainer()

        lazyContainer.bind(LOGGER).toAsyncFactory(async () => ({
            name: 'lazy'
        }))

        const lazyRuntime = await lazyContainer.freeze()

        expect(() => lazyRuntime.get(LOGGER)).toThrow(SagifireIocError)
        expect(() => lazyRuntime.get(LOGGER)).toThrow(AsyncProviderAccessError)

        const scopedContainer = createContainer()

        scopedContainer.bind(LOGGER).toValue({
            name: 'scoped'
        })

        const scopedRuntime = await scopedContainer.freeze()
        const scope = scopedRuntime.createScope()

        await scope.dispose()

        expect(() => scope.get(LOGGER)).toThrow(SagifireIocError)
        expect(() => scope.get(LOGGER)).toThrow(ScopeDisposedError)

        const disposedContainer = createContainer()

        disposedContainer.bind(LOGGER).toValue({
            name: 'disposed'
        })

        const disposedRuntime = await disposedContainer.freeze()

        await disposedRuntime.dispose()

        expect(() => disposedRuntime.get(LOGGER)).toThrow(SagifireIocError)
        expect(() => disposedRuntime.get(LOGGER)).toThrow(RuntimeDisposedError)
    })

    test('preserves diagnostic report and formatter public types', () => {
        const severity: DiagnosticSeverity = 'error'
        const diagnostic: Diagnostic = {
            code: 'SAGIFIRE_IOC_TYPE_TEST',
            severity,
            message: 'Type test',
            details: {
                tokenId: 'diagnostics.logger'
            }
        }
        const report: DiagnosticReport = {
            ok: false,
            diagnostics: [diagnostic]
        }
        const formatted = formatDiagnostics(report)
        const converted = diagnosticFromError(new Error('plain failure'))

        expectTypeOf<'error' | 'warning' | 'info'>().toEqualTypeOf<DiagnosticSeverity>()
        expectTypeOf(diagnostic).toEqualTypeOf<Diagnostic>()
        expectTypeOf(report).toEqualTypeOf<DiagnosticReport>()
        expectTypeOf(formatted).toEqualTypeOf<string>()
        expectTypeOf(converted).toEqualTypeOf<Diagnostic>()
    })

    test('formats empty ok reports clearly', () => {
        expect(
            formatDiagnostics({
                ok: true,
                diagnostics: []
            })
        ).toBe(['Diagnostic report: ok', 'No diagnostics.'].join('\n'))
    })

    test('formats a single diagnostic report with details', () => {
        const diagnostic = diagnosticFromError(new ProviderNotFoundError('diagnostics.missing'))

        expect(
            formatDiagnostics({
                ok: false,
                diagnostics: [diagnostic]
            })
        ).toBe(
            [
                'Diagnostic report: failed',
                'Diagnostics: 1',
                '1. [error] SAGIFIRE_IOC_PROVIDER_NOT_FOUND',
                '   Message: Provider not found for token "diagnostics.missing"',
                '   Details:',
                '     tokenId: diagnostics.missing'
            ].join('\n')
        )
    })

    test('formats multiple diagnostics in input order', () => {
        expect(
            formatDiagnostics({
                ok: false,
                diagnostics: [
                    {
                        code: 'SAGIFIRE_IOC_FIRST',
                        severity: 'warning',
                        message: 'First diagnostic'
                    },
                    {
                        code: 'SAGIFIRE_IOC_SECOND',
                        severity: 'info',
                        message: 'Second diagnostic',
                        details: {
                            action: 'inspect graph'
                        }
                    }
                ]
            })
        ).toBe(
            [
                'Diagnostic report: failed',
                'Diagnostics: 2',
                '1. [warning] SAGIFIRE_IOC_FIRST',
                '   Message: First diagnostic',
                '2. [info] SAGIFIRE_IOC_SECOND',
                '   Message: Second diagnostic',
                '   Details:',
                '     action: inspect graph'
            ].join('\n')
        )
    })

    test('renders representative Stage 3-7 error details readably', () => {
        const invalidToken = diagnosticFromError(
            new InvalidTokenIdError('token', 'bad token', 'bad reason')
        )
        const kindMismatch = diagnosticFromError(
            new ProviderKindMismatchError(
                'diagnostics.plugins',
                'single',
                'multi',
                'resolve single provider'
            )
        )
        const providerCycle = diagnosticFromError(
            new ProviderCycleError([
                'diagnostics.first',
                'diagnostics.second',
                'diagnostics.first'
            ])
        )
        const asyncAccess = diagnosticFromError(
            new AsyncProviderAccessError('diagnostics.lazy', 'tryGet')
        )
        const invalidLifecycle = diagnosticFromError(
            new InvalidProviderLifecycleError(
                'diagnostics.resource',
                'eager async initialization is valid only for singleton providers'
            )
        )
        const invalidScope = diagnosticFromError(
            new InvalidScopeError(
                'Cannot resolve scoped provider for token "diagnostics.scoped" without an active scope',
                {
                    reason: 'scoped-provider-without-scope',
                    tokenId: 'diagnostics.scoped'
                }
            )
        )

        expect(
            formatDiagnostics({
                ok: false,
                diagnostics: [
                    invalidToken,
                    kindMismatch,
                    providerCycle,
                    asyncAccess,
                    invalidLifecycle,
                    invalidScope
                ]
            })
        ).toBe(
            [
                'Diagnostic report: failed',
                'Diagnostics: 6',
                '1. [error] SAGIFIRE_IOC_INVALID_TOKEN_ID',
                '   Message: Invalid token id "bad token": bad reason',
                '   Details:',
                '     kind: token',
                '     value: "bad token"',
                '     reason: bad reason',
                '2. [error] SAGIFIRE_IOC_PROVIDER_KIND_MISMATCH',
                '   Message: Cannot resolve single provider for token "diagnostics.plugins": expected single provider registration but found multi provider registration',
                '   Details:',
                '     tokenId: diagnostics.plugins',
                '     expectedKind: single',
                '     actualKind: multi',
                '     action: resolve single provider',
                '3. [error] SAGIFIRE_IOC_PROVIDER_CYCLE',
                '   Message: Provider cycle detected: diagnostics.first -> diagnostics.second -> diagnostics.first',
                '   Details:',
                '     tokenIds: diagnostics.first -> diagnostics.second -> diagnostics.first',
                '4. [error] SAGIFIRE_IOC_ASYNC_PROVIDER_ACCESS',
                '   Message: Cannot resolve async lazy provider for token "diagnostics.lazy" through tryGet(); use getAsync() instead',
                '   Details:',
                '     tokenId: diagnostics.lazy',
                '     accessMethod: tryGet',
                '5. [error] SAGIFIRE_IOC_INVALID_PROVIDER_LIFECYCLE',
                '   Message: Invalid provider lifecycle for token "diagnostics.resource": eager async initialization is valid only for singleton providers',
                '   Details:',
                '     tokenId: diagnostics.resource',
                '     reason: eager async initialization is valid only for singleton providers',
                '6. [error] SAGIFIRE_IOC_INVALID_SCOPE',
                '   Message: Cannot resolve scoped provider for token "diagnostics.scoped" without an active scope',
                '   Details:',
                '     reason: scoped-provider-without-scope',
                '     tokenId: diagnostics.scoped'
            ].join('\n')
        )
    })

    test('converts unknown errors generically without IoC classification', () => {
        const plainError = diagnosticFromError(new Error('plain failure'))
        const thrownValue = diagnosticFromError('plain thrown value')

        expect(plainError).toEqual({
            code: 'UNKNOWN_ERROR',
            severity: 'error',
            message: 'plain failure',
            details: {
                name: 'Error'
            }
        })
        expect(thrownValue).toEqual({
            code: 'UNKNOWN_ERROR',
            severity: 'error',
            message: 'Unknown thrown value',
            details: {
                valueType: 'string'
            }
        })
        expect(plainError.code.startsWith('SAGIFIRE_IOC_')).toBe(false)
        expect(thrownValue.code.startsWith('SAGIFIRE_IOC_')).toBe(false)
        expect(formatDiagnostics({ ok: false, diagnostics: [thrownValue] })).not.toContain(
            'plain thrown value'
        )
    })

    test('keeps nested detail rendering shallow and bounded', () => {
        expect(
            formatDiagnostics({
                ok: false,
                diagnostics: [
                    {
                        code: 'SAGIFIRE_IOC_SAFE_DETAILS',
                        severity: 'error',
                        message: 'Nested details',
                        details: {
                            tokenId: 'diagnostics.safe',
                            providerValue: {
                                secret: 'hidden'
                            },
                            values: ['first', 'second'],
                            empty: ''
                        }
                    }
                ]
            })
        ).toBe(
            [
                'Diagnostic report: failed',
                'Diagnostics: 1',
                '1. [error] SAGIFIRE_IOC_SAFE_DETAILS',
                '   Message: Nested details',
                '   Details:',
                '     tokenId: diagnostics.safe',
                '     providerValue: [object]',
                '     values: ["first", "second"]',
                '     empty: <empty string>'
            ].join('\n')
        )
    })
})
