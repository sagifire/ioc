export interface SagifireIocErrorOptions<TDetails = unknown> {
    readonly code: string
    readonly message: string
    readonly details?: TDetails
    readonly cause?: unknown
}

export type DiagnosticSeverity = 'error' | 'warning' | 'info'

export interface Diagnostic {
    readonly code: string
    readonly severity: DiagnosticSeverity
    readonly message: string
    readonly details?: unknown
}

export interface DiagnosticReport {
    readonly ok: boolean
    readonly diagnostics: readonly Diagnostic[]
}

export class SagifireIocError<TDetails = unknown> extends Error {
    override readonly name: string = 'SagifireIocError'
    readonly code: string
    readonly details: TDetails | undefined
    override readonly cause: unknown | undefined

    constructor(options: SagifireIocErrorOptions<TDetails>) {
        super(options.message, createNativeErrorOptions(options.cause))

        Object.setPrototypeOf(this, new.target.prototype)

        this.code = options.code
        this.details = options.details
        this.cause = options.cause
    }
}

export function isSagifireIocError(error: unknown): error is SagifireIocError {
    return error instanceof SagifireIocError
}

export function diagnosticFromError(error: unknown): Diagnostic {
    if (isSagifireIocError(error)) {
        return createDiagnostic({
            code: error.code,
            severity: 'error',
            message: error.message,
            details: error.details
        })
    }

    if (error instanceof Error) {
        return createDiagnostic({
            code: 'UNKNOWN_ERROR',
            severity: 'error',
            message: error.message.length === 0 ? error.name : error.message,
            details:
                error.name.length === 0
                    ? undefined
                    : {
                          name: error.name
                      }
        })
    }

    return {
        code: 'UNKNOWN_ERROR',
        severity: 'error',
        message: 'Unknown thrown value',
        details: {
            valueType: getUnknownValueType(error)
        }
    }
}

export function formatDiagnostics(report: DiagnosticReport): string {
    const lines = [`Diagnostic report: ${report.ok ? 'ok' : 'failed'}`]

    if (report.diagnostics.length === 0) {
        lines.push('No diagnostics.')

        return lines.join('\n')
    }

    lines.push(`Diagnostics: ${report.diagnostics.length}`)

    report.diagnostics.forEach((diagnostic, index) => {
        lines.push(`${index + 1}. [${diagnostic.severity}] ${diagnostic.code}`)
        lines.push(`   Message: ${diagnostic.message}`)
        appendDiagnosticDetails(lines, diagnostic.details)
    })

    return lines.join('\n')
}

function createNativeErrorOptions(cause: unknown | undefined): ErrorOptions | undefined {
    if (cause === undefined) {
        return undefined
    }

    return {
        cause
    }
}

function createDiagnostic(diagnostic: Diagnostic): Diagnostic {
    if (diagnostic.details === undefined) {
        return {
            code: diagnostic.code,
            severity: diagnostic.severity,
            message: diagnostic.message
        }
    }

    return diagnostic
}

function appendDiagnosticDetails(lines: string[], details: unknown): void {
    const detailsLines = formatDiagnosticDetails(details)

    if (detailsLines.length === 0) {
        return
    }

    lines.push('   Details:')

    for (const line of detailsLines) {
        lines.push(`     ${line}`)
    }
}

function formatDiagnosticDetails(details: unknown): string[] {
    if (details === undefined) {
        return []
    }

    if (!isRecord(details)) {
        return [`value: ${formatDetailValue('value', details)}`]
    }

    const entries = Object.entries(details)

    if (entries.length === 0) {
        return ['{}']
    }

    const lines = entries.slice(0, 12).map(([key, value]) => {
        return `${key}: ${formatDetailValue(key, value)}`
    })

    if (entries.length > 12) {
        lines.push(`... ${entries.length - 12} more detail fields`)
    }

    return lines
}

function formatDetailValue(key: string, value: unknown): string {
    if (typeof value === 'string') {
        if (value.length === 0) {
            return '<empty string>'
        }

        if (shouldRenderStringWithoutQuotes(key)) {
            return value
        }

        return JSON.stringify(value)
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value)
    }

    if (value === undefined) {
        return 'undefined'
    }

    if (value === null) {
        return 'null'
    }

    if (typeof value === 'symbol') {
        return '[symbol]'
    }

    if (typeof value === 'function') {
        return '[function]'
    }

    if (Array.isArray(value)) {
        return formatDetailArray(key, value)
    }

    return '[object]'
}

function formatDetailArray(key: string, values: readonly unknown[]): string {
    if (values.length === 0) {
        return '[]'
    }

    if (shouldRenderStringArrayAsPath(key, values)) {
        return values.join(' -> ')
    }

    const renderedValues = values.slice(0, 8).map((value) => formatDetailValue('value', value))

    if (values.length > 8) {
        renderedValues.push(`... ${values.length - 8} more`)
    }

    return `[${renderedValues.join(', ')}]`
}

function shouldRenderStringWithoutQuotes(key: string): boolean {
    return (
        key === 'tokenId' ||
        key === 'tokenIds' ||
        key === 'kind' ||
        key === 'reason' ||
        key === 'expectedKind' ||
        key === 'actualKind' ||
        key === 'action' ||
        key === 'accessMethod' ||
        key === 'valueType' ||
        key.endsWith('Id') ||
        key.endsWith('Ids')
    )
}

function shouldRenderStringArrayAsPath(
    key: string,
    values: readonly unknown[]
): values is string[] {
    return (
        (key === 'tokenIds' || key.endsWith('Path')) &&
        values.every((value) => {
            return typeof value === 'string'
        })
    )
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getUnknownValueType(value: unknown): string {
    if (value === null) {
        return 'null'
    }

    if (Array.isArray(value)) {
        return 'array'
    }

    return typeof value
}
