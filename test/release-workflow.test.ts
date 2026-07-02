import { describe, expect, test } from 'vitest'

import releaseWorkflowSource from '../.github/workflows/release.yml?raw'

describe('release workflow', () => {
    test('uses a stable Changesets release action ref', () => {
        expect(releaseWorkflowSource).toContain('uses: changesets/action@v1')
        expect(releaseWorkflowSource).not.toContain('uses: changesets/action@v2')
    })
})
