import { describe, expect, it } from 'vitest'
import { controlledRobotWheelsGap } from './constants'
import { ControlledRobot } from './ControlledRobot'

describe('buildMove', () => {
    it('goes in a straight line (angle 0)', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.buildMove(100, 100)
        expect([robot.lastStep.x, robot.lastStep.y, robot.lastStep.orientation]).toEqual([
            500, 400, 0,
        ])
    })

    it('goes in a straight line (angle 45°)', () => {
        const robot = new ControlledRobot('yellow', 500, 500, Math.PI / 4)
        robot.buildMove(100, 100)
        expect([robot.lastStep.x, robot.lastStep.y, robot.lastStep.orientation]).toEqual([
            500 + 50 * Math.sqrt(2),
            500 - 50 * Math.sqrt(2),
            Math.PI / 4,
        ])
    })

    it('spins around the center of rotation', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.buildMove(
            (controlledRobotWheelsGap / 4) * Math.PI,
            (-controlledRobotWheelsGap / 4) * Math.PI
        )
        expect([robot.lastStep.x, robot.lastStep.y, robot.lastStep.orientation]).toEqual([
            500,
            500,
            Math.PI / 2,
        ])
    })

    it('spins around the right wheel', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.buildMove(Math.PI * controlledRobotWheelsGap, 0)
        expect([robot.lastStep.x, robot.lastStep.y, robot.lastStep.orientation]).toEqual([
            500 + controlledRobotWheelsGap,
            500,
            Math.PI,
        ])
    })

    it('spins around the left wheel', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.buildMove(0, Math.PI * controlledRobotWheelsGap)
        expect([robot.lastStep.x, robot.lastStep.y, robot.lastStep.orientation]).toEqual([
            500 - controlledRobotWheelsGap,
            500,
            -Math.PI,
        ])
    })

    it('spins backwards around the left wheel', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.buildMove(0, (-Math.PI * controlledRobotWheelsGap) / 2)
        expect([robot.lastStep.x, robot.lastStep.y, robot.lastStep.orientation]).toEqual([
            500 - controlledRobotWheelsGap / 2,
            500 + controlledRobotWheelsGap / 2,
            Math.PI / 2,
        ])
    })

    it('describes a ratio 2:1 circle anticlockwise', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        robot.buildMove(
            (controlledRobotWheelsGap * Math.PI) / 2,
            controlledRobotWheelsGap * Math.PI
        )
        expect([robot.lastStep.x, robot.lastStep.y, robot.lastStep.orientation]).toBeCloseToArray([
            500 - controlledRobotWheelsGap * 1.5,
            500 - controlledRobotWheelsGap * 1.5,
            -Math.PI / 2,
        ])
    })

    it('describes a ratio 2:1 circle clockwise', () => {
        const robot = new ControlledRobot('yellow', 500, 500, Math.PI / 2)
        robot.buildMove(
            controlledRobotWheelsGap * Math.PI,
            (controlledRobotWheelsGap * Math.PI) / 2
        )
        expect([robot.lastStep.x, robot.lastStep.y, robot.lastStep.orientation]).toBeCloseToArray([
            500 + controlledRobotWheelsGap * 1.5,
            500 + controlledRobotWheelsGap * 1.5,
            Math.PI,
        ])
    })
})
