import { Canvas } from './Canvas'
import { GenericRobot } from './Robot'

export class Game {
    private _robots: Array<GenericRobot>
    private canvas: Canvas

    constructor(canvas: HTMLCanvasElement) {
        this._robots = []
        this.canvas = new Canvas(canvas, this)
    }

    get robots() {
        return this._robots
    }

    private gameChanged() {
        this.canvas.updateGame(this)
        this.canvas.draw()
    }

    appendRobot(robot: GenericRobot) {
        this._robots.push(robot)
        this.gameChanged()
    }

    updateRobot(id: number, newRobot: GenericRobot) {
        const index = this.getRobotIndexFromId(id)
        if (index !== null) {
            this._robots[index] = newRobot
            this.gameChanged()
        }
    }

    deleteRobot(id: number) {
        const index = this.getRobotIndexFromId(id)
        if (index !== null) {
            this._robots.splice(index, 1)
            this.gameChanged()
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
