import { describe, expect, expectTypeOf, test } from 'vitest'

import {
    InvalidTokenIdError,
    contributionToken,
    multiToken,
    namespace,
    token,
    type ContributionToken,
    type MultiToken,
    type Token
} from '../src/tokens.js'

interface Logger {
    log(message: string): void
}

interface PublicApi {
    handle(): string
}

interface AdminContribution {
    mount(): string
}

type TokenValue<TToken> = TToken extends Token<infer TValue> ? TValue : never

describe('tokens', () => {
    test('creates a token with a stable id', () => {
        const logger = token<Logger>('logger')

        expect(logger).toEqual({
            id: 'logger'
        })
        expect('__type' in logger).toBe(false)
    })

    test('preserves an explicit description', () => {
        const logger = token<Logger>('logger', {
            description: 'Application logger'
        })

        expect(logger).toEqual({
            id: 'logger',
            description: 'Application logger'
        })
    })

    test('omits description when it is undefined at runtime', () => {
        const logger = token<Logger>('logger', {
            description: undefined
        } as unknown as { readonly description?: string })

        expect(logger).toEqual({
            id: 'logger'
        })
        expect(Object.hasOwn(logger, 'description')).toBe(false)
    })

    test('creates namespaced tokens with stable prefixed ids', () => {
        const contactRequests = namespace('contact-requests')
        const publicApi = contactRequests.token<PublicApi>('public-api', {
            description: 'Contact requests public API'
        })

        expect(contactRequests.id).toBe('contact-requests')
        expect(publicApi).toEqual({
            id: 'contact-requests.public-api',
            description: 'Contact requests public API'
        })
    })

    test.each(['', ' logger', 'logger ', 'logger name', 'logger\tname', 'логер', 'logger#name'])(
        'rejects invalid token id %j',
        (id) => {
            expect(() => token<Logger>(id)).toThrow(InvalidTokenIdError)
            expect(() => token<Logger>(id)).toThrow(/Invalid token id/)
        }
    )

    test.each(['', ' contact-requests', 'contact requests', 'контакти'])(
        'rejects invalid namespace id %j',
        (id) => {
            expect(() => namespace(id)).toThrow(InvalidTokenIdError)
            expect(() => namespace(id)).toThrow(/Invalid namespace id/)
        }
    )

    test('rejects non-string ids from JavaScript callers', () => {
        expect(() => token<Logger>(undefined as unknown as string)).toThrow(InvalidTokenIdError)
        expect(() => namespace(123 as unknown as string)).toThrow(InvalidTokenIdError)
    })

    test('preserves token value inference', () => {
        const logger = token<Logger>('logger')
        const publicApi = namespace('contact-requests').token<PublicApi>('public-api')

        expect(publicApi.id).toBe('contact-requests.public-api')
        expectTypeOf(logger).toEqualTypeOf<Token<Logger>>()
        expectTypeOf<TokenValue<typeof logger>>().toEqualTypeOf<Logger>()
        expectTypeOf<TokenValue<typeof publicApi>>().toEqualTypeOf<PublicApi>()
    })

    test('creates multi and contribution tokens as additive typed token helpers', () => {
        const multi = multiToken<AdminContribution>('admin.contributions', {
            description: 'Admin contributions'
        })
        const contribution = contributionToken<AdminContribution>('admin.nav')
        const regular = token<AdminContribution>('admin.regular')

        expect(multi).toEqual({
            id: 'admin.contributions',
            description: 'Admin contributions'
        })
        expect(contribution).toEqual({
            id: 'admin.nav'
        })
        expect(Object.hasOwn(multi, '__cardinality')).toBe(false)

        expectTypeOf(multi).toEqualTypeOf<MultiToken<AdminContribution>>()
        expectTypeOf(contribution).toEqualTypeOf<ContributionToken<AdminContribution>>()
        expectTypeOf(contribution).toEqualTypeOf<MultiToken<AdminContribution>>()
        expectTypeOf(multi).toMatchTypeOf<Token<AdminContribution>>()
        expectTypeOf<TokenValue<typeof multi>>().toEqualTypeOf<AdminContribution>()
        expectTypeOf<TokenValue<typeof contribution>>().toEqualTypeOf<AdminContribution>()

        // @ts-expect-error ordinary tokens do not carry the multi-token compile-time marker
        const rejectedMulti: MultiToken<AdminContribution> = regular

        expect(rejectedMulti).toBe(regular)
    })

    test('creates namespaced multi and contribution tokens with stable prefixed ids', () => {
        const admin = namespace('admin')
        const multi = admin.multiToken<AdminContribution>('contributions')
        const contribution = admin.contributionToken<AdminContribution>('nav')

        expect(multi).toEqual({
            id: 'admin.contributions'
        })
        expect(contribution).toEqual({
            id: 'admin.nav'
        })
        expectTypeOf(multi).toEqualTypeOf<MultiToken<AdminContribution>>()
        expectTypeOf(contribution).toEqualTypeOf<ContributionToken<AdminContribution>>()
        expectTypeOf(contribution).toMatchTypeOf<Token<AdminContribution>>()
    })
})
