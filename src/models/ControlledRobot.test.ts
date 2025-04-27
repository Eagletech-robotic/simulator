import { describe, expect, it } from 'vitest'
import { controlledRobotWheelbase } from './constants'
import { ControlledRobot } from './ControlledRobot'

describe('buildMove', () => {
    it('goes in a straight line (angle 0)', () => {
        const robot = new ControlledRobot('yellow', 0.5, 0.5, 0)
        const move = robot.buildMove(0.1, 0.1)
        expect([move.x, move.y, move.orientation]).toEqual([
            0.5, 0.4, 0,
        ])
    })

    it('goes in a straight line (angle 45°)', () => {
        const robot = new ControlledRobot('yellow', 500, 500, Math.PI / 4)
        const move = robot.buildMove(100, 100)
        expect([move.x, move.y, move.orientation]).toEqual([
            500 + 50 * Math.sqrt(2),
            500 - 50 * Math.sqrt(2),
            Math.PI / 4,
        ])
    })

    it('spins around the center of rotation', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        const move = robot.buildMove(
            (controlledRobotWheelbase / 4) * Math.PI,
            (-controlledRobotWheelbase / 4) * Math.PI,
        )
        expect([move.x, move.y, move.orientation]).toBeCloseToArray([
            500,
            500,
            Math.PI / 2,
        ])
    })

    it('spins around the right wheel', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        const move = robot.buildMove(Math.PI * controlledRobotWheelbase, 0)
        expect([move.x, move.y, move.orientation]).toBeCloseToArray([
            500 + controlledRobotWheelbase,
            500,
            Math.PI,
        ])
    })

    it('spins around the left wheel', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        const move = robot.buildMove(0, Math.PI * controlledRobotWheelbase)
        expect([move.x, move.y, move.orientation]).toBeCloseToArray([
            500 - controlledRobotWheelbase,
            500,
            -Math.PI,
        ])
    })

    it('spins backwards around the left wheel', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        const move = robot.buildMove(0, (-Math.PI * controlledRobotWheelbase) / 2)
        expect([move.x, move.y, move.orientation]).toBeCloseToArray([
            500 - controlledRobotWheelbase / 2,
            500 + controlledRobotWheelbase / 2,
            Math.PI / 2,
        ])
    })

    it('describes a ratio 2:1 circle anticlockwise', () => {
        const robot = new ControlledRobot('yellow', 500, 500, 0)
        const move = robot.buildMove(
            (controlledRobotWheelbase * Math.PI) / 2,
            controlledRobotWheelbase * Math.PI,
        )
        expect([move.x, move.y, move.orientation]).toBeCloseToArray([
            500 - controlledRobotWheelbase * 1.5,
            500 - controlledRobotWheelbase * 1.5,
            -Math.PI / 2,
        ])
    })

    it('describes a ratio 2:1 circle clockwise', () => {
        const robot = new ControlledRobot('yellow', 500, 500, Math.PI / 2)
        const move = robot.buildMove(
            controlledRobotWheelbase * Math.PI,
            (controlledRobotWheelbase * Math.PI) / 2,
        )
        expect([move.x, move.y, move.orientation]).toBeCloseToArray([
            500 + controlledRobotWheelbase * 1.5,
            500 + controlledRobotWheelbase * 1.5,
            Math.PI,
        ])
    })
})
