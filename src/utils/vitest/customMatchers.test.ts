import { describe, expect, test } from 'vitest'

describe('toBeCloseToArray', () => {
    test('compare float arrays', () => {
        const arr1 = [0.1 + 0.2, 0.3]
        const arr2 = [0.3, 0.3]
        expect(arr1).toBeCloseToArray(arr2)
    })

    test('fails with correct message', () => {
        const arr1 = [0.1 + 0.2, 0.4, 0.5]
        const arr2 = [0.3, 0.3, 0.7]

        expect(() => {
            expect(arr1).toBeCloseToArray(arr2, 0.0001)
        }).toThrowError(/Expected: \[0\.3,0\.3,0\.7\]\nReceived: \[0.\d*,0\.4,0\.5\]/)
    })
})
