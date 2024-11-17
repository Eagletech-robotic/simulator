import { GenericRobot } from './Robot'

export class Step {
    private _robots: Array<GenericRobot> = []

    get robots() {
        return this._robots
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
