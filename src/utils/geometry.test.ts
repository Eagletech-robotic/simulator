// geometry.test.ts
import { describe, expect, it } from 'vitest'
import { distanceSegmentSegment, distanceSegmentCircle } from './geometry'

describe('distanceSegmentSegment', () => {
    it('intersects at the middle', () => {
        const d = distanceSegmentSegment(0, 0, 10, 0, 5, -5, 5, 5)
        expect(d).toBeCloseTo(5)
    })
    it('returns null when segments do not cross', () => {
        const d = distanceSegmentSegment(0, 0, 10, 0, 0, 1, 10, 1)
        expect(d).toBeNull()
    })
})

describe('distanceSegmentCircle', () => {
    it('hits circle centred on the path', () => {
        const d = distanceSegmentCircle(0, 0, 10, 0, 5, 0, 1)
        expect(d).toBeCloseTo(4)
    })
    it('returns null when path misses the circle', () => {
        const d = distanceSegmentCircle(0, 0, 10, 0, 5, 3, 1)
        expect(d).toBeNull()
    })
})
