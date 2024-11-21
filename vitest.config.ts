import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: ['./src/utils/vitest/vitest.setup.ts'],
    },
})
