import { Canvas } from './Canvas'
import { ControlledRobot, GenericRobot, SequentialRobot } from './Robot'

export class Game {
    private _robots: Array<GenericRobot>
    private _lastStepNumber = 0

    constructor() {
        this._robots = [
            new ControlledRobot('blue', 1775, 1775, 0),
            new SequentialRobot('blue', 2925, 125, -Math.PI / 2),
            new SequentialRobot('blue', 2925, 325, -Math.PI / 2),
            new ControlledRobot('yellow', 1225, 1775, 0),
            new SequentialRobot('yellow', 75, 125, Math.PI / 2),
            new SequentialRobot('yellow', 75, 325, Math.PI / 2),
        ]
    }

    get lastStepNumber() {
        return this._lastStepNumber
    }

    draw(canvas: Canvas, stepNb = this._lastStepNumber) {
        canvas.clearCanvas()
        this._robots.forEach((robot) => robot.draw(canvas, stepNb))
    }

    async restart() {
        await Promise.all(this._robots.map((robot) => robot.reset()))
        this._lastStepNumber = 0
    }

    get robots() {
        return this._robots
    }

    nextStep(): void {
        this._robots.map((r) => r.nextStep())
        this._lastStepNumber++
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
