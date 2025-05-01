import { Canvas } from './Canvas'
import { ControlledRobot } from './ControlledRobot'
import { GenericRobot } from './GenericRobot'
import { PamiRobot } from './PamiRobot'

export class Game {
    private _robots: Array<GenericRobot>
    private _lastStepNumber = 0

    constructor() {
        this._robots = [
            new ControlledRobot('blue', 1.775, 0.225, Math.PI / 2),
            // new ControlledRobot('blue', .225, 0.875, 0),
            new PamiRobot('blue', 2.925, 1.875, Math.PI),
            new PamiRobot('blue', 2.925, 1.675, Math.PI),

            new ControlledRobot('yellow', 1.225, 0.225, Math.PI / 2),
            // new ControlledRobot('yellow', 2.775, 0.875, Math.PI),
            new PamiRobot('yellow', .175, 1.875, 0),
            new PamiRobot('yellow', .175, 1.675, 0),
        ]
    }

    get lastStepNumber() {
        return this._lastStepNumber
    }

    draw(canvas: Canvas, selectedRobotId: number | null = null, stepNb = this._lastStepNumber) {
        canvas.clearCanvas()
        this._robots.forEach((robot) => {
            robot.draw(canvas, stepNb, robot.id === selectedRobotId)
        })
    }

    get nbRobots() {
        return this._robots.length
    }

    get firstRobotId() {
        return this._robots[0].id
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

    onSimulationEnd() {
        this._robots.forEach((robot) => robot.onSimulationEnd())
    }

    appendRobot(robot: GenericRobot) {
        this._robots.push(robot)
    }

    updateRobot(id: number, newRobot: GenericRobot) {
        const index = this._robots.findIndex((robot) => robot.id === id)
        if (index !== -1) {
            this._robots[index] = newRobot
        }
    }

    deleteRobot(id: number) {
        const index = this._robots.findIndex((robot) => robot.id === id)
        if (index !== -1) {
            this._robots.splice(index, 1)
        }
    }

    getRobotById(id: number): GenericRobot | null {
        return this._robots.find((robot) => robot.id === id) || null
    }
}
