import { createComposer } from '@sagifire/ioc'
import { createNextRuntime } from '@sagifire/ioc-next'

import { contactRequestsModule, requestContextModule } from './contact-requests.js'

export function createAppComposer() {
    return createComposer().use(requestContextModule).use(contactRequestsModule)
}

export const appRuntime = createNextRuntime(() => {
    return createAppComposer().compose()
})
