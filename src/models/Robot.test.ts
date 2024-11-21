import { describe, expect, it } from 'vitest'
import { ControlledRobot } from './Robot'

describe('moveFromWheelRotationDistances', () => {
    it('goes in a straight line (angle 0)', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.moveFromWheelRotationDistances(100, 100)
        expect([robot.x, robot.y, robot.orientation]).toEqual([500, 400, 0])
    })

    it('goes in a straight line (angle 45°)', () => {
        const robot = new ControlledRobot('yellow', 500, 500, Math.PI / 4)
        robot.moveFromWheelRotationDistances(100, 100)
        expect([robot.x, robot.y, robot.orientation]).toEqual([
            500 + 50 * Math.sqrt(2),
            500 - 50 * Math.sqrt(2),
            Math.PI / 4,
        ])
    })

    it('spins around the center of rotation', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.moveFromWheelRotationDistances(
            (robot.wheelsGap / 4) * Math.PI,
            (-robot.wheelsGap / 4) * Math.PI
        )
        expect([robot.x, robot.y, robot.orientation]).toEqual([500, 500, Math.PI / 2])
    })

    it('spins around the right wheel', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.moveFromWheelRotationDistances(Math.PI * robot.wheelsGap, 0)
        expect([robot.x, robot.y, robot.orientation]).toEqual([500 + robot.wheelsGap, 500, Math.PI])
    })

    it('describes a ratio 2:1 circle anticlockwise', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.moveFromWheelRotationDistances(
            (robot.wheelsGap * Math.PI) / 2,
            robot.wheelsGap * Math.PI
        )
        expect([robot.x, robot.y, robot.orientation]).toBeCloseToArray([
            500 - robot.wheelsGap * 1.5,
            500 - robot.wheelsGap * 1.5,
            -Math.PI / 2,
        ])
    })

    it('describes a ratio 2:1 circle clockwise', () => {
        const robot = new ControlledRobot('yellow', 500, 500, Math.PI / 2)
        robot.moveFromWheelRotationDistances(
            robot.wheelsGap * Math.PI,
            (robot.wheelsGap * Math.PI) / 2
        )
        expect([robot.x, robot.y, robot.orientation]).toBeCloseToArray([
            500 + robot.wheelsGap * 1.5,
            500 + robot.wheelsGap * 1.5,
            Math.PI,
        ])
    })
})
