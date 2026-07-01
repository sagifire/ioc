import { createComposer } from '@sagifire/ioc'
import { createNextRuntime } from '@sagifire/ioc-next'

import { contactRequestsModule, requestContextModule } from './contact-requests.js'

export const appRuntime = createNextRuntime(() => {
    return createComposer().use(requestContextModule).use(contactRequestsModule).compose()
})
