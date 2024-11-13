import { GenericRobot } from './Robot'

export class Game {
    private robots: Array<GenericRobot>

    constructor() {
        this.robots = []
    }

    appendRobot(robot: GenericRobot) {
        this.robots.push(robot)
    }

    updateRobot(id: number, newRobot: GenericRobot) {
        const index = this.getRobotIndexFromId(id)
        if (index) {
            this.robots[index] = newRobot
        }
    }

    deleteRobot(id: number) {
        const index = this.getRobotIndexFromId(id)
        if (index !== null) {
            this.robots.splice(index, 1)
        }
    }

    private getRobotIndexFromId(id: number): number | null {
        const index = this.robots.findIndex((robot) => robot.id === id)
        if (index !== -1) {
            return index
        } else {
            return null
        }
    }

    getRobots() {
        return this.robots
    }
}
