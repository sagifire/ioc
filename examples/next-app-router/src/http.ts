export interface JsonResponse<TBody> {
    readonly status: number
    readonly body: TBody
    readonly headers: {
        readonly 'content-type': 'application/json'
    }
}

export function json<TBody>(body: TBody, status = 200): JsonResponse<TBody> {
    return {
        status,
        body,
        headers: {
            'content-type': 'application/json'
        }
    }
}
