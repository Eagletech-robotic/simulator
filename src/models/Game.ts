import { Canvas } from './Canvas'
import { ControlledRobot, GenericRobot, SequentialRobot } from './Robot'
import { stepDurationMs } from './constants'

export class Game {
    private _robots: Array<GenericRobot>
    private _currentStepNumber = 0

    constructor() {
        this._robots = [
            new ControlledRobot('blue', 250, 250, Math.PI / 2),
            /*new SequentialRobot('blue', 100, 2900, Math.PI / 2),
            new SequentialRobot('blue', 100, 2700, Math.PI / 2),
            new ControlledRobot('yellow', 2750, 250, -Math.PI / 2),
            new SequentialRobot('yellow', 2900, 2900, -Math.PI / 2),
            new SequentialRobot('yellow', 2900, 2700, -Math.PI / 2),*/
        ]
    }

    get currentStepNumber() {
        return this._currentStepNumber
    }

    get simulatedTimeMs() {
        return this._currentStepNumber * stepDurationMs
    }

    draw(canvas: Canvas, stepNb = this._currentStepNumber) {
        canvas.clearCanvas()
        this._robots.forEach((robot) => robot.draw(canvas, stepNb))
    }

    async restart() {
        await Promise.all(this._robots.map((robot) => robot.restart()))
    }

    get robots() {
        return this._robots
    }

    nextStep(): void {
        this._robots.map((r) => r.nextStep())
        this._currentStepNumber++
    }

    appendRobot(robot: GenericRobot) {
        this._robots.push(robot)
    }

    updateRobot(id: number, newRobot: GenericRobot) {
        const index = this.getRobotIndexFromId(id)
        if (index !== null) {
            this._robots[index] = newRobot
        }
    }

    deleteRobot(id: number) {
        const index = this.getRobotIndexFromId(id)
        if (index !== null) {
            this._robots.splice(index, 1)
        }
    }

    private getRobotIndexFromId(id: number): number | null {
        const index = this._robots.findIndex((robot) => robot.id === id)
        if (index !== -1) {
            return index
        } else {
            return null
        }
    }
}
