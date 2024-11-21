import 'vitest'

declare module 'vitest' {
    interface Assertion<T = any> {
        toBeCloseToArray(expected: number[], tolerance?: number): void
    }
    interface AsymmetricMatchersContaining {
        toBeCloseToArray(expected: number[], tolerance?: number): void
    }
}
