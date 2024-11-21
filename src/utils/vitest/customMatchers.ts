import { expect } from 'vitest'

expect.extend({
    toBeCloseToArray(received: number[], expected: number[], tolerance = 0.00001) {
        if (!Array.isArray(received) || !Array.isArray(expected)) {
            return {
                message: () => `Expected both values to be arrays`,
                pass: false,
            }
        }

        if (received.length !== expected.length) {
            return {
                message: () =>
                    `Expected arrays to have the same length, but received lengths ${received.length} (got) and ${expected.length} (expected)`,
                pass: false,
            }
        }

        const differences = received
            .map((value, index) => ({
                index,
                received: value,
                expected: expected[index],
                difference: Math.abs(value - expected[index]),
            }))
            .filter((item) => item.difference > tolerance)

        const pass = received.every(
            (value, index) => Math.abs(value - expected[index]) <= tolerance
        )

        if (pass) {
            return {
                message: () => `Expected arrays to not be close element-wise within ${tolerance}`,
                pass: true,
            }
        } else {
            return {
                message: () =>
                    `Expected: ${JSON.stringify(expected)}\nReceived: ${JSON.stringify(received)}`,
                pass: false,
            }
        }
    },
})
