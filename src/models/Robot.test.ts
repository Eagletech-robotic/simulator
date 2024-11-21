import { describe, expect, it } from 'vitest'
import { ControlledRobot } from './Robot'

describe('moveFromWheelRotationDistances', () => {
    it('goes in a straight line', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.moveFromWheelRotationDistances(100, 100)
        expect([robot.x, robot.y, robot.orientation]).toEqual([600, 500, 0])
    })

    it('turns around the center of rotation', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.moveFromWheelRotationDistances(
            (robot.wheelsGap / 4) * Math.PI,
            (-robot.wheelsGap / 4) * Math.PI
        )
        expect([robot.x, robot.y, robot.orientation]).toEqual([500, 500, -Math.PI / 2])
    })
})
